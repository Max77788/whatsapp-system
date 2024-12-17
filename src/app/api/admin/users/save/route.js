import { update_user } from "@/lib/utils";
import { NextResponse } from "next/server";
import { DateTime } from "luxon";

export async function POST(req) {
    const { updatedUser } = await req.json();

    const thirtyDaysFromNow = DateTime.now().plus({ days: 30 }).toISO();
    
    await update_user({"email": updatedUser.email}, {"planId": updatedUser.planId, "planActive": true, "expiresAt": thirtyDaysFromNow});
    return NextResponse.json(updatedUser);
}