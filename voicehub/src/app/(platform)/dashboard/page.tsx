import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/server/auth";
import { getDashboardData } from "@/server/services/voicehub-service";

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getDashboardData(user.id);

  return (
    <div className="space-y-4">
      <Card className="rounded-[2rem] bg-white/80">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Dashboard</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Everything in VoiceHub, at a glance
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600">
          Shared metrics across speech-to-text and text-to-speech, recent activity, and a clean entry point for future SaaS controls like billing and quotas.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-[2rem]">
          <p className="text-sm text-slate-500">Transcripts</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{data.transcriptCount}</p>
        </Card>
        <Card className="rounded-[2rem]">
          <p className="text-sm text-slate-500">Generated audio files</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{data.voiceCount}</p>
        </Card>
        <Card className="rounded-[2rem]">
          <p className="text-sm text-slate-500">Transcribed minutes</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{data.transcriptionMinutes}</p>
        </Card>
        <Card className="rounded-[2rem]">
          <p className="text-sm text-slate-500">TTS characters this month</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{data.charactersThisMonth}</p>
        </Card>
      </div>

      <Card className="rounded-[2rem]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Recent activity</h2>
            <p className="mt-1 text-sm text-slate-600">
              Unified history across transcription and voice generation jobs.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {data.recentJobs.map((job) => (
            <div key={job.id} className="rounded-[1.5rem] border border-border bg-white/70 p-4">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-medium text-slate-900">{job.title || `${job.kind} job`}</p>
                  <p className="text-sm text-slate-500">
                    {job.kind} - {new Date(job.createdAt).toLocaleString()} - {job.model}
                  </p>
                </div>
                <Badge>{job.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
