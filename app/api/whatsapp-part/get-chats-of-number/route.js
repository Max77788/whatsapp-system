import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/serverStuff";
import { find_user } from "@/lib/utils";
import { NextResponse } from "next/server";
import { find_qr_id_by_phone } from "@/lib/utils";

export async function POST(req) {
    console.log("Starting POST request to get chats of number");

    const session = await getServerSession(authOptions);
    console.log("Session retrieved:", session);

    if (!session) {
        console.error("Unauthorized access attempt");
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    
    const user = await find_user({ email: session.user.email });
    console.log("User found:", user);

    const { phoneNumber } = await req.json();
    console.log("Phone number received:", phoneNumber);

    const { clientId, keyThing } = await find_qr_id_by_phone(user, phoneNumber);
    console.log("Client ID and Key Thing:", clientId, keyThing);

    if (!phoneNumber) {
        console.error("Phone number is missing in the request");
        return new Response(JSON.stringify({ error: "Phone number is required" }), { status: 400 });
    }

    const kbBaseAppUrl = user?.kbAppBaseUrl;
    console.log("KB Base App URL:", kbBaseAppUrl);
    
    const response = await fetch(`${kbBaseAppUrl}/client/${clientId}/chats`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    console.log("Response from external API:", response);

    const { success, data: chats } = await response.json();
  

  return NextResponse.json(chats);
}
