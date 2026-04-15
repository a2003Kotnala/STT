import { NextResponse } from "next/server";
import { destroyCurrentSession } from "@/server/auth";

export async function POST(request: Request) {
  await destroyCurrentSession();
  return NextResponse.redirect(new URL("/", request.url));
}
