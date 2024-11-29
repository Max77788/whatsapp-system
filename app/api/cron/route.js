import { processCronJob } from "@/lib/cron.mjs";
import { NextResponse } from "next/server";

export async function GET(request) {
  if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  await processCronJob();
  return NextResponse.json({ ok: true, message: "Cron job executed" });
}
