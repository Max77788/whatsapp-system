import { processCronJob } from "@/lib/cron.mjs";
import { NextResponse } from "next/server";

export async function GET(request) {
  await processCronJob();
  return NextResponse.json({ ok: true, message: "Cron MESSAGES job executed" });
}
