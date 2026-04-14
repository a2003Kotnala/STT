import { z } from "zod";
import {
  MAX_TTS_CHARACTERS,
  supportedAudioOutputFormats,
  supportedPitchStyles,
  supportedVoices,
} from "@/server/config";

export const ttsInputSchema = z.object({
  title: z.string().trim().max(80).optional(),
  text: z
    .string()
    .trim()
    .min(1, "Please enter text to synthesize.")
    .max(MAX_TTS_CHARACTERS, `Text must stay under ${MAX_TTS_CHARACTERS} characters.`),
  sourceName: z.string().trim().max(120).optional(),
  voice: z
    .string()
    .refine((value) => supportedVoices.has(value), "Selected voice is not supported."),
  speed: z.number().min(0.25).max(4),
  pitch: z
    .string()
    .refine((value) => supportedPitchStyles.has(value), "Selected pitch is not supported."),
  format: z
    .string()
    .refine(
      (value) => supportedAudioOutputFormats.has(value),
      "Selected output format is not supported.",
    ),
});
