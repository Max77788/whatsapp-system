import { NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';

export async function POST(req) {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
        return NextResponse.json({ error: "CSV file is required" }, { status: 400 });
    }

    try {
        const csvText = await file.text();
        const records = parse(csvText, {
            columns: true,
            skip_empty_lines: true
        });

        const headers = Object.keys(records[0]);

        return NextResponse.json({ headers }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to parse CSV file" }, { status: 500 });
    }
}
