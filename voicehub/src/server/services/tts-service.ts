import { prisma } from "@/server/db";
import { AppError } from "@/server/errors";
import { synthesizeSpeech } from "@/server/ai/openai-provider";
import { deleteStoredBuffer, storeBuffer } from "@/server/storage";
import { ttsInputSchema } from "@/server/validators/tts";

export async function createVoiceOutputForUser(params: {
  userId: string;
  input: unknown;
}) {
  const payload = ttsInputSchema.parse(params.input);
  const title = payload.title?.trim() || payload.text.slice(0, 48);

  let sourceAssetId: string | null = null;

  if (payload.sourceName) {
    const sourceBuffer = Buffer.from(payload.text, "utf8");
    const storedSource = await storeBuffer(
      `users/${params.userId}/text`,
      payload.sourceName.endsWith(".txt") ? payload.sourceName : `${payload.sourceName}.txt`,
      sourceBuffer,
    );

    const sourceAsset = await prisma.mediaAsset.create({
      data: {
        userId: params.userId,
        kind: "TEXT_UPLOAD",
        originalName: payload.sourceName,
        fileName: storedSource.fileName,
        mimeType: "text/plain",
        extension: "txt",
        sizeBytes: sourceBuffer.byteLength,
        storageKey: storedSource.storageKey,
        checksum: storedSource.checksum,
      },
    });

    sourceAssetId = sourceAsset.id;
  }

  const job = await prisma.job.create({
    data: {
      userId: params.userId,
      kind: "TTS",
      status: "PROCESSING",
      provider: "openai",
      model: "gpt-4o-mini-tts",
      title,
      sourceAssetId,
      metadata: {
        voice: payload.voice,
        speed: payload.speed,
        pitch: payload.pitch,
        format: payload.format,
      },
    },
  });

  try {
    const result = await synthesizeSpeech({
      text: payload.text,
      voice: payload.voice,
      speed: payload.speed,
      pitch: payload.pitch,
      format: payload.format,
    });

    const storedOutput = await storeBuffer(
      `users/${params.userId}/outputs`,
      `${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "voicehub-audio"}.${result.extension}`,
      result.buffer,
    );

    const outputAsset = await prisma.mediaAsset.create({
      data: {
        userId: params.userId,
        kind: "AUDIO_OUTPUT",
        originalName: `${title}.${result.extension}`,
        fileName: storedOutput.fileName,
        mimeType: result.mimeType,
        extension: result.extension,
        sizeBytes: result.buffer.byteLength,
        storageKey: storedOutput.storageKey,
        checksum: storedOutput.checksum,
      },
    });

    const voiceOutput = await prisma.voiceOutput.create({
      data: {
        userId: params.userId,
        jobId: job.id,
        sourceAssetId,
        outputAssetId: outputAsset.id,
        title,
        text: payload.text,
        voice: payload.voice,
        speed: payload.speed,
        pitch: payload.pitch,
        outputFormat: payload.format,
      },
      include: {
        outputAsset: true,
      },
    });

    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: "COMPLETED",
        provider: result.provider,
        model: result.model,
        outputAssetId: outputAsset.id,
        completedAt: new Date(),
      },
    });

    await prisma.usageLog.create({
      data: {
        userId: params.userId,
        jobId: job.id,
        feature: "TTS",
        provider: result.provider,
        model: result.model,
        inputUnits: result.usage?.inputUnits,
        outputUnits: result.usage?.outputUnits,
        metadata: {
          metric: result.usage?.metric,
          voice: payload.voice,
          format: payload.format,
          speed: payload.speed,
          pitch: payload.pitch,
        },
      },
    });

    return voiceOutput;
  } catch (error) {
    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Speech generation failed.",
      },
    });

    throw error;
  }
}

export async function deleteVoiceOutputForUser(userId: string, voiceOutputId: string) {
  const voiceOutput = await prisma.voiceOutput.findFirst({
    where: { id: voiceOutputId, userId },
    include: {
      sourceAsset: true,
      outputAsset: true,
      job: true,
    },
  });

  if (!voiceOutput) {
    throw new AppError("Generated audio not found.", 404);
  }

  await prisma.$transaction(async (tx) => {
    await tx.usageLog.deleteMany({
      where: { jobId: voiceOutput.jobId },
    });

    await tx.job.delete({
      where: { id: voiceOutput.jobId },
    });

    if (voiceOutput.sourceAsset) {
      await tx.mediaAsset.delete({
        where: { id: voiceOutput.sourceAsset.id },
      });
    }

    if (voiceOutput.outputAsset) {
      await tx.mediaAsset.delete({
        where: { id: voiceOutput.outputAsset.id },
      });
    }
  });

  if (voiceOutput.sourceAsset) {
    await deleteStoredBuffer(voiceOutput.sourceAsset.storageKey);
  }

  if (voiceOutput.outputAsset) {
    await deleteStoredBuffer(voiceOutput.outputAsset.storageKey);
  }
}
