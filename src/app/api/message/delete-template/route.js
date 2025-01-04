import { NextResponse } from 'next/server';
import { update_user, find_user } from '@/lib/utils';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/serverStuff";

export async function DELETE(req) {
    const apiKey = req.headers.get('x-api-key');

    const session = await getServerSession(authOptions);
    
    const user = session ? await find_user({ email: session.user.email }) : await find_user({ apiKey });
    try {
        // Parse the JSON body
        const { id } = await req.json();

        console.log(`id: ${id}`);

        const messageTemplates = user?.messageTemplates.filter(template => template.id !== id) || [];
        
        console.log(`userEmail: ${session?.user?.email}, messageTemplates: ${JSON.stringify(messageTemplates)}`);

        let success;
        
        if (apiKey) {
            success = await update_user({ apiKey: apiKey }, { messageTemplates: messageTemplates });
        } else {
            success = await update_user({ email: session?.user?.email }, { messageTemplates: messageTemplates });
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