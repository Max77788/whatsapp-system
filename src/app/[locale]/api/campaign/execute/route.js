import { NextResponse } from 'next/server';
import { find_user, find_qr_id_by_phone, update_user } from '@/lib/utils';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/serverStuff';
import { uploadFile, deleteFile } from '@/lib/google_storage/google_storage';
import axios from 'axios';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  
  const userEmailSession = session?.user?.email;
  
  

  try {
    const { campaignId, userUniqueId } = await req.json()

    const user = userUniqueId ? await find_user({ unique_id: userUniqueId }) : await find_user({ email: userEmailSession });
    
    const all_campaigns = user?.campaigns || [];
    
    console.log(`campaignId on execute: ${campaignId}`);
    
    const campaign = all_campaigns.find((campaign) => campaign.campaignId === campaignId);

    const leads = campaign?.leads;
    const toNumbers = leads.map((lead) => lead.phone_number);
    const message = campaign?.message;
    const fromNumber = campaign?.fromNumber;
    const mediaURL = campaign?.mediaURL;
    const batchIntervalValue = campaign?.batchIntervalValue;
    const batchIntervalUnit = campaign?.batchIntervalUnit;

    if (campaign?.completed) {
      return NextResponse.json({ message: 'Campaign already completed' }, { status: 200 });
    }

    const messageAndPhoneNumbers = [];

    const batchSize = campaign?.batchIntervalValue !== 0 ? campaign?.batchSize : leads.length;

    const numberOfRunsExecuted = campaign?.numberOfRunsExecuted;
    const totalNumberOfRuns = campaign?.totalNumberOfRuns;
    
    const start = numberOfRunsExecuted * batchSize;
    const end = (numberOfRunsExecuted + 1) * batchSize;

    // Ensure the end index does not exceed the length of toNumbers
    const adjustedEnd = Math.min(end, toNumbers.length);
    const toNumbersBatch = toNumbers.slice(start, adjustedEnd);
 
    // Check if toNumbersBatch is empty
    if (toNumbersBatch.length === 0) {
      return NextResponse.json({ message: 'No more numbers to process' }, { status: 200 });
    }

    for (const toNumber of toNumbersBatch) {
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

    
    console.log(`\n\n\n\nMedia: ${mediaURL}\n\n\n\n`);
    
    payload.mediaURL = mediaURL;

    console.log(`\n\n\n\nFinal payload: ${JSON.stringify(payload)}\n\n\n\n`);

    const response = await axios.post(`${kbBaseAppUrl}/send-message`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      
      // if (mediaURL) {
      //   deleteFile(mediaURL);
      // }

      all_campaigns.find((campaign) => campaign.campaignId === campaignId).numberOfRunsExecuted += 1;
      
      if (all_campaigns.find((campaign) => campaign.campaignId === campaignId).numberOfRunsExecuted === all_campaigns.find((campaign) => campaign.campaignId === campaignId).totalNumberOfRuns) {
        all_campaigns.find((campaign) => campaign.campaignId === campaignId).completed = true;
      }

      const success = userUniqueId ? await update_user({ unique_id: userUniqueId }, { campaigns: all_campaigns }) : await update_user({ email: userEmailSession }, { campaigns: all_campaigns });

      if (success) {
        return NextResponse.json({ message: 'Campaign sent successfully' }, { status: 200 });
      } else {
        return NextResponse.json({ error: 'Failed to update campaigns' }, { status: 500 });
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
