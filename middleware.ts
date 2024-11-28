import { NextResponse, NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    const origin = req.headers.get('origin') || req.headers.get('referer') || '';
    const apiKey = req.headers.get('x-api-key');

    console.log(`origin from middleware: ${origin}`);
    
    if (!origin) return NextResponse.next();

    const internalDomains = ['https://mom-ai-restaurant.lat'];
    const isExternalRequest = !internalDomains.some((domain) => origin.startsWith(domain));

    if (isExternalRequest) {
        if (!apiKey) {
            return NextResponse.json({ error: 'API key is required for external requests' }, { status: 401 });
        }

        // Validate API key by calling an internal API route
        const response = await fetch(`${req.nextUrl.origin}/api/validate-api-key`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey }),
        });

        if (!response.ok) {
            const error = await response.json();
            return NextResponse.json(error, { status: response.status });
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/api/leads/register',
        '/api/message/get-templates'
    ],
};
