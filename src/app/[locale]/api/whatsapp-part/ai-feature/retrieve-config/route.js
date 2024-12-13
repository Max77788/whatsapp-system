import { find_user } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/serverStuff";

export async function GET(req) {

    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    try {
  
      const user = await find_user({email: userEmail});
      
      const aiSystemConfig = user?.aiSystemConfig || {};
      
      return new Response(
        JSON.stringify(aiSystemConfig),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      console.error('Error processing request:', error);
      return new Response(
        JSON.stringify({ message: 'Failed to process the request' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }
  