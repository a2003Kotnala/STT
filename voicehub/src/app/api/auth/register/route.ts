import { NextResponse } from "next/server";
import { createSession, setSessionCookie } from "@/server/auth";
import { getErrorMessage } from "@/server/errors";
import { registerUser } from "@/server/services/auth-service";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const user = await registerUser(payload);
    const token = await createSession(user.id);
    setSessionCookie(token);

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
