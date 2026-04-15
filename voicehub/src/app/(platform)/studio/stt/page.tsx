import { SttWorkspace } from "@/components/stt/stt-workspace";
import { requireUser } from "@/server/auth";
import { getTranscriptWorkspaceData } from "@/server/services/voicehub-service";

export default async function SttPage() {
  const user = await requireUser();
  const transcripts = await getTranscriptWorkspaceData(user.id);

  return (
    <SttWorkspace
      transcripts={transcripts.map((transcript) => ({
        id: transcript.id,
        title: transcript.title,
        text: transcript.text,
        languageName: transcript.languageName,
        durationSeconds: transcript.durationSeconds,
        speakerCount: transcript.speakerCount,
        hasDiarization: transcript.hasDiarization,
        createdAt: transcript.createdAt.toISOString(),
        sourceAssetId: transcript.sourceAsset?.id ?? null,
        sourceAssetName: transcript.sourceAsset?.originalName ?? null,
        sourceAssetSize: transcript.sourceAsset?.sizeBytes ?? null,
        segments: transcript.segments.map((segment) => ({
          id: segment.id,
          startMs: segment.startMs,
          endMs: segment.endMs,
          speakerLabel: segment.speakerLabel,
          text: segment.text,
        })),
      }))}
    />
  );
}
