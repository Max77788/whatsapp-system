import { NextResponse } from 'next/server';
import { find_user } from '@/lib/utils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/serverStuff";

/**
 * @openapi
 * /api/message/get-templates:
 *   get:
 *     summary: Retrieve message templates for a user
 *     description: Gets all message templates associated with a user, authenticated either by session or API key
 *     tags:
 *       - Messages:Templates
 *     security:
 *       - apiKey: []
 *       - session: []
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: false
 *         schema:
 *           type: string
 *         description: API key for authentication (optional if using session)
 *     responses:
 *       200:
 *         description: Successfully retrieved message templates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messageTemplates:
 *                   type: array
 *                   description: Array of message templates
 *       404:
 *         description: No message templates found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */

export async function GET(req) {

    try {
        const apiKey = req.headers.get('x-api-key');

        const session = await getServerSession(authOptions);
    
        const user = session ? await find_user({ email: session.user.email }) : await find_user({ apiKey });
        const messageTemplates = user?.messageTemplates || null;

        if (messageTemplates) {
            console.log("Returning message templates");
            return NextResponse.json(
                { messageTemplates: messageTemplates },
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        } else {
            return NextResponse.json(
                { error: "No message templates found" },
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }
    } catch (error) {
        console.error("Error saving data:", error);
        return NextResponse.json(
            { error: "Leads not saved" },
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
