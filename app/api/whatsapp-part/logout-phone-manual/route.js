import { NextResponse } from 'next/server';
import { update_user, find_user, find_qr_id_by_phone } from '@/lib/utils';

export async function POST(req) {
    try {
        const { unique_id, order } = await req.json();

        console.log(unique_id, order);

        const keyThing = `qrCode${order}`;

        const success = await update_user({ unique_id: unique_id }, { [keyThing]: { qrString: null, phoneNumber: null } });

        if (success) {
            console.log("Successfully cleared QR code");
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
    } catch (error) {
        console.error(`Error logging out phone: ${error}`);
        return NextResponse.json(
            { message: `Error logging out phone: ${error}` },
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}