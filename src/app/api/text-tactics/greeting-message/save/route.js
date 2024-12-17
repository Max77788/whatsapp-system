import { NextResponse } from 'next/server';
import { update_user } from '@/lib/utils';
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
        const { isGreetingEnabled, header, footer, bodyOptions, triggerWord, triggerWordMessage, useWithInstagram } = await req.json();

        const greetingMessageArray = {
            isGreetingEnabled,
            header,
            footer,
            bodyOptions,
            triggerWordMessage,
            triggerWord,
            useWithInstagram,
        }
        
        const user_email = session?.user?.email;
        
        const success = await update_user({ email: user_email }, { greetingMessage: greetingMessageArray });

        if (success) {
            return NextResponse.json(
                { message: "Greeting message saved successfully" },
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        } else {
            return NextResponse.json(
                { error: "Greeting message not saved" },
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }
    } catch (error) {
        console.error("Error saving data:", error);
        return NextResponse.json(
            { error: "Greeting message not saved" },
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
