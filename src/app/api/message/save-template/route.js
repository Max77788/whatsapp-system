import { NextResponse } from 'next/server';
import { update_user } from '@/lib/utils';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/serverStuff";

/**
 * @openapi
 * /api/message/save-template:
 *   post:
 *     summary: Save message templates for a user
 *     description: Saves single or multiple message templates associated with a user account
 *     tags:
 *       - Messages:Templates
 *     security:
 *       - apiKey: []
 *       - session: []
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         schema:
 *           type: string
 *         description: Optional API key for authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messageTemplates:
 *                 oneOf:
 *                   - type: array
 *                     items:
 *                       type: object
 *                   - type: object
 *                 description: Message template or array of templates to save
 *     responses:
 *       200:
 *         description: Templates saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: No templates found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
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

export async function POST(req) {
    const apiKey = req.headers.get('x-api-key');

    const session = await getServerSession(authOptions);
    
    // const user = session ? await find_user({ email: session.user.email }) : await find_user({ apiKey });
    try {
        // Parse the JSON body
        const { messageTemplates } = await req.json();

        console.log(`userEmail: ${session?.user?.email}, messageTemplates: ${JSON.stringify(messageTemplates)}`);

        let success;
        if (Array.isArray(messageTemplates) && messageTemplates.length > 0) {
            if (apiKey) {
                success = await update_user({ apiKey: apiKey }, { messageTemplates: messageTemplates[0] }, "$push");
            } else {
                success = await update_user({ email: session?.user?.email }, { messageTemplates: messageTemplates[0] }, "$push");
            }
        } else {
            if (apiKey) {
                success = await update_user({ apiKey: apiKey }, { messageTemplates: messageTemplates }, "$push");
            } else {
                success = await update_user({ email: session?.user?.email }, { messageTemplates: messageTemplates }, "$push");
            }
        }
        
        if (success) {
            return NextResponse.json(
                { message: "Message templates saved successfully" },
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
            { error: "Message templates not saved" },
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}