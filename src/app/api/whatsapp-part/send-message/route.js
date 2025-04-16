import { NextResponse } from 'next/server';
import { find_user, find_qr_id_by_phone, update_user, findPlanById, checkIsraeliPhoneNumber } from '@/lib/utils';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/serverStuff';
import { uploadFile, deleteFile } from '@/lib/google_storage/google_storage';
import { initializeWhatsAppService } from '@/lib/whatsappService/whatsappBusinessAPI';
import axios from 'axios';

/**
 * @openapi
 * /api/whatsapp-part/send-message:
 *   post:
 *     summary: Send WhatsApp messages to multiple recipients
 *     description: Sends customized WhatsApp messages with optional media attachments to specified phone numbers or groups
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
 *             properties:
 *               fromNumber:
 *                 type: string
 *                 description: Sender's WhatsApp number
 *               toNumbers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of recipient phone numbers
 *               message:
 *                 type: string
 *                 description: Message text with optional {{name}} placeholder
 *               groups:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of group names to send to
 *               media:
 *                 type: string
 *                 format: binary
 *                 description: Optional media file to attach
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Plan limit reached or invalid request
 *       404:
 *         description: Message not sent or lead not found
 *       500:
 *         description: Server error
 */

export async function POST(req) {
  try {
    // Parse the incoming form data
    const formData = await req.formData();

    const fromNumber = formData.get('fromNumber');
    let toNumbers = JSON.parse(formData.get('toNumbers') || '[]');
    let message = formData.get('message');
    const media = formData.get('media') || null;
    
    console.log(`fromNumber: ${fromNumber}, toNumbers: ${toNumbers}, message: ${message}`);

    let messageAndPhoneNumbers = [];
    const apiKey = req.headers.get('x-api-key');
    const session = await getServerSession(authOptions);
    const user = session ? await find_user({ email: session.user.email }) : await find_user({ apiKey });
    const leads = user?.leads;
    
    const groups = JSON.parse(formData.get('groups') || '[]');
    let toNumbersValue = [];
    
    if (groups.length > 0) {
      const leads = user.leads;
      for (const group of groups) {
          for (const lead of leads) {
              if (lead?.groups?.includes(group)) {
                  toNumbersValue.push(lead.phone_number);
              } else if (group === 'other' && (lead?.groups === null || lead?.groups === undefined || lead?.groups === '' || lead?.groups === 'other')) {
                  toNumbersValue.push(lead.phone_number);
              }
          }
      }
  } else {
      toNumbersValue = toNumbers;
  }

    toNumbersValue = toNumbersValue.map((toNumber) => {
      return checkIsraeliPhoneNumber(toNumber);
    });

    // Initialize WhatsApp Business API service
    const whatsappService = await initializeWhatsAppService(user);
    let mediaUrl = null;

    if (media !== null) {
      const buffer = Buffer.from(await media.arrayBuffer());
      const base64Content = buffer.toString('base64');
      const fileName = `${Date.now()}-${media.originalFilename}`;
      mediaUrl = await uploadFile(base64Content, fileName, media.type);
    }

    // Send messages using the Business API
    for (const toNumber of toNumbersValue) {
      const lead = leads?.find((lead) =>
        lead.phone_number === toNumber || lead.phone_number.includes(toNumber.replace(/^0/, ''))
      );
      
      let personalizedMessage = message;
      if (lead) {
        personalizedMessage = personalizedMessage.replace("{{name}}", lead.name);
      } else {
        personalizedMessage = personalizedMessage.replace(/\s*{{name}}\s*/, "");
      }

      try {
        await whatsappService.sendMessage(toNumber, personalizedMessage, mediaUrl);
        messageAndPhoneNumbers.push({
          message: personalizedMessage,
          phone_number: toNumber,
          status: 'sent'
        });
      } catch (error) {
        console.error(`Error sending message to ${toNumber}:`, error);
        messageAndPhoneNumbers.push({
        message: personalizedMessage,
          phone_number: toNumber,
          status: 'failed',
          error: error.message
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      messageAndPhoneNumbers
    });

  } catch (error) {
    console.error('Error in send-message endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while sending messages' },
      { status: 500 }
    );
  }
}
