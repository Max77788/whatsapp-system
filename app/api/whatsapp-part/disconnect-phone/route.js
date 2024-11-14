import { NextResponse } from 'next/server';
import { clientPromiseDb } from '@/lib/mongodb';
import { update_user } from '@/lib/utils';

export async function POST(req) {
    const { unique_id, order } = await req.json();

    const keyThing = `qrCode${order}`
    
    const success = await update_user({ unique_id: unique_id }, { [keyThing]: { qrString: null, phoneNumber: null } });

    // console.log(`qrCode: ${qrCode}, uniqueId: ${uniqueId}, clientId: ${clientId}`);
    
    if (success) {
        return NextResponse.json(
            { message: `QR code ${order} cleared successfully` },
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } else {
        return NextResponse.json(
            { message: `QR code ${order} clearing failed` },
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
