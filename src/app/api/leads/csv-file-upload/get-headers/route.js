import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import * as XLSX from "xlsx";

export async function POST(req) {
    // 1) Grab the form data
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
        return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    try {
        // 2) Determine if the file is CSV or Excel
        const fileName = file.name || "unknown";
        const extension = fileName.split(".").pop().toLowerCase();

        let csvText = "";

        // 3) If it's xlsx or xls, convert to CSV first
        if (extension === "xlsx" || extension === "xls") {
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
            const firstSheet = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheet];
            csvText = XLSX.utils.sheet_to_csv(worksheet, { strip: true });
        } else {
            // 4) Otherwise, assume it's CSV
            csvText = await file.text();
        }

        // 5) Parse the CSV data
        const records = parse(csvText, {
            columns: true,
            skip_empty_lines: true,
        });

        if (!records.length) {
            return NextResponse.json({ error: "No rows found" }, { status: 400 });
        }

        // 6) Return the headers
        const headers = Object.keys(records[0]);
        return NextResponse.json({ headers }, { status: 200 });

    } catch (error) {
        console.error("Failed to parse file:", error);
        return NextResponse.json({ error: "Failed to parse file" }, { status: 500 });
    }
}

