import { NextResponse } from "next/server";
import { update_user } from "@/lib/utils";
import { authOptions } from "@/lib/auth/serverStuff";
import { getServerSession } from "next-auth";


export async function DELETE(request) {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    await update_user({"email": userEmail}, {"instaAcc": null});
    return NextResponse.json({ message: "Credentials deleted successfully" });
}