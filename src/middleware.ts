import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse, NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    // Skip localization for API routes
    if (!pathname.startsWith('/api')) {
        // Internationalization middleware
        const nextIntlResponse = createMiddleware(routing)(req);
        if (nextIntlResponse) {
            return nextIntlResponse;
        }
    }

    // Custom API Key validation logic
    const origin = req.headers.get('origin') || req.headers.get('referer') || '';
    const apiKey = req.headers.get('x-api-key');

    console.log(`origin from middleware: ${origin}`);
    
    if (!origin) return NextResponse.next();

    const internalDomains = ['https://mom-ai-restaurant.lat', 'http://localhost:3000'];
    const isExternalRequest = !internalDomains.some((domain) => origin.startsWith(domain));

    if (isExternalRequest) {
        if (!apiKey) {
            return NextResponse.json({ error: 'API key is required for external requests' }, { status: 401 });
        }

        try {
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
        } catch (error) {
            console.error("Error validating API key:", error);
            return NextResponse.json({ error: 'Failed to validate API key' }, { status: 500 });
        }
    }

    // If no response from middleware, continue the request
    return NextResponse.next();
}

// Configuration for matching specific routes
export const config = {
    matcher: [
        "/", 
        "/:locale(he|en)/:path*",
        "/api/leads/register",
        "/api/leads/retrieve",
        "/api/message/get-templates",
        "/api/message/save-template",
        "/api/whatsapp-part/send-message",
        "/api/whatsapp-part/schedule-message",
        "/api/user/campaigns",
        "/api/campaign/create",
        "/api/campaign/schedule",
        "/api/campaign/delete",
        "/api/phone-numbers"
    ]
};
