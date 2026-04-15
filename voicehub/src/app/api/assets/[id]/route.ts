import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { readStoredBuffer } from "@/server/storage";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const asset = await prisma.mediaAsset.findFirst({
    where: {
      id: params.id,
      userId: user.id,
    },
  });

  if (!asset) {
    return NextResponse.json({ error: "Asset not found." }, { status: 404 });
  }

  const buffer = await readStoredBuffer(asset.storageKey);
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": asset.mimeType,
      "Content-Disposition": `inline; filename="${asset.originalName}"`,
      "Cache-Control": "private, max-age=60",
    },
  });
}
