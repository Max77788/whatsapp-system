import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/serverStuff";
import { find_user } from "@/lib/utils";
import { NextResponse } from "next/server";
import { initializeWhatsAppService } from '@/lib/whatsappService/whatsappBusinessAPI';

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            console.error("Unauthorized access attempt");
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }
        
        const user = await find_user({ email: session.user.email });
        const { phoneNumber } = await req.json();

        if (!phoneNumber) {
            console.error("Phone number is missing in the request");
            return new Response(JSON.stringify({ error: "Phone number is required" }), { status: 400 });
        }

        // Initialize WhatsApp Business API service
        const whatsappService = await initializeWhatsAppService();

        // Get chats using the Business API
        const chats = await whatsappService.getChats();
        
        // Get contacts information
        const contacts = await Promise.all(
            chats.data.map(async (chat) => {
                const contactInfo = await whatsappService.getContactInfo(chat.phone_number);
                return {
                    id: chat.phone_number,
                    name: contactInfo.name || chat.phone_number,
                    phone_number: chat.phone_number
                };
            })
        );

        // Format the response to match the existing structure
        const formattedChats = chats.data.map(chat => ({
            chatId: chat.id,
            name: chat.name || chat.phone_number,
            messages: chat.messages || []
        }));

        return NextResponse.json({ 
            chats: formattedChats, 
            contacts,
            all_contacts: [{
                id: "all_contacts@gg.us",
                name: "All Contacts",
                contacts: contacts
            }],
            group_contacts: [] // Business API doesn't support groups in the same way
        });
    } catch (error) {
        console.error("Error fetching chats:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch chats" },
            { status: 500 }
        );
    }
}


