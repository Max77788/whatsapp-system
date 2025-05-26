import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK_VERIFIED");
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } else {
    return new Response("Forbidden", { status: 400 });
  }
}

export async function POST(request: Request) {
  // Handle incoming message
  try {
    const body = await request.json();
    console.log("📩 Incoming Message:", JSON.stringify(body, null, 2));

    // Store message in your database here

    return new Response("EVENT_RECEIVED", { status: 200 });
  } catch (error) {
    console.error("Error handling incoming WhatsApp message:", error);
    return new Response("Error", { status: 500 });
  }
}
