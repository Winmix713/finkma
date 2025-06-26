import { NextResponse } from "next/server";

/**
 * Health check endpoint for smoke tests.
 * Responds with status ok.
 */
export async function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}
