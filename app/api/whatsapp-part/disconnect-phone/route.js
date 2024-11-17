import { NextResponse } from 'next/server';
import { update_user } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/serverStuff';
import { find_user } from '@/lib/utils';
import { find_qr_id_by_phone } from '@/lib/utils';

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        const user_email = session?.user?.email;
        const user = await find_user({ email: user_email });

        const { phoneNumber } = await req.json();

        const { clientId, keyThing } = find_qr_id_by_phone(user, phoneNumber);
        
        /*
        // That's how we usually get kb base app url
        const kbBaseAppUrl = user?.kbBaseAppUrl;
        */

        const kbBaseAppUrl = 'http://localhost:4000';
        

        const response = await fetch(`${kbBaseAppUrl}/disconnect-phone`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientId })
        });

        if (response.status === 200) {
            console.log("Successfully disconnected client");
            
            const success = await update_user({ email: user_email }, { [keyThing]: { qrString: null, phoneNumber: null } });
            
            if (success) {
                console.log("Successfully cleared QR code");
                return NextResponse.json(
                    { message: `QR code ${clientId} cleared successfully` },
                    { status: 200, headers: { 'Content-Type': 'application/json' } }
                );
            } else {
                return NextResponse.json(
                    { message: `QR code ${clientId} clearing failed` },
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }
        } else {
            console.error(`Error disconnecting phone: ${response.statusText}`);
            return NextResponse.json(
                { message: `Error disconnecting phone: ${response.statusText}` },
                { status: response.status, headers: { 'Content-Type': 'application/json' } }
            );
        }
    } catch (error) {
        console.error(`Error disconnecting phone: ${error}`);
        return NextResponse.json(
            { message: `Error disconnecting phone: ${error}` },
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
