import { clientPromiseDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { find_user } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/serverStuff';

export async function GET(req) {
    try {
        const apiKey = req.headers.get('x-api-key');

        // Attempt to get the session
        const session = await getServerSession(authOptions);

        // Handle missing session
        if (!session) {
            console.log('No session found for the request.');
        }

        const userEmail = session?.user?.email;

        const user = apiKey ? await find_user({ apiKey }) : await find_user({ email: userEmail });
        console.log(`leads: ${JSON.stringify(user.leads)}`);
        
        return NextResponse.json({leads: user.leads});
    } catch (error) {
        console.error("Error saving data:", error);
        return NextResponse.json(
            { error: "Leads not saved" },
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
