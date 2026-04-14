import OpenAI, { toFile } from "openai";
import { pitchOptions } from "@/lib/constants";
import { audioMimeMap } from "@/server/config";
import { assertServerEnv, env } from "@/server/env";
import type { SpeechResult, SynthesizeSpeechInput, TranscriptionResult } from "./types";

const providerName = "openai";

function getClient() {
  assertServerEnv(["openAiApiKey"]);
  return new OpenAI({ apiKey: env.openAiApiKey });
}

export async function transcribeAudio(params: {
  fileName: string;
  contentType: string;
  buffer: Buffer;
  language?: string;
  enableDiarization: boolean;
}): Promise<TranscriptionResult> {
  const client = getClient();
  const file = await toFile(params.buffer, params.fileName, { type: params.contentType });

  if (params.enableDiarization) {
    const response = await client.audio.transcriptions.create({
      file,
      model: env.openAiSttDiarizeModel,
      language: params.language || undefined,
      response_format: "diarized_json",
      chunking_strategy: "auto",
    });

    const segments = response.segments.map((segment) => ({
      startMs: Math.round(segment.start * 1000),
      endMs: Math.round(segment.end * 1000),
      text: segment.text,
      speakerLabel: segment.speaker,
    }));

    return {
      provider: providerName,
      model: env.openAiSttDiarizeModel,
      text: response.text,
      durationSeconds: response.duration,
      languageCode: params.language || "auto",
      detectedLanguage: params.language ? null : "auto",
      segments,
      hasDiarization: true,
      speakerCount: new Set(segments.map((segment) => segment.speakerLabel)).size,
      usage:
        response.usage?.type === "duration"
          ? { inputUnits: Math.round(response.usage.seconds), metric: "seconds" }
          : response.usage
            ? {
                inputUnits: response.usage.input_tokens,
                outputUnits: response.usage.output_tokens,
                metric: "tokens",
              }
            : undefined,
    };
  }

  const response = await client.audio.transcriptions.create({
    file,
    model: env.openAiSttModel,
    language: params.language || undefined,
    response_format: "verbose_json",
    timestamp_granularities: ["segment"],
    temperature: 0,
  });

  const segments = (response.segments ?? []).map((segment) => ({
    startMs: Math.round(segment.start * 1000),
    endMs: Math.round(segment.end * 1000),
    text: segment.text,
    speakerLabel: null,
  }));

  return {
    provider: providerName,
    model: env.openAiSttModel,
    text: response.text,
    durationSeconds: response.duration,
    languageCode: response.language,
    detectedLanguage: params.language ? null : response.language,
    segments,
    hasDiarization: false,
    speakerCount: 1,
    usage: response.usage
      ? { inputUnits: Math.round(response.usage.seconds), metric: "seconds" }
      : undefined,
  };
}

export async function synthesizeSpeech(input: SynthesizeSpeechInput): Promise<SpeechResult> {
  const client = getClient();
  const pitchInstructions =
    pitchOptions.find((option) => option.value === input.pitch)?.instructions ??
    "Maintain a natural, neutral tone.";

  const response = await client.audio.speech.create({
    input: input.text,
    model: env.openAiTtsModel,
    voice: input.voice,
    speed: input.speed,
    response_format: input.format,
    instructions: pitchInstructions,
  });

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return {
    provider: providerName,
    model: env.openAiTtsModel,
    buffer,
    mimeType: audioMimeMap[input.format] ?? "audio/mpeg",
    extension: input.format,
    usage: { inputUnits: input.text.length, metric: "characters" },
  };
}
