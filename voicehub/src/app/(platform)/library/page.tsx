import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/server/auth";
import { getLibraryData } from "@/server/services/voicehub-service";

export default async function LibraryPage() {
  const user = await requireUser();
  const data = await getLibraryData(user.id);

  return (
    <div className="space-y-4">
      <Card className="rounded-[2rem]">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Library</h1>
        <p className="mt-3 text-sm text-slate-600">
          Your full transcript and audio asset history in one place.
        </p>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="rounded-[2rem]">
          <h2 className="text-xl font-semibold text-slate-950">Transcripts</h2>
          <div className="mt-4 space-y-3">
            {data.transcripts.map((item) => (
              <div key={item.id} className="rounded-[1.5rem] border border-border bg-white/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <p className="text-sm text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                  <Badge>{item.languageName || "Transcript"}</Badge>
                </div>
                <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600">{item.text}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a href={`/api/transcripts/${item.id}/export?format=txt`} className="text-sm font-medium text-accent-strong hover:underline">
                    TXT
                  </a>
                  <a href={`/api/transcripts/${item.id}/export?format=docx`} className="text-sm font-medium text-accent-strong hover:underline">
                    DOCX
                  </a>
                  <a href={`/api/transcripts/${item.id}/export?format=srt`} className="text-sm font-medium text-accent-strong hover:underline">
                    SRT
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-[2rem]">
          <h2 className="text-xl font-semibold text-slate-950">Generated audio</h2>
          <div className="mt-4 space-y-3">
            {data.voiceOutputs.map((item) => (
              <div key={item.id} className="rounded-[1.5rem] border border-border bg-white/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <p className="text-sm text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                  <Badge>{item.outputFormat.toUpperCase()}</Badge>
                </div>
                <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600">{item.text}</p>
                {item.outputAssetId ? (
                  <audio controls className="mt-3 w-full" src={`/api/assets/${item.outputAssetId}`} />
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
