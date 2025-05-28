import dbConnect from "@/lib/mongoose";
import { NextRequest } from "next/server";
import type { WAWebhookPayload } from "@/lib/interfaces/whatsapp";
import { Contact, Message } from "@/lib/interfaces/whatsapp";
import ChatModel from "@/lib/models/Chat";
import MessageModel from "@/lib/models/Message";

export async function saveMessages(
  to: string,
  messages: Message[],
  contacts: Contact[],
) {
  for (const msg of messages) {
    const name = contacts.find((c) => c.wa_id === msg.from)?.profile?.name;
    const text = msg.text?.body || "";
    const timestamp = new Date(Number(msg.timestamp) * 1000);

    // Upsert chat
    await ChatModel.findOneAndUpdate(
      { phone_id: to, client_id: msg.from },
      {
        name,
        last_updated: timestamp,
      },
      { upsert: true, new: true },
    );

    // Insert message
    await MessageModel.create({
      wa_id: msg.id,
      from: msg.from,
      to,
      direction: "inbound",
      content: text,
      timestamp,
    });
  }
}
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
  try {
    await dbConnect();
    const body: WAWebhookPayload = await request.json();

    for (const entry of body.entry) {
      for (const change of entry.changes) {
        if (change.field !== "messages") continue;
        const { messages = [], contacts = [] } = change.value;
        await saveMessages(
          change.value.metadata.display_phone_number,
          messages,
          contacts,
        );
      }
    }

    return new Response("EVENT_RECEIVED", { status: 200 });
  } catch (error) {
    console.error("Error handling incoming WhatsApp message:", error);
    return new Response("Error", { status: 500 });
  }
}
