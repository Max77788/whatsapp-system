import { updateUserPassword } from "@/lib/utils";

export async function POST(request) {
    const { token, newPassword } = await request.json();
  
    // Update the user's password in your database
    await updateUserPassword(token, newPassword); // Implement your logic
  
    return new Response("Password updated successfully", { status: 200 });
  }
  