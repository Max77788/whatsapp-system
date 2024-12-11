import { update_user, find_user } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function POST(req) {
    const { userId } = await req.json();

    const user = await find_user({"id": userId});
    const isPausedNow = user?.isPaused || false;

    await update_user({"id": userId}, {"isPaused": !isPausedNow});
    
    return NextResponse.json({ success: true });
}