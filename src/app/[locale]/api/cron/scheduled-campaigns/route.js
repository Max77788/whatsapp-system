import { processCronCampaignJob } from "@/lib/cron.mjs";
import { NextResponse } from "next/server";

export async function GET(request) {
  await processCronCampaignJob();
  return NextResponse.json({ ok: true, message: "Cron CAMPAIGNS job executed" });
}
