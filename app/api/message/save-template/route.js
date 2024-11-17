import { NextResponse } from 'next/server';
import { update_user } from '@/lib/utils';

export async function POST(req) {
    try {
        // Parse the JSON body
        const { userEmail, messageTemplates } = await req.json();

        console.log(`userEmail: ${userEmail}, messageTemplates: ${JSON.stringify(messageTemplates)}`);

        const success = await update_user({ email: userEmail }, { messageTemplates: messageTemplates }, "$push");
        
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