import triggerDockerWhatsAppClientCreation from '@/lib/whatsAppService/whatsAppClient';

export async function POST(request, { params }) {
    const { uniqueId } = params;
    console.log("Started Creating client with uniqueId: ", uniqueId);
    await triggerDockerWhatsAppClientCreation(uniqueId);
    return new Response(JSON.stringify({ message: `Client created with uniqueId: ${uniqueId}` }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}