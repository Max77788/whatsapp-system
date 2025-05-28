import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/serverStuff";
import { find_user } from "@/lib/utils";
import { NextResponse } from "next/server";
import { initializeWhatsAppService } from "@/src/lib/whatsappService/whatsappBusinessAPI";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      console.error("Unauthorized access attempt");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const user = await find_user({ email: session.user.email });
    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      console.error("Phone number is missing in the request");
      return new Response(
        JSON.stringify({ error: "Phone number is required" }),
        { status: 400 },
      );
    }

    // Initialize WhatsApp Business API service
    const whatsappService = await initializeWhatsAppService();

    // Get chats using the Business API
    const chats = await whatsappService.getChats(phoneNumber);
    const messages = await whatsappService.getMessages(phoneNumber);

    // Format the response to match the existing structure
    const formattedChats = chats.map((chat) => ({
      chatId: chat.client_id,
      name: chat.name || chat.client_id,
      messages: messages || [],
    }));

    return NextResponse.json({
      chats: formattedChats,
    });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch chats" },
      { status: 500 },
    );
  }
}
