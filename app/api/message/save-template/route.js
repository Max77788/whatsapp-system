import { NextResponse } from 'next/server';
import { update_user } from '@/lib/utils';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/serverStuff";

export async function POST(req) {
    const apiKey = req.headers.get('x-api-key');

    const session = await getServerSession(authOptions);
    
    // const user = session ? await find_user({ email: session.user.email }) : await find_user({ apiKey });
    try {
        // Parse the JSON body
        const { messageTemplates } = await req.json();

        console.log(`userEmail: ${session?.user?.email}, messageTemplates: ${JSON.stringify(messageTemplates)}`);

        let success;
        if (Array.isArray(messageTemplates) && messageTemplates.length > 0) {
            if (apiKey) {
                success = await update_user({ apiKey: apiKey }, { messageTemplates: messageTemplates[0] }, "$push");
            } else {
                success = await update_user({ email: session?.user?.email }, { messageTemplates: messageTemplates[0] }, "$push");
            }
        } else {
            if (apiKey) {
                success = await update_user({ apiKey: apiKey }, { messageTemplates: messageTemplates }, "$push");
            } else {
                success = await update_user({ email: session?.user?.email }, { messageTemplates: messageTemplates }, "$push");
            }
        }
        
        if (success) {
            return NextResponse.json(
                { message: "Message templates saved successfully" },
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        } else {
            return NextResponse.json(
                { error: "No message templates found" },
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }
    } catch (error) {
        console.error("Error saving data:", error);
        return NextResponse.json(
            { error: "Message templates not saved" },
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}