import { clientPromiseDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { update_user } from '@/lib/utils';

export async function POST(req) {
    try {
        // Parse the JSON body
        const { userEmail, messageLogicList } = await req.json();

        console.log(`userEmail: ${userEmail}, messageLogicList: ${JSON.stringify(messageLogicList)}`);

        const success = await update_user({ email: userEmail }, { messageLogic: messageLogicList });
        
        if (success) {
        return NextResponse.json(
                { message: "Message response logic saved successfully" },
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        } else {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404, headers: { 'Content-Type': 'application/json' } }
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
