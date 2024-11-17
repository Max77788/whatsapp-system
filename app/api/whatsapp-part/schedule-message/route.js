import { NextResponse } from 'next/server';
import { find_user, find_qr_id_by_phone, update_user } from '@/lib/utils';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/serverStuff';
import axios from 'axios';

export async function POST(req) {
    const session = await getServerSession(authOptions);

    try {
        const userEmail = session?.user?.email;
        
        // Parse the JSON body
        const { fromNumber, toNumbers, message, scheduleTime, timeZone } = await req.json();
        console.log(`fromNumber: ${fromNumber}, toNumbers: ${JSON.stringify(toNumbers)}, message: ${message}, scheduleTime: ${scheduleTime}, timeZone: ${timeZone}`);

        const user = await find_user({ email: userEmail });
        const currentScheduledMessages = user.scheduledMessages || [];

        currentScheduledMessages.push({ fromNumber, toNumbers, message, scheduleTime, timeZone });

        const success = await update_user({ email: userEmail}, { scheduledMessages: currentScheduledMessages });

        if (success) {
            return NextResponse.json({ message: "Message scheduled successfully!" }, { status: 200 });
        } else {
            return NextResponse.json({ error: "Failed to schedule message" }, { status: 500 });
        }
    } catch (error) {
        console.error("Error saving data:", error);
        return NextResponse.json(
            { error: "Message not sent" },
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}