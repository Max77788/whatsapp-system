import { NextResponse } from "next/server";
import { find_user } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/serverStuff";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  const user = await find_user({ email: session?.user?.email });
  return NextResponse.json(user || []);
}
