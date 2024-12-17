import { processCronInstaResponseJob } from "@/lib/cron.mjs";
import { NextResponse } from "next/server";

export async function GET(request) {
  await processCronInstaResponseJob();
  return NextResponse.json({ ok: true, message: "Cron INSTAGRAM RESPONSE job executed" });
}
