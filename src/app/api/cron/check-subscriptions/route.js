import { processCronCheckSubscriptionsJob } from "@/lib/cron.mjs";
import { NextResponse } from "next/server";

export async function GET(request) {
  await processCronCheckSubscriptionsJob();
  return NextResponse.json({ ok: true, message: "Cron CHECK SUBSCRIPTIONS job executed" });
}
