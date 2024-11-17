import { NextResponse } from 'next/server';
import { update_user } from '@/lib/utils';
import { find_user } from '@/lib/utils';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/serverStuff";


export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
    }
    
    try {
        // Parse the JSON body
        const phoneNumberTacticsArray = await req.json();

        const user_email = session?.user?.email;

        const user = await find_user({ email: user_email });
        const message_logic_list = user.messageLogicList;
        
        const success = await update_user({ email: user_email }, { phoneNumberTactics: phoneNumberTacticsArray });

        if (success) {
            return NextResponse.json(
                { message: "Message response logic saved successfully" },
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        } else {
            return NextResponse.json(
                { error: "Message response logic not saved" },
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }
    } catch (error) {
        console.error("Error saving data:", error);
        return NextResponse.json(
            { error: "Message response logic not saved" },
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
