import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/server/auth";
import { getActivityData } from "@/server/services/voicehub-service";

export default async function ActivityPage() {
  const user = await requireUser();
  const jobs = await getActivityData(user.id);

  return (
    <div className="space-y-4">
      <Card className="rounded-[2rem]">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Activity</h1>
        <p className="mt-3 text-sm text-slate-600">
          Job-level history across transcription and speech generation.
        </p>
      </Card>

      <div className="space-y-3">
        {jobs.map((job) => (
          <Card key={job.id} className="rounded-[2rem]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{job.kind}</Badge>
                  <Badge className="bg-slate-900/5 text-slate-700">{job.model}</Badge>
                </div>
                <p className="mt-3 text-lg font-medium text-slate-950">
                  {job.title || `${job.kind} job`}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {new Date(job.createdAt).toLocaleString()}
                </p>
                {job.errorMessage ? (
                  <p className="mt-2 text-sm text-danger">{job.errorMessage}</p>
                ) : null}
              </div>
              <Badge>{job.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
