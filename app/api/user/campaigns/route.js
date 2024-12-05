import { NextResponse } from "next/server";
import { find_user } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/serverStuff";

export async function GET(request) {
  const apiKey = request.headers.get('x-api-key');

  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;  
  
  const user = session ? await find_user({ email: session.user.email }) : await find_user({ apiKey });
  
  return NextResponse.json(user?.campaigns || []);
}
