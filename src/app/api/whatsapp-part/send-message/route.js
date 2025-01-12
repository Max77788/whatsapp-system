import { NextResponse } from 'next/server';
import { find_user, find_qr_id_by_phone, update_user, findPlanById, checkIsraeliPhoneNumber } from '@/lib/utils';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/serverStuff';
import { uploadFile, deleteFile } from '@/lib/google_storage/google_storage';
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

    
    const fromNumber = formData.get('fromNumber'); // Get the 'fromNumber' field
    let toNumbers = JSON.parse(formData.get('toNumbers') || '[]'); // Get the 'toNumbers' field and parse it to list
    let message = formData.get('message'); // Get the 'message' field
    const media = formData.get('media') || null; // Get the 'media' file or null if not present
    
    console.log(`fromNumber: ${fromNumber}, toNumbers: ${toNumbers}, message: ${message}`);
    if (media) {
      console.log(`Received file: ${media.originalFilename}`);
    } else {
      console.log('No media file uploaded.');
    }

    let messageAndPhoneNumbers = [];

    const apiKey = req.headers.get('x-api-key');

    const session = await getServerSession(authOptions);
    
    const user = session ? await find_user({ email: session.user.email }) : await find_user({ apiKey });
    const leads = user?.leads;
    
    
    const groups = JSON.parse(formData.get('groups') || '[]');
    
    let toNumbersValue = [];

    // console.log("Groups received: ", JSON.stringify(groups))
    
    if (groups.length > 0) {
      const leads = user.leads;
      
      for (const group of groups) {
          console.log(`group: ${group}`);
          for (const lead of leads) {
              if (lead?.groups?.includes(group)) {
                  console.log(`lead: ${JSON.stringify(lead)}`);
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
      const newNumber = checkIsraeliPhoneNumber(toNumber);
      console.log(`newNumber after israeli phone`, newNumber)
      return newNumber
    });
    
    
    for (const toNumber of toNumbersValue) {
      const lead = leads?.find((lead) => lead.phone_number === toNumber);
      
      let personalizedMessage = message;
      
      if (lead) {
        personalizedMessage = personalizedMessage.replace("{{name}}", lead.name);
      } else {
        personalizedMessage = personalizedMessage.replace(/\s*{{name}}\s*/, "");
      }
      let messageAndPhoneNumber = {
        message: personalizedMessage,
        phone_number: toNumber
      }
      console.log(`messageAndPhoneNumber: ${JSON.stringify(messageAndPhoneNumber)}`);

      messageAndPhoneNumbers.push(messageAndPhoneNumber);
    }

    const { clientId, keyThing } = find_qr_id_by_phone(user, fromNumber);
    console.log(`clientId: ${clientId}`);

    const kbBaseAppUrl = user?.kbAppBaseUrl || "http://localhost:4000";
    console.log(`kbBaseAppUrl: ${kbBaseAppUrl}`);

    const payload = {
      clientId,
      messageAndPhoneNumbers
    };

    
    console.log(`\n\n\n\nMedia: ${media}\n\n\n\n`);
    
    if (media !== null) {
      const buffer = Buffer.from(await media.arrayBuffer()); // Get the binary buffer
      const base64Content = buffer.toString('base64'); // Convert the buffer to Base64
      const fileName = `${Date.now()}-${media.originalFilename}`;
      const fileUrl = await uploadFile(base64Content, fileName, media.type);
      console.log(`\n\n\nUploaded file to ${fileUrl}\n\n\n`);
      payload.mediaURL = fileUrl;
    }

    console.log(`\n\n\n\nFinal payload: ${JSON.stringify(payload)}\n\n\n\n`);

    const plan = await findPlanById(user?.planId);

    const subscriptionStartDate = user.startedAt;

    let totalMessagesSentSoFar = 0;
    if (user?.messages_date) {
      totalMessagesSentSoFar = user?.messages_date?.filter(message => message.date >= subscriptionStartDate).reduce((acc, message) => acc + message.count, 0);
    }

    const messagesLimit = plan?.messagesLimit;
    const planActive = user?.planActive;
  
  
    if (planActive) {
      if (messagesLimit) {
      if (totalMessagesSentSoFar + leads.length > messagesLimit) {
        return NextResponse.json({ message: 'You have reached the messages limit for your plan' }, { status: 400 });
      } else {
        return NextResponse.json({ message: 'You have reached the messages limit for your plan' }, { status: 400 });
      }
    } 
    } else {
      return NextResponse.json({ message: 'Your plan is expired' }, { status: 400 });
    }


    const response = await axios.post(`${kbBaseAppUrl}/send-message`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    let sentMessages = user?.sentMessages || 0;

    let messagesDate =  new Date();
    let countMessages = 0;

    if (response.status === 200) {
      const userLeads = user?.leads;
      let isUpdated = false;

      toNumbersValue.forEach((toNumber) => {
        const lead = userLeads?.find((lead) => lead.phone_number === toNumber);
        if (lead) {
          lead.sent_messages = (lead.sent_messages || 0) + 1;
          isUpdated = true;
        }
        sentMessages += 1;
        countMessages += 1;
      });

      // if (payload.mediaURL) {
      //   await deleteFile(payload.mediaURL);
      // }

      /*
      if (!isUpdated) {
        return NextResponse.json(
          { error: 'No matching phoneNumber found in userLeads' },
          { status: 404 }
        );
      }
      */  

      const updatedSentMessages = sentMessages;


      const success = session ? await update_user({ email: session?.user?.email }, { leads: userLeads, sentMessages: updatedSentMessages }) : await update_user({ apiKey: apiKey }, { leads: userLeads, sentMessages: updatedSentMessages });
      const success2 = session ? await update_user({ email: session?.user?.email }, { messages_date: { date: messagesDate, count: countMessages } }, "$push") : await update_user({ apiKey: apiKey }, { messages_date: { date: messagesDate, count: countMessages } }, "$push");

      if (success && success2) {
        return NextResponse.json({ message: 'Message sent successfully' }, { status: 200 });
      } else {
        return NextResponse.json({ error: 'Failed to update userLeads' }, { status: 500 });
      }
    } else {
      console.log('Response status: ', response.status);
      return NextResponse.json({ error: 'Message not sent' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error saving data:', error);
    return NextResponse.json({ error: 'Message not sent' }, { status: 500 });
  }
}
