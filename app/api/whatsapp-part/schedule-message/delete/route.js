import { NextResponse } from "next/server";
import { find_user, update_user } from "@/lib/utils";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/serverStuff";

export async function POST(request) {
    const { messageToDelete } = await request.json();
    
    const session = await getServerSession(authOptions);
    console.log("Session:", session);
    const userEmail = session?.user?.email;
    console.log("User Email:", userEmail);
    const user = await find_user({ email: userEmail });
    console.log("User:", user);

    const scheduledMessages = user?.scheduledMessages
    
    // Use `filter` to exclude the element
    const updatedList = scheduledMessages.filter(item => {
    // Compare each object to the value to remove
        return JSON.stringify(item) !== JSON.stringify(messageToDelete);
    });

    const success = await update_user({ email: userEmail}, { scheduledMessages: updatedList });

    
    if (success) {
        return NextResponse.json({ success: true });
    } else {
        return NextResponse.json({ success: false });
    }
}