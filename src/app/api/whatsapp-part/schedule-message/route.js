import { NextResponse } from 'next/server';
import { find_user, find_qr_id_by_phone, update_user } from '@/lib/utils';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/serverStuff';
import formidable from 'formidable';
import axios from 'axios';
import { uploadFile } from '@/lib/google_storage/google_storage';

/**
 * @swagger
 * /api/whatsapp-part/schedule-message:
 *   post:
 *     summary: Schedule a WhatsApp message
 *     description: Schedule a message to be sent to multiple recipients with optional media attachment
 *     tags:
 *       - Messages:Sending
 *     security:
 *       - apiKey: []
 *       - session: []
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         schema:
 *           type: string
 *         description: API key for authentication
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - fromNumber
 *               - message
 *               - scheduleTime
 *               - timeZone
 *             properties:
 *               fromNumber:
 *                 type: string
 *                 description: Sender's WhatsApp number
 *               toNumbers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of recipient phone numbers
 *               message:
 *                 type: string
 *                 description: Message content to send
 *               scheduleTime:
 *                 type: string
 *                 format: date-time
 *                 description: Scheduled time to send the message
 *               timeZone:
 *                 type: string
 *                 description: Timezone for scheduling (e.g. "America/New_York")
 *               media:
 *                 type: string
 *                 format: binary
 *                 description: Optional media file attachment
 *               groups:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Target groups to send message to
 *     responses:
 *       200:
 *         description: Message scheduled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Message scheduled successfully!"
 *       500:
 *         description: Server error while scheduling message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to schedule message"
 */

export async function POST(req) {
    try {
        // Parse the incoming form data
        const formData = await req.formData();

        
        const fromNumber = formData.get('fromNumber'); // Get the 'fromNumber' field
        let toNumbers = JSON.parse(formData.get('toNumbers') || '[]'); // Get the 'toNumbers' field
        const message = formData.get('message'); // Get the 'message' field
        const scheduleTime = formData.get('scheduleTime'); // Get the 'scheduleTime' field
        const timeZone = formData.get('timeZone'); // Get the 'timeZone' field
        const media = formData.get('media') || null; // Get the 'media' file or null if not present
        const groups = JSON.parse(formData.get('groups') || '[]'); // Get the 'groups' field
        
        let fileUrl = null;

        if (media !== null) {
            const buffer = Buffer.from(await media.arrayBuffer()); // Get the binary buffer
            const base64Content = buffer.toString('base64'); // Convert the buffer to Base64
            const fileName = `${Date.now()}-${media.originalFilename}`;
            fileUrl = await uploadFile(base64Content, fileName, media.type);
            console.log(`\n\n\nUploaded file to ${fileUrl}\n\n\n`);
        }

        const apiKey = req.headers.get('x-api-key');

        const session = await getServerSession(authOptions);

        const userEmail = session?.user?.email;
        
        const user = session ? await find_user({ email: userEmail }) : await find_user({ apiKey });    

        const currentScheduledMessages = user.scheduledMessages || [];
        
        let toNumbersValue = [];

        if (groups.length > 0) {
            const leads = user.leads;
            
            for (const group of groups) {
                console.log(`group: ${group}`);
                for (const lead of leads) {
                    if (lead.group === group) {
                        console.log(`lead: ${JSON.stringify(lead)}`);
                        toNumbersValue.push(lead.phone_number);
                    } else if (group === 'other' && (lead.group === null || lead.group === undefined || lead.group === '' || lead.group === 'other')) {
                        toNumbersValue.push(lead.phone_number);
                    }
                }
            }
        } else {
            toNumbersValue = toNumbers;
        }

        console.log(`toNumbersValue: ${JSON.stringify(toNumbersValue)}`);

        // Add new scheduled message to the user's record
        currentScheduledMessages.push({ fromNumber, toNumbers: toNumbersValue, message, scheduleTime, timeZone, mediaURL: fileUrl });

        const success = session ? await update_user({ email: session?.user?.email }, { scheduledMessages: currentScheduledMessages }) : await update_user({ apiKey: apiKey }, { scheduledMessages: currentScheduledMessages });

        if (success) {
            return NextResponse.json({ message: 'Message scheduled successfully!' }, { status: 200 });
        } else {
            return NextResponse.json({ error: 'Failed to schedule message' }, { status: 500 });
        }
    } catch (parseError) {
        console.error('Error processing form data:', parseError);
        return NextResponse.json({ error: 'Failed to schedule message' }, { status: 500 });
    }
}
