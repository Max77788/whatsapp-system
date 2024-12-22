import { NextResponse } from "next/server";
import { find_user } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/serverStuff";


/**
 * @swagger
 * /api/user/campaigns:
 *   get:
 *     summary: Get user campaigns
 *     description: Retrieves all campaigns associated with the authenticated user
 *     tags:
 *       - Campaigns
 *     security:
 *       - apiKey: []
 *       - session: []
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: false
 *         schema:
 *           type: string
 *         description: API key for authentication (alternative to session auth)
 *     responses:
 *       200:
 *         description: List of user campaigns
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 description: Campaign object
 */


export async function GET(request) {
  const apiKey = request.headers.get('x-api-key');

  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;  
  
  const user = session ? await find_user({ email: session.user.email }) : await find_user({ apiKey });
  
  return NextResponse.json(user?.campaigns || []);
}
