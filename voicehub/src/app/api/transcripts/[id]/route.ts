import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/server/auth";
import { getErrorMessage } from "@/server/errors";
import {
  deleteTranscriptForUser,
  updateTranscriptForUser,
} from "@/server/services/stt-service";

const updateSchema = z.object({
  title: z.string().trim().min(1).max(80).optional(),
  text: z.string().trim().min(1).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const payload = updateSchema.parse(await request.json());
    await updateTranscriptForUser({
      userId: user.id,
      transcriptId: params.id,
      title: payload.title,
      text: payload.text,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    await deleteTranscriptForUser(user.id, params.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
