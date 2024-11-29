import { processCronJob } from "@/lib/cron.mjs";

export async function GET(request) {
  await processCronJob();
  return new Response(JSON.stringify({ message: "Cron job executed" }), { status: 200, headers: { "Content-Type": "application/json" } });
}
