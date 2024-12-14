import { update_user } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function POST(req) {
    const { updatedUser } = await req.json();

    console.log(updatedUser);
    
    await update_user({"email": updatedUser.email}, {"planId": updatedUser.planId});
    return NextResponse.json(updatedUser);
}