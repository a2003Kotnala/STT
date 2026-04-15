import path from "path";

function toInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  authCookieName: process.env.AUTH_COOKIE_NAME ?? "voicehub_session",
  sessionTtlDays: toInt(process.env.SESSION_TTL_DAYS, 14),
  storageDir: path.resolve(process.cwd(), process.env.STORAGE_DIR ?? "storage"),
  maxAudioUploadMb: toInt(process.env.MAX_AUDIO_UPLOAD_MB, 25),
  openAiApiKey: process.env.OPENAI_API_KEY ?? "",
  openAiSttModel: process.env.OPENAI_STT_MODEL ?? "whisper-1",
  openAiSttDiarizeModel:
    process.env.OPENAI_STT_DIARIZE_MODEL ?? "gpt-4o-transcribe-diarize",
  openAiTtsModel: process.env.OPENAI_TTS_MODEL ?? "gpt-4o-mini-tts",
  isProduction: process.env.NODE_ENV === "production",
};

export function assertServerEnv(keys: Array<keyof typeof env>) {
  for (const key of keys) {
    const value = env[key];
    if (typeof value === "string" && !value) {
      throw new Error(`Missing required environment value: ${key}`);
    }
  }
}
