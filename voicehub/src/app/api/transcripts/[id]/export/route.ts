import { NextResponse } from "next/server";
import { Document, HeadingLevel, Packer, Paragraph } from "docx";
import { toSrt } from "@/lib/transcript";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/server/db";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const format = new URL(request.url).searchParams.get("format");

  const transcript = await prisma.transcript.findFirst({
    where: {
      id: params.id,
      userId: user.id,
    },
    include: {
      segments: {
        orderBy: { segmentIndex: "asc" },
      },
    },
  });

  if (!transcript) {
    return NextResponse.json({ error: "Transcript not found." }, { status: 404 });
  }

  if (format === "txt") {
    return new Response(transcript.text, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${transcript.title}.txt"`,
      },
    });
  }

  if (format === "srt") {
    const body = toSrt(transcript.segments);
    return new Response(body, {
      headers: {
        "Content-Type": "application/x-subrip; charset=utf-8",
        "Content-Disposition": `attachment; filename="${transcript.title}.srt"`,
      },
    });
  }

  if (format === "docx") {
    const document = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: transcript.title,
              heading: HeadingLevel.HEADING_1,
            }),
            ...transcript.text.split("\n").map(
              (line) =>
                new Paragraph({
                  text: line,
                }),
            ),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(document);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${transcript.title}.docx"`,
      },
    });
  }

  return NextResponse.json({ error: "Unsupported export format." }, { status: 400 });
}
