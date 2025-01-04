import { NextResponse } from 'next/server';
import { update_user, find_user } from '@/lib/utils';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/serverStuff";

export async function POST(req) {
    const apiKey = req.headers.get('x-api-key');

    const session = await getServerSession(authOptions);
    
    const user = session ? await find_user({ email: session.user.email }) : await find_user({ apiKey });
    try {
        // Parse the JSON body
        const { template } = await req.json();

        if (!template || !template.id) {
            return NextResponse.json(
                { error: "Template must include an 'id' field." },
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const currentMessageTemplates = user?.messageTemplates || [];

        // Find the index of the existing template with the same id
        const existingTemplateIndex = currentMessageTemplates.findIndex(t => t.id === template.id);

        let messageTemplates;

        if (existingTemplateIndex !== -1) {
            // Replace the existing template
            messageTemplates = currentMessageTemplates.map(t =>
                t.id === template.id ? template : t
            );
            console.log(`Replaced template with id: ${template.id}`);
        } else {
            // Append the new template
            messageTemplates = [...currentMessageTemplates, template];
            console.log(`Appended new template with id: ${template.id}`);
        }

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