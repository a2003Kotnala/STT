export type TranscriptSegmentResult = {
  startMs: number;
  endMs: number;
  text: string;
  speakerLabel?: string | null;
};

export type UsageResult = {
  inputUnits?: number;
  outputUnits?: number;
  metric?: "seconds" | "tokens" | "characters";
};

export type TranscriptionResult = {
  provider: string;
  model: string;
  text: string;
  durationSeconds?: number | null;
  languageCode?: string | null;
  detectedLanguage?: string | null;
  segments: TranscriptSegmentResult[];
  hasDiarization: boolean;
  speakerCount: number;
  usage?: UsageResult;
};

export type SynthesizeSpeechInput = {
  text: string;
  voice: string;
  speed: number;
  pitch: string;
  format: "mp3" | "wav" | "aac" | "flac" | "opus";
};

export type SpeechResult = {
  provider: string;
  model: string;
  buffer: Buffer;
  mimeType: string;
  extension: string;
  durationSeconds?: number | null;
  usage?: UsageResult;
};
