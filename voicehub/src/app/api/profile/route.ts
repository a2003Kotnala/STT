import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { getErrorMessage } from "@/server/errors";
import { profileSchema } from "@/server/validators/auth";

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const payload = profileSchema.parse(await request.json());

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { name: payload.name },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json({ ok: true, user: updated });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
