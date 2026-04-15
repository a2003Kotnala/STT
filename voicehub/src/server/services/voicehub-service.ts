import { startOfMonth } from "date-fns";
import { prisma } from "@/server/db";

export async function getDashboardData(userId: string) {
  const monthStart = startOfMonth(new Date());

  const [transcriptCount, voiceCount, transcriptDuration, monthlyUsage, recentJobs] =
    await prisma.$transaction([
      prisma.transcript.count({ where: { userId } }),
      prisma.voiceOutput.count({ where: { userId } }),
      prisma.transcript.aggregate({
        where: { userId },
        _sum: { durationSeconds: true },
      }),
      prisma.usageLog.findMany({
        where: { userId, createdAt: { gte: monthStart } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.job.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          transcript: true,
          voiceOutput: {
            include: {
              outputAsset: true,
            },
          },
        },
      }),
    ]);

  const charactersThisMonth = monthlyUsage
    .filter((log) => log.feature === "TTS")
    .reduce((total, log) => total + (log.inputUnits ?? 0), 0);

  return {
    transcriptCount,
    voiceCount,
    transcriptionMinutes: Math.round((transcriptDuration._sum.durationSeconds ?? 0) / 60),
    charactersThisMonth,
    recentJobs,
  };
}

export async function getTranscriptWorkspaceData(userId: string) {
  return prisma.transcript.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      sourceAsset: true,
      segments: {
        orderBy: { segmentIndex: "asc" },
        take: 8,
      },
    },
    take: 12,
  });
}

export async function getVoiceWorkspaceData(userId: string) {
  return prisma.voiceOutput.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      outputAsset: true,
      sourceAsset: true,
    },
    take: 12,
  });
}

export async function getLibraryData(userId: string) {
  const [transcripts, voiceOutputs] = await prisma.$transaction([
    prisma.transcript.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        sourceAsset: true,
      },
    }),
    prisma.voiceOutput.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        outputAsset: true,
      },
    }),
  ]);

  return { transcripts, voiceOutputs };
}

export async function getActivityData(userId: string) {
  return prisma.job.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      transcript: true,
      voiceOutput: {
        include: {
          outputAsset: true,
        },
      },
      sourceAsset: true,
      outputAsset: true,
    },
    take: 30,
  });
}
