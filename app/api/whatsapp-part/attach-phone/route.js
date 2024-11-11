// app/api/phone/attach-phone.js

import { startContainer } from '@/lib/whatsAppService/docker_container';

export async function POST(req, res) {
    const { unique_id, phone_number } = req.body;

    const db = await clientPromiseDb;
    const userFound = await db.collection("users").findOne({ uniqueId: uniqueId });
    if (userFound) {
        await db.collection("users").updateOne({ uniqueId: uniqueId }, { $set: { qrCode: { qrString: qrCode, clientId: clientId, phoneNumber: phoneNumber } } });
    }

    return new Response(JSON.stringify({ message: `Phone number ${phone_number} successfully attached to ${unique_id}` }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}
