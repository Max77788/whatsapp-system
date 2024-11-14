import { NextResponse } from 'next/server';
import { find_user } from '@/lib/utils';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/serverStuff";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const unique_id = searchParams.get('unique_id');
  
    let user;
    if (!unique_id) {
        
  
    const session = await getServerSession(authOptions);
  
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    user = await find_user({ email: session.user.email })
  } else {
    user = await find_user({ unique_id: unique_id });;
  }

   let text_tactics_names_list = [];
   let text_tactics_list = [];

  for (let objectt of user.messageLogic) {
      text_tactics_names_list.push(objectt.name);
      text_tactics_list.push(objectt);
  }

  return NextResponse.json({text_tactics_names_list, text_tactics_list});
}