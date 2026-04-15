import { ProfileForm } from "@/components/settings/profile-form";
import { Card } from "@/components/ui/card";
import { env } from "@/server/env";
import { requireUser } from "@/server/auth";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Card className="rounded-[2rem]">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Settings</h1>
        <p className="mt-3 text-sm text-slate-600">
          Basic account controls today, ready for team management, billing, and usage limits in the next phase.
        </p>

        <div className="mt-6">
          <ProfileForm defaultName={user.name} />
        </div>
      </Card>

      <Card className="rounded-[2rem]">
        <h2 className="text-xl font-semibold text-slate-950">Environment</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <p>Storage driver: local filesystem adapter</p>
          <p>Max upload size: {env.maxAudioUploadMb} MB</p>
          <p>Default STT model: {env.openAiSttModel}</p>
          <p>Diarization model: {env.openAiSttDiarizeModel}</p>
          <p>TTS model: {env.openAiTtsModel}</p>
        </div>
      </Card>
    </div>
  );
}
