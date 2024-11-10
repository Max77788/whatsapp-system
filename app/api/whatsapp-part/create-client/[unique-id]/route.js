import startWhatsAppClient from '@/lib/whatsAppService/whatsAppClient';

export async function POST(request, { params }) {
    const { uniqueId } = params;
    console.log("Started Creating client with uniqueId: ", uniqueId);
    // startWhatsAppClient(uniqueId);
    return new Response('Client created');
}