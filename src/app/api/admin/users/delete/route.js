import { update_user, getDb } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function POST(req) {
    const { userId } = await req.json();

    const db = await getDb();
    const collection = db.collection("users");
    await collection.deleteOne({ id: userId });
    
    return NextResponse.json({ success: true });
}