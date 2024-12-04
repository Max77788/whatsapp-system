import { NextResponse } from 'next/server';
import { find_user, find_qr_id_by_phone, update_user } from '@/lib/utils';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/serverStuff';
import { uploadFile, deleteFile } from '@/lib/google_storage/google_storage';
import axios from 'axios';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // Required for Formidable to handle file uploads
  },
};

export async function POST(req) {
  const session = await getServerSession(authOptions);

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

    const userEmail = session?.user?.email;
    const user = await find_user({ email: userEmail });
    const leads = user?.leads;
    
    
    const groups = JSON.parse(formData.get('groups') || '[]');

    if (groups.length > 0) {
      toNumbers = toNumbers.filter((toNumber) => groups.includes(user?.leads.find((lead) => lead.phone_number === toNumber)?.group || "other"));
    }
    
    
    for (const toNumber of toNumbers) {
      const lead = leads.find((lead) => lead.phone_number === toNumber);
      
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

    const response = await axios.post(`${kbBaseAppUrl}/send-message`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    let sentMessages = user?.sentMessages || 0;

    if (response.status === 200) {
      const userLeads = user?.leads;
      let isUpdated = false;

      toNumbers.forEach((toNumber) => {
        const lead = userLeads.find((lead) => lead.phone_number === toNumber);
        if (lead) {
          lead.sent_messages = (lead.sent_messages || 0) + 1;
          isUpdated = true;
        }
        sentMessages += 1;
      });

      if (payload.mediaURL) {
        await deleteFile(payload.mediaURL);
      }

      if (!isUpdated) {
        console.log(`No matching phoneNumber found in userLeads for ${parsedToNumbers}`);
        return NextResponse.json(
          { error: 'No matching phoneNumber found in userLeads' },
          { status: 404 }
        );
      }

      const success = await update_user({ email: userEmail }, { leads: userLeads, sentMessages });

      if (success) {
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
