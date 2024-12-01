import { NextResponse } from 'next/server';
import { fetchGoogleSheetHeaders } from "@/lib/utils";

export async function POST(req) {
    const { url } = await req.json();

    if (!url) {
        return NextResponse.json({ error: "Google Sheets URL is required" }, { status: 400 });
    }

    try {
        const headers = await fetchGoogleSheetHeaders(url);
        return NextResponse.json({ headers }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch headers" }, { status: 500 });
    }
}
