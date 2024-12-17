import { NextResponse } from 'next/server';
import { find_user, find_qr_id_by_phone, update_user, findPlanById } from '@/lib/utils';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/serverStuff';
import { uploadFile, deleteFile } from '@/lib/google_storage/google_storage';
import axios from 'axios';


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

    let toNumbersValue = toNumbers;
    
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
    
    
    for (const toNumber of toNumbersValue) {
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

    const plan = await findPlanById(user?.planId);

    const subscriptionStartDate = user.startedAt;

    let totalMessagesSentSoFar = 0;
    if (user?.messages_date) {
      totalMessagesSentSoFar = user?.messages_date?.filter(message => message.date >= subscriptionStartDate).reduce((acc, message) => acc + message.count, 0);
    } else {
      totalMessagesSentSoFar = 0;
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

      toNumbers.forEach((toNumber) => {
        const lead = userLeads.find((lead) => lead.phone_number === toNumber);
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

      if (!isUpdated) {
        return NextResponse.json(
          { error: 'No matching phoneNumber found in userLeads' },
          { status: 404 }
        );
      }

      const previousSentMessages = user?.sentMessages || 0;
      const updatedSentMessages = previousSentMessages + sentMessages;



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
