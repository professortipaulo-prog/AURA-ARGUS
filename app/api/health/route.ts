import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    app: "AURA/ARGUS",
    status: "ok",
    version: "0.4.1"
  });
}
