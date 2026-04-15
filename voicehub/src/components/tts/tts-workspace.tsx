"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, FileAudio, Trash2 } from "lucide-react";
import { audioOutputFormats, pitchOptions, voiceOptions } from "@/lib/constants";
import { formatBytes } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type VoiceOutputItem = {
  id: string;
  title: string;
  text: string;
  voice: string;
  speed: number;
  pitch: string | null;
  outputFormat: string;
  createdAt: string;
  sourceAssetId: string | null;
  outputAssetId: string | null;
  outputAssetName: string | null;
  outputAssetSize: number | null;
};

function VoiceOutputCard({ item }: { item: VoiceOutputItem }) {
  const router = useRouter();

  async function deleteItem() {
    const confirmed = window.confirm("Delete this generated audio file?");
    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/voice-outputs/${item.id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <Card className="rounded-[2rem]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge>{item.voice}</Badge>
              <Badge className="bg-slate-900/5 text-slate-700">{item.outputFormat.toUpperCase()}</Badge>
            </div>
            <h2 className="mt-3 text-xl font-semibold text-slate-950">{item.title}</h2>
            <p className="mt-2 text-sm text-slate-500">
              {new Date(item.createdAt).toLocaleString()} - speed {item.speed.toFixed(2)} - {item.pitch || "neutral"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {item.outputAssetId ? (
              <a href={`/api/assets/${item.outputAssetId}`}>
                <Button variant="secondary" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </a>
            ) : null}
            <Button variant="danger" className="gap-2" onClick={deleteItem}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {item.outputAssetId ? (
          <audio controls className="w-full" src={`/api/assets/${item.outputAssetId}`} />
        ) : null}

        <p className="rounded-[1.75rem] bg-white/70 p-4 text-sm leading-6 text-slate-700">
          {item.text}
        </p>

        {item.outputAssetName ? (
          <p className="text-sm text-slate-500">
            Stored as {item.outputAssetName}
            {item.outputAssetSize ? ` (${formatBytes(item.outputAssetSize)})` : ""}
          </p>
        ) : null}
      </div>
    </Card>
  );
}

export function TtsWorkspace({ outputs }: { outputs: VoiceOutputItem[] }) {
  const router = useRouter();
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [voice, setVoice] = useState("marin");
  const [speed, setSpeed] = useState("1");
  const [pitch, setPitch] = useState("neutral");
  const [format, setFormat] = useState("mp3");
  const [progress, setProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function startProgress() {
    setProgress(12);
    progressTimerRef.current = setInterval(() => {
      setProgress((current) => Math.min(current + 8, 92));
    }, 350);
  }

  function stopProgress() {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    setProgress(100);
  }

  async function handleTextFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const content = await file.text();
    setText(content);
    setSourceName(file.name);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!text.trim()) {
      setError("Enter or upload text before generating speech.");
      return;
    }

    setSubmitting(true);
    startProgress();

    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        text,
        sourceName: sourceName || undefined,
        voice,
        speed: Number(speed),
        pitch,
        format,
      }),
    });

    const result = await response.json().catch(() => null);
    stopProgress();
    setSubmitting(false);

    if (!response.ok) {
      setError(result?.error ?? "Unable to generate speech.");
      return;
    }

    setMessage("Audio generated and saved to your library.");
    setTitle("");
    setText("");
    setSourceName("");
    router.refresh();
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
      <Card className="rounded-[2rem]">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Text to Speech</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            Generate polished voiceovers and spoken content
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Choose a voice, tune speed and tone, and keep every generated clip in a shared VoiceHub history.
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Voiceover title</label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Homepage teaser"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Text</label>
            <Textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Paste the script or narration you want to turn into speech..."
            />
            <p className="mt-2 text-sm text-slate-500">{text.length} / 4000 characters</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Upload text file</label>
            <Input type="file" accept=".txt,.md,text/plain" onChange={handleTextFile} />
            {sourceName ? <p className="mt-2 text-sm text-slate-500">Loaded {sourceName}</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Voice</label>
              <Select value={voice} onChange={(event) => setVoice(event.target.value)}>
                {voiceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.tone}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Pitch style</label>
              <Select value={pitch} onChange={(event) => setPitch(event.target.value)}>
                {pitchOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Speed</label>
              <Input
                type="number"
                min={0.25}
                max={4}
                step={0.05}
                value={speed}
                onChange={(event) => setSpeed(event.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Output format</label>
              <Select value={format} onChange={(event) => setFormat(event.target.value)}>
                {audioOutputFormats.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {submitting ? (
            <div className="space-y-2 rounded-2xl bg-white/70 p-4">
              <p className="text-sm text-slate-600">Generating natural speech and saving the audio asset...</p>
              <ProgressBar value={progress} />
            </div>
          ) : null}

          {error ? <p className="text-sm text-danger">{error}</p> : null}
          {message ? <p className="text-sm text-slate-600">{message}</p> : null}

          <Button type="submit" className="w-full py-3" disabled={submitting}>
            {submitting ? "Generating..." : "Generate audio"}
          </Button>
        </form>
      </Card>

      <div className="space-y-4">
        {outputs.length ? (
          outputs.map((item) => <VoiceOutputCard key={item.id} item={item} />)
        ) : (
          <Card className="rounded-[2rem]">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent-strong">
                <FileAudio className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-medium text-slate-900">No generated audio yet</p>
                <p className="mt-2 text-sm text-slate-600">
                  VoiceHub will keep every TTS result here with playback, download, and history controls.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
