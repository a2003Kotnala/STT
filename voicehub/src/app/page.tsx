import Link from "next/link";
import { ArrowRight, Mic, Sparkles, Waves } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/server/auth";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <main className="page-shell py-6 sm:py-10">
      <section className="glass-panel relative overflow-hidden rounded-[2.5rem] bg-hero-glow p-6 sm:p-10 lg:p-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-sm text-slate-700">
              <Waves className="h-4 w-4 text-accent-strong" />
              Premium AI audio workspace
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
              VoiceHub brings transcription and speech generation into one trusted platform.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Upload recordings, capture audio from the browser, edit timestamped transcripts, generate natural voiceovers, and manage every asset from one account.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={user ? "/dashboard" : "/register"}
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                {user ? "Open dashboard" : "Start with VoiceHub"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={user ? "/studio/stt" : "/login"}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-5 py-3 text-sm font-medium text-slate-800 transition hover:bg-white"
              >
                Explore the workspace
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <Card className="rounded-[2rem] bg-white/75">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent-strong">
                  <Mic className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-950">Speech to text</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Audio upload, browser recording, timestamps, diarization, editing, and export.
                  </p>
                </div>
              </div>
            </Card>
            <Card className="rounded-[2rem] bg-white/75">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-950">Text to speech</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Voice selection, output formats, speech history, and reusable asset storage.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="rounded-[2rem]">
          <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Unified SaaS Core</p>
          <p className="mt-4 text-xl font-semibold text-slate-950">One account, shared jobs, shared history, shared usage tracking.</p>
        </Card>
        <Card className="rounded-[2rem]">
          <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Production Architecture</p>
          <p className="mt-4 text-xl font-semibold text-slate-950">Modular frontend, backend services, provider adapters, and storage abstraction.</p>
        </Card>
        <Card className="rounded-[2rem]">
          <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Future-Ready</p>
          <p className="mt-4 text-xl font-semibold text-slate-950">Ready for teams, billing, quotas, analytics, and new audio AI tools.</p>
        </Card>
      </section>
    </main>
  );
}
