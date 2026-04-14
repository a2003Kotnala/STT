import { createHash, randomBytes } from "crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { env } from "@/server/env";

const SESSION_DURATION_MS = env.sessionTtlDays * 24 * 60 * 60 * 1000;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const headerStore = headers();

  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
      ipAddress:
        headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        headerStore.get("x-real-ip") ??
        null,
      userAgent: headerStore.get("user-agent"),
    },
  });

  return token;
}

export function setSessionCookie(token: string) {
  cookies().set(env.authCookieName, token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax",
    path: "/",
    expires: new Date(Date.now() + SESSION_DURATION_MS),
  });
}

export function clearSessionCookie() {
  cookies().set(env.authCookieName, "", {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}

export async function getCurrentSession() {
  const token = cookies().get(env.authCookieName)?.value;
  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session;
}

export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function destroyCurrentSession() {
  const token = cookies().get(env.authCookieName)?.value;
  if (token) {
    await prisma.session.deleteMany({
      where: { tokenHash: hashToken(token) },
    });
  }

  clearSessionCookie();
}
