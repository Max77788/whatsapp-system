import { getAllApiKeys } from "@/lib/utils";

export async function POST(req) {
    const { apiKey } = await req.json();
    
    const allApiKeys = await getAllApiKeys();

    if (!allApiKeys.includes(apiKey)) {
        return new Response(JSON.stringify({ error: "Invalid API key" }), { 
            status: 401, 
            headers: { "Content-Type": "application/json" }
        });
    }

    return new Response(JSON.stringify({ message: "API key validated" }), { 
        status: 200, 
        headers: { "Content-Type": "application/json" }
    });
}