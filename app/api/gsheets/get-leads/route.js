import { NextResponse } from 'next/server';
import { fetchGoogleSheetRows } from "@/lib/utils";

export async function POST(req) {
    const { url, nameColumn, phoneNumberColumn } = await req.json();

    if (!url || !nameColumn || !phoneNumberColumn) {
        return NextResponse.json({ error: "Google Sheets URL is required" }, { status: 400 });
    }

    try {
        const rows = await fetchGoogleSheetRows(url, nameColumn, phoneNumberColumn);
        console.log(rows);
        return NextResponse.json({ rows }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch headers" }, { status: 500 });
    }
}
