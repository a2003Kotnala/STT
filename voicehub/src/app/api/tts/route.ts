import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";
import { getErrorMessage } from "@/server/errors";
import { createVoiceOutputForUser } from "@/server/services/tts-service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const payload = await request.json();
    const item = await createVoiceOutputForUser({
      userId: user.id,
      input: payload,
    });

    return NextResponse.json({ ok: true, voiceOutputId: item.id });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
