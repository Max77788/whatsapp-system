import { NextResponse } from 'next/server';
import { find_user, find_qr_id_by_phone, update_user } from '@/lib/utils';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/serverStuff';
import multer from 'multer';
import axios from 'axios';

// Configure multer to store files in memory
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory as Buffer
});

// Middleware to handle file uploads
async function handleUpload(req) {
  return new Promise((resolve, reject) => {
    upload.single('media')(req, null, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);

  try {
    await handleUpload(req); // Parse the multipart/form-data request
    const { fromNumber, toNumbers, message } = req.body;
    const media = req.file;

    console.log(`fromNumber: ${fromNumber}, toNumbers: ${JSON.stringify(toNumbers)}, message: ${message}`);

    const userEmail = session?.user?.email;
    const user = await find_user({ email: userEmail });

    const { clientId, keyThing } = find_qr_id_by_phone(user, fromNumber);

    console.log(`clientId: ${clientId}`);

    const kbBaseAppUrl = user?.kbBaseAppUrl;
    console.log(`kbBaseAppUrl: ${kbBaseAppUrl}`);

    // Prepare payload
    const payload = {
      clientId,
      toNumbers: JSON.parse(toNumbers),
      message,
    };

    if (media) {
      payload.media = media.buffer.toString('base64');
      payload.mediaType = media.mimetype;
      payload.filename = media.originalname;
    }

    // Send message
    const response = await axios.post(`${kbBaseAppUrl}/send-message`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      const userLeads = user?.leads;
      let isUpdated = false;

      toNumbers.forEach((toNumber) => {
        const lead = userLeads.find((lead) => lead.phone_number === toNumber);
        if (lead) {
          lead.sent_messages = (lead.sent_messages || 0) + 1;
          isUpdated = true;
        }
      });

      if (!isUpdated) {
        console.log(`No matching phoneNumber found in userLeads for ${toNumbers}`);
        return NextResponse.json(
          { error: 'No matching phoneNumber found in userLeads' },
          { status: 404 }
        );
      }

      // Update MongoDB
      const success = await update_user({ email: userEmail }, { leads: userLeads });

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

/*
export const config = {
  api: {
    bodyParser: false,
  },
};
*/
