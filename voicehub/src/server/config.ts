import { audioOutputFormats, pitchOptions, voiceOptions } from "@/lib/constants";
import { env } from "@/server/env";

export const MAX_AUDIO_UPLOAD_BYTES = env.maxAudioUploadMb * 1024 * 1024;
export const MAX_TTS_CHARACTERS = 4000;

export const allowedAudioExtensions = [
  "mp3",
  "wav",
  "m4a",
  "ogg",
  "flac",
  "webm",
  "mp4",
  "mpeg",
  "mpga",
];

export const allowedTextExtensions = ["txt", "md"];

export const audioMimeMap: Record<string, string> = {
  mp3: "audio/mpeg",
  wav: "audio/wav",
  m4a: "audio/mp4",
  ogg: "audio/ogg",
  flac: "audio/flac",
  webm: "audio/webm",
  aac: "audio/aac",
  opus: "audio/opus",
};

export const supportedVoices = new Set(voiceOptions.map((voice) => voice.value));
export const supportedPitchStyles = new Set(pitchOptions.map((pitch) => pitch.value));
export const supportedAudioOutputFormats = new Set(
  audioOutputFormats.map((format) => format.value),
);
