"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clipboard,
  Download,
  Mic,
  PauseCircle,
  Save,
  Trash2,
} from "lucide-react";
import { audioLanguages } from "@/lib/constants";
import { formatBytes, formatSeconds } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type TranscriptItem = {
  id: string;
  title: string;
  text: string;
  languageName: string | null;
  durationSeconds: number | null;
  speakerCount: number | null;
  hasDiarization: boolean;
  createdAt: string;
  sourceAssetId: string | null;
  sourceAssetName: string | null;
  sourceAssetSize: number | null;
  segments: Array<{
    id: string;
    startMs: number;
    endMs: number;
    speakerLabel: string | null;
    text: string;
  }>;
};

function TranscriptCard({ transcript }: { transcript: TranscriptItem }) {
  const router = useRouter();
  const [title, setTitle] = useState(transcript.title);
  const [text, setText] = useState(transcript.text);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function saveTranscript() {
    setSaving(true);
    setMessage(null);
    const response = await fetch(`/api/transcripts/${transcript.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, text }),
    });

    const result = await response.json().catch(() => null);
    setSaving(false);

    if (!response.ok) {
      setMessage(result?.error ?? "Unable to save transcript.");
      return;
    }

    setMessage("Saved.");
    router.refresh();
  }

  async function deleteTranscript() {
    const confirmed = window.confirm("Delete this transcript and its uploaded source file?");
    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/transcripts/${transcript.id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      router.refresh();
    }
  }

  async function copyTranscript() {
    await navigator.clipboard.writeText(text);
    setMessage("Transcript copied.");
  }

  return (
    <Card className="rounded-[2rem]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{transcript.languageName || "Transcript"}</Badge>
              {transcript.hasDiarization ? <Badge className="bg-amber-100 text-amber-700">Diarization</Badge> : null}
            </div>
            <p className="mt-3 text-sm text-slate-500">
              {new Date(transcript.createdAt).toLocaleString()} - {formatSeconds(transcript.durationSeconds)} -{" "}
              {transcript.speakerCount ?? 1} speaker{transcript.speakerCount === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" className="gap-2" onClick={copyTranscript}>
              <Clipboard className="h-4 w-4" />
              Copy
            </Button>
            <a href={`/api/transcripts/${transcript.id}/export?format=txt`}>
              <Button variant="secondary" className="gap-2">
                <Download className="h-4 w-4" />
                TXT
              </Button>
            </a>
            <a href={`/api/transcripts/${transcript.id}/export?format=docx`}>
              <Button variant="secondary">DOCX</Button>
            </a>
            <a href={`/api/transcripts/${transcript.id}/export?format=srt`}>
              <Button variant="secondary">SRT</Button>
            </a>
            <Button variant="danger" className="gap-2" onClick={deleteTranscript}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <Input value={title} onChange={(event) => setTitle(event.target.value)} />
        <Textarea value={text} onChange={(event) => setText(event.target.value)} className="min-h-[220px]" />

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-sm text-slate-500">
            {transcript.sourceAssetId && transcript.sourceAssetName ? (
              <a
                className="font-medium text-accent-strong hover:underline"
                href={`/api/assets/${transcript.sourceAssetId}`}
              >
                Download source audio ({transcript.sourceAssetName}
                {transcript.sourceAssetSize ? `, ${formatBytes(transcript.sourceAssetSize)}` : ""})
              </a>
            ) : (
              "Transcript exports are ready."
            )}
          </div>
          <Button className="gap-2" onClick={saveTranscript} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>

        {message ? <p className="text-sm text-slate-600">{message}</p> : null}

        {transcript.segments.length ? (
          <div className="rounded-[1.75rem] border border-border bg-white/70 p-4">
            <p className="text-sm font-medium text-slate-700">Timestamp preview</p>
            <div className="mt-3 space-y-3">
              {transcript.segments.map((segment) => (
                <div key={segment.id} className="rounded-2xl bg-slate-50 p-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>
                      {Math.floor(segment.startMs / 1000)}s - {Math.floor(segment.endMs / 1000)}s
                    </span>
                    {segment.speakerLabel ? <Badge>{segment.speakerLabel}</Badge> : null}
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{segment.text}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export function SttWorkspace({ transcripts }: { transcripts: TranscriptItem[] }) {
  const router = useRouter();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("auto");
  const [diarization, setDiarization] = useState(true);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  function startProgress() {
    setProgress(8);
    progressTimerRef.current = setInterval(() => {
      setProgress((current) => Math.min(current + 7, 92));
    }, 450);
  }

  function stopProgress() {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    setProgress(100);
  }

  async function toggleRecording() {
    if (recording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      return;
    }

    setError(null);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
      const recordedFile = new File([blob], `voicehub-recording-${Date.now()}.webm`, {
        type: blob.type || "audio/webm",
      });
      setFile(recordedFile);
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setRecording(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus(null);

    if (!file) {
      setError("Upload an audio file or record from your microphone first.");
      return;
    }

    setSubmitting(true);
    setStatus("Uploading audio and preparing transcription...");
    startProgress();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("language", language);
    formData.append("diarization", String(diarization));

    const response = await fetch("/api/stt", {
      method: "POST",
      body: formData,
    });

    const result = await response.json().catch(() => null);
    stopProgress();
    setSubmitting(false);

    if (!response.ok) {
      setError(result?.error ?? "Unable to transcribe audio.");
      return;
    }

    setStatus("Transcript saved to your library.");
    setFile(null);
    setTitle("");
    router.refresh();
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
      <Card className="rounded-[2rem]">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Speech to Text</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            Transcribe interviews, meetings, and voice notes
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Upload audio, record in-browser, enable diarization, and keep editable transcripts with export-ready timestamps.
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Audio file</label>
            <Input
              type="file"
              accept=".mp3,.wav,.m4a,.ogg,.flac,.webm,audio/*"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
            {file ? (
              <p className="mt-2 text-sm text-slate-500">
                Ready: {file.name} ({formatBytes(file.size)})
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant={recording ? "danger" : "secondary"}
              className="gap-2"
              onClick={toggleRecording}
            >
              {recording ? <PauseCircle className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {recording ? "Stop recording" : "Record from microphone"}
            </Button>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Transcript title</label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Customer discovery call"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Language</label>
            <Select value={language} onChange={(event) => setLanguage(event.target.value)}>
              {audioLanguages.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <label className="flex items-center gap-3 rounded-2xl bg-white/70 p-4 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={diarization}
              onChange={(event) => setDiarization(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
            />
            Enable speaker diarization when the audio has multiple speakers
          </label>

          {submitting ? (
            <div className="space-y-2 rounded-2xl bg-white/70 p-4">
              <p className="text-sm text-slate-600">{status}</p>
              <ProgressBar value={progress} />
            </div>
          ) : null}

          {error ? <p className="text-sm text-danger">{error}</p> : null}
          {status && !submitting ? <p className="text-sm text-slate-600">{status}</p> : null}

          <Button type="submit" className="w-full py-3" disabled={submitting}>
            {submitting ? "Processing..." : "Generate transcript"}
          </Button>
        </form>
      </Card>

      <div className="space-y-4">
        {transcripts.length ? (
          transcripts.map((transcript) => (
            <TranscriptCard key={transcript.id} transcript={transcript} />
          ))
        ) : (
          <Card className="rounded-[2rem]">
            <p className="text-lg font-medium text-slate-900">No transcripts yet</p>
            <p className="mt-2 text-sm text-slate-600">
              Your transcribed files will appear here with edit controls, timestamps, source downloads, and export actions.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
