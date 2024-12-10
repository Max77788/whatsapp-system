import { findPlanById, find_user } from "@/lib/utils";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/serverStuff";

export async function GET(request) {
    const session = await getServerSession(authOptions);
    const user = await find_user({ email: session?.user?.email });
    
    const plan = await findPlanById(user?.planId);
    
    return NextResponse.json(plan || []);
}