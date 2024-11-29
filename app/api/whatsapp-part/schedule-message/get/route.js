import { NextResponse } from "next/server";
import { find_user } from "@/lib/utils";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/serverStuff";

export async function GET(request) {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    const user = await find_user({ email: userEmail });
    return NextResponse.json({ scheduledMessages: user.scheduledMessages });
}