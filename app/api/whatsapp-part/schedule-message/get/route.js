import { NextResponse } from "next/server";
import { find_user } from "@/lib/utils";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/serverStuff";

export async function GET(request) {
    const session = await getServerSession(authOptions);
    console.log("Session:", session);
    const userEmail = session?.user?.email;
    console.log("User Email:", userEmail);
    const user = await find_user({ email: userEmail });
    console.log("User:", user);
    return NextResponse.json({ scheduledMessages: user.scheduledMessages });
}