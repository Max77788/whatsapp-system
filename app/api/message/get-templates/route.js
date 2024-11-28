import { NextResponse } from 'next/server';
import { find_user } from '@/lib/utils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/serverStuff";

export async function GET(req) {
    const session = await getServerSession(authOptions);

    try {
        // Parse the JSON body
        const userEmail = session?.user?.email;

        const apiKey = req.headers.get('x-api-key');

        let user;
        if (userEmail && !apiKey) {
            user = await find_user({ email: userEmail });
        } else if (apiKey) {
            user = await find_user({ apiKey: apiKey });
        }
        
        const messageTemplates = user?.messageTemplates || null;

        if (messageTemplates) {
            console.log("Returning message templates");
            return NextResponse.json(
                { messageTemplates: messageTemplates },
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
            { error: "Leads not saved" },
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
