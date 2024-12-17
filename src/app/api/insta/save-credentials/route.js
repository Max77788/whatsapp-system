import { NextResponse } from "next/server";
import { update_user } from "@/lib/utils";
import { authOptions } from "@/lib/auth/serverStuff";
import { getServerSession } from "next-auth";
import { verifyInstagramCredentials } from "@/src/insta-section/insta_script";

export async function POST(request) {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    const { username, password } = await request.json();

    const instaAcc = { username, password };

    const result = await verifyInstagramCredentials(username, password);

    if (result.success) {
        await update_user({"email": userEmail}, {"instaAcc": instaAcc});
        return NextResponse.json({ message: "Credentials saved successfully" });
    } else {
        return NextResponse.json({ message: "Failed to save credentials" }, { status: 400 });
    }
}