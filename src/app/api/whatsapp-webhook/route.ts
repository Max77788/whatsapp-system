import ChatModel from "@/lib/models/Chat";
import MessageModel from "@/lib/models/Message";
import dbConnect from "@/lib/mongoose";
import { NextRequest } from "next/server";

export interface WAWebhookPayload {
  object: "whatsapp_business_account";
  entry: {
    id: string;
    changes: {
      field: string;
      value: {
        messaging_product: "whatsapp";
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: {
          profile: { name: string };
          user_id: string;
          wa_id: string;
        }[];
        errors?: {
          code: number;
          title: string;
          message: string;
          error_data: {
            details: string;
          };
        }[];
        messages?: {
          from: string;
          id: string;
          timestamp: string;
          text?: { body: string };
          type:
            | "audio"
            | "button"
            | "document"
            | "text"
            | "image"
            | "interactive"
            | "order"
            | "sticker"
            | "system"
            | "unknown"
            | "video";
        }[];
      };
    }[];
  }[];
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
    console.log(`Got message 🚀 ${JSON.stringify(body, null, 2)}`);
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        if (change.field !== "messages") continue;
        const { messages = [], contacts = [] } = change.value;
        for (const msg of messages) {
          console.log(msg);
          const wa_id = msg.from;
          const name =
            contacts.find((c) => c.wa_id === wa_id)?.profile?.name || "Unknown";
          const text = msg.text?.body || "";
          const timestamp = new Date(Number(msg.timestamp) * 1000);

          // Upsert contact
          await ChatModel.findOneAndUpdate(
            { wa_id },
            {
              wa_id,
              name,
              last_message: text,
              last_updated: timestamp,
            },
            { upsert: true, new: true },
          );

          // Insert message
          await MessageModel.create({
            chat_wa_id: wa_id,
            direction: "inbound",
            content: text,
            timestamp,
          });
        }
      }
    }

    return new Response("EVENT_RECEIVED", { status: 200 });
  } catch (error) {
    console.error("Error handling incoming WhatsApp message:", error.message);
    return new Response("Error", { status: 500 });
  }
}
