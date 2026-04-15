import path from "path";
import { fileTypeFromBuffer } from "file-type";
import { prisma } from "@/server/db";
import {
  MAX_AUDIO_UPLOAD_BYTES,
  allowedAudioExtensions,
  audioMimeMap,
} from "@/server/config";
import { AppError } from "@/server/errors";
import { transcribeAudio } from "@/server/ai/openai-provider";
import { deleteStoredBuffer, storeBuffer } from "@/server/storage";
import { sttInputSchema } from "@/server/validators/stt";

function getLanguageName(languageCode?: string | null) {
  if (!languageCode || languageCode === "auto") {
    return "Auto detect";
  }

  const names = new Intl.DisplayNames(["en"], { type: "language" });
  return names.of(languageCode) ?? languageCode.toUpperCase();
}

async function parseAudioFile(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (!buffer.byteLength) {
    throw new AppError("Please upload a non-empty audio file.");
  }

  if (buffer.byteLength > MAX_AUDIO_UPLOAD_BYTES) {
    throw new AppError(`Audio files must be under ${MAX_AUDIO_UPLOAD_BYTES / 1024 / 1024} MB.`);
  }

  const detectedType = await fileTypeFromBuffer(buffer);
  const extension =
    detectedType?.ext?.toLowerCase() ??
    path.extname(file.name).replace(".", "").toLowerCase();

  if (!allowedAudioExtensions.includes(extension)) {
    throw new AppError(
      "Unsupported audio format. Use mp3, wav, m4a, ogg, flac, or a browser recording.",
    );
  }

  return {
    buffer,
    extension,
    mimeType:
      detectedType?.mime ??
      file.type ??
      audioMimeMap[extension] ??
      "application/octet-stream",
  };
}

export async function createTranscriptForUser(params: {
  userId: string;
  file: File;
  input: unknown;
}) {
  const parsedInput = sttInputSchema.parse(params.input);
  const audio = await parseAudioFile(params.file);
  const title =
    parsedInput.title?.trim() ||
    path.basename(params.file.name, path.extname(params.file.name)).replace(/[-_]+/g, " ");

  const stored = await storeBuffer(
    `users/${params.userId}/uploads`,
    params.file.name,
    audio.buffer,
  );

  const sourceAsset = await prisma.mediaAsset.create({
    data: {
      userId: params.userId,
      kind: "AUDIO_UPLOAD",
      originalName: params.file.name,
      fileName: stored.fileName,
      mimeType: audio.mimeType,
      extension: audio.extension,
      sizeBytes: audio.buffer.byteLength,
      storageKey: stored.storageKey,
      checksum: stored.checksum,
    },
  });

  const job = await prisma.job.create({
    data: {
      userId: params.userId,
      kind: "STT",
      status: "PROCESSING",
      provider: "openai",
      model: parsedInput.diarization ? "gpt-4o-transcribe-diarize" : "whisper-1",
      title,
      sourceAssetId: sourceAsset.id,
      metadata: {
        diarization: parsedInput.diarization,
        selectedLanguage: parsedInput.language || "auto",
      },
    },
  });

  try {
    const result = await transcribeAudio({
      fileName: params.file.name,
      contentType: audio.mimeType,
      buffer: audio.buffer,
      language: parsedInput.language && parsedInput.language !== "auto" ? parsedInput.language : undefined,
      enableDiarization: parsedInput.diarization,
    });

    const transcript = await prisma.transcript.create({
      data: {
        userId: params.userId,
        jobId: job.id,
        sourceAssetId: sourceAsset.id,
        title,
        languageCode: result.languageCode,
        languageName: getLanguageName(result.languageCode),
        detectedLanguage: result.detectedLanguage,
        text: result.text,
        durationSeconds: result.durationSeconds ?? null,
        speakerCount: result.speakerCount,
        hasDiarization: result.hasDiarization,
        segments: {
          create: result.segments.map((segment, index) => ({
            segmentIndex: index,
            startMs: segment.startMs,
            endMs: segment.endMs,
            speakerLabel: segment.speakerLabel,
            text: segment.text,
          })),
        },
      },
      include: {
        segments: {
          orderBy: { segmentIndex: "asc" },
        },
        sourceAsset: true,
      },
    });

    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: "COMPLETED",
        model: result.model,
        provider: result.provider,
        completedAt: new Date(),
      },
    });

    await prisma.usageLog.create({
      data: {
        userId: params.userId,
        jobId: job.id,
        feature: "STT",
        provider: result.provider,
        model: result.model,
        inputUnits: result.usage?.inputUnits,
        outputUnits: result.usage?.outputUnits,
        metadata: {
          metric: result.usage?.metric,
          durationSeconds: result.durationSeconds,
          diarization: result.hasDiarization,
        },
      },
    });

    return transcript;
  } catch (error) {
    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Transcription failed.",
      },
    });

    throw error;
  }
}

export async function updateTranscriptForUser(params: {
  userId: string;
  transcriptId: string;
  title?: string;
  text?: string;
}) {
  const transcript = await prisma.transcript.findFirst({
    where: { id: params.transcriptId, userId: params.userId },
  });

  if (!transcript) {
    throw new AppError("Transcript not found.", 404);
  }

  return prisma.transcript.update({
    where: { id: transcript.id },
    data: {
      title: params.title?.trim() || transcript.title,
      text: params.text?.trim() || transcript.text,
    },
  });
}

export async function deleteTranscriptForUser(userId: string, transcriptId: string) {
  const transcript = await prisma.transcript.findFirst({
    where: { id: transcriptId, userId },
    include: {
      sourceAsset: true,
      job: true,
    },
  });

  if (!transcript) {
    throw new AppError("Transcript not found.", 404);
  }

  await prisma.$transaction(async (tx) => {
    await tx.usageLog.deleteMany({
      where: { jobId: transcript.jobId },
    });

    await tx.job.delete({
      where: { id: transcript.jobId },
    });

    if (transcript.sourceAsset) {
      await tx.mediaAsset.delete({
        where: { id: transcript.sourceAsset.id },
      });
    }
  });

  if (transcript.sourceAsset) {
    await deleteStoredBuffer(transcript.sourceAsset.storageKey);
  }
}
