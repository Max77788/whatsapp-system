import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/serverStuff";
import { find_user } from "@/lib/utils";
import { NextResponse } from "next/server";
import { find_qr_id_by_phone } from "@/lib/utils";

export async function POST(req) {

    const session = await getServerSession(authOptions);

    if (!session) {
        console.error("Unauthorized access attempt");
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    
    const user = await find_user({ email: session.user.email });

    const { phoneNumber } = await req.json();

    const { clientId, keyThing } = await find_qr_id_by_phone(user, phoneNumber);

    if (!phoneNumber) {
        console.error("Phone number is missing in the request");
        return new Response(JSON.stringify({ error: "Phone number is required" }), { status: 400 });
    }

    const kbBaseAppUrl = user?.kbAppBaseUrl;
    
    const response = await fetch(`${kbBaseAppUrl}/client/${clientId}/chats`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const { success, data: chats, contacts, group_contacts } = await response.json();
    
    group_contacts.forEach(group_contact_object => {
        
        group_contact_object.contacts.forEach(group_contact => {
            const name = contacts.find(c => c.id.includes(group_contact.id.user))?.name || "unknown";

            group_contact.id = group_contact.id._serialized;
            group_contact.name = name;
        });
    });

    const all_contacts = group_contacts

    const all_contacts_object = {
        id: "all_contacts@gg.us",
        name: "All Contacts",
        contacts: contacts
    }

    all_contacts.push(all_contacts_object)
  return NextResponse.json({ chats, contacts, all_contacts, group_contacts });
}


