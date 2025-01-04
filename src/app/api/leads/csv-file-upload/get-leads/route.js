import { NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';

export async function POST(req) {
    const formData = await req.formData();
    const file = formData.get('file');
    const nameColumn = formData.get('nameColumn');
    const phoneNumberColumn = formData.get('phoneNumberColumn');

    if (!file) {
        return NextResponse.json({ error: "CSV file is required" }, { status: 400 });
    }

    if (!nameColumn || !phoneNumberColumn) {
        return NextResponse.json({ error: "Both nameColumn and phoneNumberColumn are required" }, { status: 400 });
    }

    try {
        const csvText = await file.text();
        const records = parse(csvText, {
            columns: true,
            skip_empty_lines: true
        });

        const filteredRecords = records.map(record => {
            return {
                ["name"]: record[nameColumn] || null,
                ["phone_number"]: record[phoneNumberColumn] || null
            };
        });

        console.log(filteredRecords);

        return NextResponse.json({ rows: filteredRecords }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to parse CSV file" }, { status: 500 });
    }
}
