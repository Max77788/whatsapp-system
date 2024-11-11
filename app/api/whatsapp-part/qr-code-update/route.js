import { NextResponse } from 'next/server';
import { clientPromiseDb } from '@/lib/mongodb';

export default async function POST(req, res) {
    const { qrCode, uniqueId, clientId } = req.body;

    const db = await clientPromiseDb;
    const userFound = await db.collection("users").findOne({ uniqueId: uniqueId });
    if (userFound) {
        await db.collection("users").updateOne({ uniqueId: uniqueId }, { $set: { qrCode: { qrString: qrCode, clientId: clientId, phoneNumber: null } } });
    }

    console.log(qrCode, uniqueId, clientId);
    return new Response(JSON.stringify({ message: `QR code ${clientId} updated successfully` }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}
