import { NextResponse } from 'next/server';
// import { createK8sDeployment } from '@/lib/whatsAppService/kubernetes_part.mjs';

export async function POST(request) {
    try {
        const { uniqueId } = await request.json();

        if (!uniqueId) {
            console.error("uniqueId is missing in the request body.");
            return NextResponse.json(
                { error: 'uniqueId is required' },
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        console.log("Started Creating client with uniqueId:", uniqueId);
        // const success = await createK8sDeployment(uniqueId);

        const success = true;
        if (success) {
            return NextResponse.json(
                { message: `Client created with uniqueId: ${uniqueId}` },
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        } else {
            throw new Error(`Deployment failed for uniqueId: ${uniqueId}`);
        }
    } catch (error) {
        console.error("Error in POST /create-kb-dp:", error);
        return NextResponse.json(
            { error: error.message || "An error occurred" },
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
