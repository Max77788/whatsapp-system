import { update_user } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/serverStuff";

export async function POST(req) {

    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    try {
      const body = await req.json(); // Parse JSON body
      const { instructions, isOn } = body;
  
      // Add logic to handle saving instructions
      console.log('Received instructions:', instructions);
  
      const success = await update_user({email: userEmail}, {aiSystemConfig: {instructions, isOn}});
      
      return new Response(
        JSON.stringify({ message: 'Instructions saved successfully' }),
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
  
  export function GET() {
    return new Response('Method Not Allowed', { status: 405 });
  }
  