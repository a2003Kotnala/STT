import { z } from "zod";

export const sttInputSchema = z.object({
  title: z.string().trim().max(80).optional(),
  language: z.string().trim().optional(),
  diarization: z.boolean().default(false),
});
