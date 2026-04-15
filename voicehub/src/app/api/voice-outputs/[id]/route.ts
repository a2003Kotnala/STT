import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";
import { getErrorMessage } from "@/server/errors";
import { deleteVoiceOutputForUser } from "@/server/services/tts-service";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    await deleteVoiceOutputForUser(user.id, params.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
