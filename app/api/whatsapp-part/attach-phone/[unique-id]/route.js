// app/api/phone/attach-phone.js

import { startContainer } from '@/lib/whatsAppService/docker_container';

export async function POST(req, { params }) {
    const { unique_id } = await params;
    
    const { phoneNumber } = await req.json();

    try {
        await startContainer(phoneNumber);
        return new Response(`Container started for ${phoneNumber}`, { status: 200 });
    } catch (err) {
        return new Response('Error starting container', { status: 500 });
    }
}
