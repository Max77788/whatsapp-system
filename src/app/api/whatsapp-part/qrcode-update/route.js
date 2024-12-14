import { NextResponse } from 'next/server';
import { clientPromiseDb } from '@/lib/mongodb';
import { update_user } from '@/lib/utils';

export async function POST(req) {
    const { qrCode, uniqueId, clientId } = await req.json();
    
    const keyThing = `qrCode${clientId}`
    
    const success = await update_user({ unique_id: uniqueId }, { [keyThing]: { qrString: qrCode, phoneNumber: null } });

    // console.log(`qrCode: ${qrCode}, uniqueId: ${uniqueId}, clientId: ${clientId}`);
    
    if (success) {
        return NextResponse.json(
            { message: `QR code ${clientId} updated successfully` },
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } else {
        return NextResponse.json(
            { message: `QR code ${clientId} update failed` },
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
