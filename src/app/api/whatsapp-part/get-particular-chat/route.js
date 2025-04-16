import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/serverStuff";
import { find_user } from "@/lib/utils";
import { NextResponse } from "next/server";
import { initializeWhatsAppService } from '@/lib/whatsappService/whatsappBusinessAPI';
import { formatPhoneNumberToChatId } from "@/lib/utils";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            console.error("Unauthorized access attempt");
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }
        
        const user = await find_user({ email: session.user.email });
        const { phoneNumber, chatId } = await req.json();

        if (!phoneNumber) {
            console.error("Phone number is missing in the request");
            return new Response(JSON.stringify({ error: "Phone number is required" }), { status: 400 });
        }

        // Initialize WhatsApp Business API service
        const whatsappService = await initializeWhatsAppService(user);

        // Format the chat ID
        const formattedChatId = formatPhoneNumberToChatId(chatId);
        
        // Get messages for this chat
        const messages = await whatsappService.getMessages(formattedChatId);
        
        // Format the response to match the existing structure
        const formattedMessages = messages.data.map(message => ({
            id: message.id,
            from: message.from,
            to: message.to,
            body: message.text?.body || "",
            timestamp: message.timestamp,
            type: message.type,
            hasMedia: !!message.image || !!message.video || !!message.audio || !!message.document,
            mediaUrl: message.image?.link || message.video?.link || message.audio?.link || message.document?.link || null
        }));

        return NextResponse.json({ 
            messages: formattedMessages,
            wasLastMessageRead: true, // Business API doesn't provide this directly
            myLastMessageTimeStamp: formattedMessages.length > 0 ? formattedMessages[formattedMessages.length - 1].timestamp : null,
            isMyMessageFar: false // Business API doesn't provide this directly
        });
    } catch (error) {
        console.error("Error fetching particular chat:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch chat" },
            { status: 500 }
        );
    }
}


