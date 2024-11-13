import { NextResponse } from 'next/server';
import createK8sDeployment from '@/lib/whatsAppService/kubernetes_part';


export async function POST(request) {
    const { uniqueId } = await request.json();
    console.log("Started Creating client with uniqueId: ", uniqueId);
    const success = await createK8sDeployment(uniqueId);
    
    if (success) {
        return NextResponse.json(
            { message: `Client created with uniqueId: ${uniqueId}` },
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } else {
        return NextResponse.json(
            { error: `Failed to create client with uniqueId: ${uniqueId}` },
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}