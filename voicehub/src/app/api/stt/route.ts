import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";
import { getErrorMessage } from "@/server/errors";
import { createTranscriptForUser } from "@/server/services/stt-service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Please upload an audio file." }, { status: 400 });
    }

    const transcript = await createTranscriptForUser({
      userId: user.id,
      file,
      input: {
        title: formData.get("title"),
        language: formData.get("language"),
        diarization: formData.get("diarization") === "true",
      },
    });

    return NextResponse.json({ ok: true, transcriptId: transcript.id });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
