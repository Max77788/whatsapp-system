import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/serverStuff";
import { find_user } from "@/lib/utils";
import { NextResponse } from "next/server";
import { find_qr_id_by_phone, 
    checkIsraeliPhoneNumber,
    formatPhoneNumberToChatId } from "@/lib/utils";

export async function POST(req) {

    const session = await getServerSession(authOptions);

    if (!session) {
        console.error("Unauthorized access attempt");
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    
    const user = await find_user({ email: session.user.email });
    
    const { phoneNumber, chatId } = await req.json();

    const { clientId, keyThing } = await find_qr_id_by_phone(user, phoneNumber);

    if (!phoneNumber) {
        console.error("Phone number is missing in the request");
        return new Response(JSON.stringify({ error: "Phone number is required" }), { status: 400 });
    }

    const kbBaseAppUrl = user?.kbAppBaseUrl;

    const finalChatId = formatPhoneNumberToChatId(chatId);

    console.log("Chat ID: ", finalChatId);
    
    const response = await fetch(`${kbBaseAppUrl}/client/${clientId}/chat/${finalChatId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const { messages, wasLastMessageRead, myLastMessageTimeStamp, isMyMessageFar } = await response.json();
    
    return NextResponse.json({ messages, wasLastMessageRead, myLastMessageTimeStamp, isMyMessageFar });
}


