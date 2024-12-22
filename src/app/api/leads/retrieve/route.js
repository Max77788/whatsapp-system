import { clientPromiseDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { find_user } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/serverStuff';

/**
 * @openapi
 * /api/leads/retrieve:
 *   get:
 *     summary: Retrieve leads API endpoint
 *     description: Retrieves leads for the authenticated user
 *     tags:
 *       - Leads
 *     security:
 *       - apiKey: []
 *       - session: []
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
*         description: API key for authentication
 *     responses:
 *       200:
 *         description: Leads retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 leads:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

export async function GET(req) {
    try {
        const apiKey = req.headers.get('x-api-key');

        // Attempt to get the session
        const session = await getServerSession(authOptions);

        // Handle missing session
        if (!session) {
            console.log('No session found for the request.');
        }

        const userEmail = session?.user?.email;

        const user = apiKey ? await find_user({ apiKey }) : await find_user({ email: userEmail });
        console.log(`leads: ${JSON.stringify(user.leads)}`);
        
        return NextResponse.json({leads: user.leads});
    } catch (error) {
        console.error("Error saving data:", error);
        return NextResponse.json(
            { error: "Leads not saved" },
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
