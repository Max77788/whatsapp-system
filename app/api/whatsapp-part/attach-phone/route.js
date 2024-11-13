// app/api/phone/attach-phone.js
import { update_user } from '@/lib/utils';
import { NextResponse } from 'next/server';

export async function POST(req) {
    const { unique_id, phone_number } = await req.json();

    success = await update_user({unique_id: unique_id}, { qrCode: { qrString: qrCode, clientId: clientId, phoneNumber: phone_number } });

    
    if (success) {
        return NextResponse.json(
            { message: `Phone number ${phone_number} successfully attached to ${unique_id}` },
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } else {
        return NextResponse.json(
            { error: `Failed to attach phone number ${phone_number} to ${unique_id}` },
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
