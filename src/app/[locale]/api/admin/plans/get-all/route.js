import { getAllPlansFromDatabase } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET(req) {
    const plans = await getAllPlansFromDatabase();
    return NextResponse.json(plans);
}