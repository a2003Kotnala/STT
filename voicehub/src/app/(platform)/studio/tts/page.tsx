import { TtsWorkspace } from "@/components/tts/tts-workspace";
import { requireUser } from "@/server/auth";
import { getVoiceWorkspaceData } from "@/server/services/voicehub-service";

export default async function TtsPage() {
  const user = await requireUser();
  const outputs = await getVoiceWorkspaceData(user.id);

  return (
    <TtsWorkspace
      outputs={outputs.map((item) => ({
        id: item.id,
        title: item.title,
        text: item.text,
        voice: item.voice,
        speed: item.speed,
        pitch: item.pitch,
        outputFormat: item.outputFormat,
        createdAt: item.createdAt.toISOString(),
        sourceAssetId: item.sourceAsset?.id ?? null,
        outputAssetId: item.outputAsset?.id ?? null,
        outputAssetName: item.outputAsset?.originalName ?? null,
        outputAssetSize: item.outputAsset?.sizeBytes ?? null,
      }))}
    />
  );
}
