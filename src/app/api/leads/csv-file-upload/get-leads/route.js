import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import * as XLSX from "xlsx";

export async function POST(req) {
    const formData = await req.formData();
    const file = formData.get("file");
    const nameColumn = formData.get("nameColumn");
    const phoneNumberColumn = formData.get("phoneNumberColumn");

    if (!file) {
        return NextResponse.json({ error: "File is required" }, { status: 400 });
    }
    if (!nameColumn || !phoneNumberColumn) {
        return NextResponse.json(
            { error: "Both nameColumn and phoneNumberColumn are required" },
            { status: 400 }
        );
    }

    try {
        // 1) Determine if file is CSV or Excel
        const fileName = file.name || "unknown";
        const extension = fileName.split(".").pop().toLowerCase();

        let csvText = "";

        // 2) If xlsx/xls, convert to CSV with xlsx
        if (extension === "xlsx" || extension === "xls") {
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
            const firstSheet = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheet];
            csvText = XLSX.utils.sheet_to_csv(worksheet, { strip: true });
        } else {
            // 3) Otherwise, assume it's already CSV
            csvText = await file.text();
        }

        // 4) Parse CSV data with csv-parse
        const records = parse(csvText, {
            columns: true,
            skip_empty_lines: true,
        });

        // 5) Filter records using nameColumn & phoneNumberColumn
        const filteredRecords = records.map((record) => ({
            name: record[nameColumn] || null,
            phone_number: record[phoneNumberColumn] || null,
        }));

        // 6) Return the records
        return NextResponse.json({ rows: filteredRecords }, { status: 200 });
    } catch (error) {
        console.error("Failed to parse file:", error);
        return NextResponse.json(
            { error: "Failed to parse file" },
            { status: 500 }
        );
    }
}
