import { NextResponse } from 'next/server';
import {
  find_user,
  find_qr_id_by_phone,
  update_user,
  checkIsraeliPhoneNumber
} from '@/lib/utils';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/serverStuff';
import { uploadFile, deleteFile } from '@/lib/google_storage/google_storage';
import axios from 'axios';

export async function POST(req) {
  console.log('[POST] /api/whatsapp-part/execute-campaign :: Starting...');
  const session = await getServerSession(authOptions);

  const apiKey = req.headers.get('x-api-key');
  
  const userEmailSession = session?.user?.email;
  console.log(`[POST] session user email: ${userEmailSession || 'No session user'}`);

  const secondsTable = {
    "hours": 3600,
    "weeks": 604800,
    "days": 86400,
    "months": 2592000,
  };

  try {
    console.log('[POST] Attempting to parse body as JSON...');
    const { campaignId, userUniqueId } = await req.json();
    console.log(`[POST] Received campaignId: ${campaignId}, userUniqueId: ${userUniqueId || 'none'}`);

    let user;

    if (userUniqueId) {
      user = await find_user({ unique_id: userUniqueId });
    } else if (apiKey) {
      user = await find_user({ api_key: apiKey });
    } else {
      user = await find_user({ email: userEmailSession });
    }

    console.log(`[POST] Found user: ${JSON.stringify(user)}`);

    const all_campaigns = user?.campaigns || [];
    console.log(`[POST] All campaigns: ${JSON.stringify(all_campaigns)}`);

    console.log(`[POST] Searching for campaign with ID: ${campaignId}`);
    const campaign = all_campaigns.find((c) => c.campaignId === campaignId);
    console.log(`[POST] Found campaign: ${JSON.stringify(campaign)}`);

    if (!campaign) {
      console.log('[POST] No campaign found. Exiting...');
      return NextResponse.json({ message: 'Campaign not found' }, { status: 404 });
    }

    const leads = campaign?.leads || [];
    console.log(`[POST] Campaign leads: ${JSON.stringify(leads)}`);

    const toNumbers = leads.map((lead) => lead.phone_number);
    console.log(`[POST] All lead phone numbers: ${JSON.stringify(toNumbers)}`);

    const message = campaign?.message;
    const fromNumber = campaign?.fromNumber;
    const mediaURL = campaign?.mediaURL;
    const batchIntervalValue = campaign?.batchIntervalValue;
    const batchIntervalUnit = campaign?.batchIntervalUnit;

    console.log(`[POST] fromNumber: ${fromNumber}, message: ${message}, mediaURL: ${mediaURL}`);
    console.log(`[POST] batchIntervalValue: ${batchIntervalValue}, batchIntervalUnit: ${batchIntervalUnit}`);

    if (campaign?.completed) {
      console.log('[POST] Campaign already marked as completed.');
      return NextResponse.json({ message: 'Campaign already completed' }, { status: 200 });
    }

    const messageAndPhoneNumbers = [];

    // If batchIntervalValue is not 0, respect batchSize; otherwise send to all leads
    const batchSize = campaign?.batchIntervalValue !== 0
      ? campaign?.batchSize
      : leads.length;
    console.log(`[POST] Calculated batchSize: ${batchSize}`);

    const numberOfRunsExecuted = campaign?.numberOfRunsExecuted;
    const totalNumberOfRuns = campaign?.totalNumberOfRuns;

    console.log(`[POST] numberOfRunsExecuted: ${numberOfRunsExecuted}`);
    console.log(`[POST] totalNumberOfRuns: ${totalNumberOfRuns}`);

    const start = numberOfRunsExecuted * batchSize;
    const end = (numberOfRunsExecuted + 1) * batchSize;
    console.log(`[POST] Slicing leads from index ${start} to ${end}...`);

    const adjustedEnd = Math.min(end, toNumbers.length);
    console.log(`[POST] Adjusted end index: ${adjustedEnd}`);

    let toNumbersBatch = toNumbers.slice(start, adjustedEnd);
    console.log(`[POST] toNumbersBatch: ${JSON.stringify(toNumbersBatch)}`);

    // Convert phone numbers for Israeli standard
    toNumbersBatch = toNumbersBatch.map((toNumber) => checkIsraeliPhoneNumber(toNumber));
    console.log(`[POST] After checkIsraeliPhoneNumber: ${JSON.stringify(toNumbersBatch)}`);

    // If no numbers remain in this batch
    if (toNumbersBatch.length === 0) {
      console.log('[POST] No more phone numbers to process for this batch.');
      return NextResponse.json({ message: 'No more numbers to process' }, { status: 200 });
    }

    const kbBaseAppUrl = user?.kbAppBaseUrl || "http://localhost:4000";
    console.log(`[POST] kbBaseAppUrl: ${kbBaseAppUrl}`);

    const { clientId, keyThing } = find_qr_id_by_phone(user, fromNumber);
    console.log(`[POST] Resolved clientId: ${clientId}, keyThing: ${keyThing}`);

    let sentMessages = user?.sentMessages || 0;
    let countMessages = 0;

    const userLeads = user?.leads || [];
    
    for (const toNumber of toNumbersBatch) {
      console.log(`[POST] Processing phone_number: ${toNumber}`);

      const chatId = toNumber.length <= 14 ? `${toNumber}@c.us` : `${toNumber}@g.us`;
      console.log(`[POST] chatId: ${chatId}`);

      const response = await fetch(`${kbBaseAppUrl}/client/${clientId}/chat/${chatId}`);
      const { wasLastMessageRead, myLastMessageTimeStamp, isMyMessageFar } = await response.json();
      console.log(`[POST] wasLastMessageRead: ${wasLastMessageRead}, myLastMessageTimeStamp: ${myLastMessageTimeStamp}, isMyMessageFar: ${isMyMessageFar}`);

      // If the last message wasn't read, skip if doNotDistributeToWhoHaveNotReadLastMessage
      if (!wasLastMessageRead && campaign?.doNotDistributeToWhoHaveNotReadLastMessage) {
        console.log('[POST] Last message was not read; skipping this lead.');
        continue;
      }

      // If last message is not considered "far in time" yet, skip
      if (!isMyMessageFar) {
        const timestamp_now = Math.floor(Date.now() / 1000);
        console.log(`[POST] Current timestamp: ${timestamp_now}`);

        const neededDifference = campaign?.doNotDistributeForRecentValue
          * secondsTable[campaign?.doNotDistributeForRecentUnit];
        console.log(`[POST] neededDifference: ${neededDifference}`);

        if (timestamp_now - myLastMessageTimeStamp < neededDifference) {
          console.log('[POST] Last message was too recent; skipping this lead.');
          continue;
        }
      }

      const lead = leads.find((l) => l.phone_number === toNumber);
      console.log(`[POST] Found lead: ${JSON.stringify(lead)}`);

      let personalizedMessage = message;
      if (lead && lead.phone_number.split("@")[0].length <= 14 && lead.name) {
        personalizedMessage = personalizedMessage.replace("{{name}}", lead.name);
      } else {
        // remove placeholder if no name
        personalizedMessage = personalizedMessage.replace(/\s*{{name}}\s*/, "");
      }

      const messageAndPhoneNumber = {
        message: personalizedMessage,
        phone_number: toNumber
      };
      console.log(`[POST] Final messageAndPhoneNumber: ${JSON.stringify(messageAndPhoneNumber)}`);

      sentMessages += 1;
      countMessages++;

      messageAndPhoneNumbers.push(messageAndPhoneNumber);
    }
    
    

    toNumbers.forEach((toNumber) => {
      const lead = userLeads.find((lead) => lead.phone_number === toNumber);
      if (lead) {
        lead.sent_messages = (lead.sent_messages || 0) + 1;
      }
      sentMessages += 1;
      countMessages += 1;
    });

    const payload = {
      clientId,
      messageAndPhoneNumbers,
      mediaURL
    };
    
    console.log(`[POST] Final payload before sending: ${JSON.stringify(payload)}`);

    const response = await axios.post(`${kbBaseAppUrl}/send-message`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('[POST] Received response from kbBaseAppUrl:', response.status);

    if (response.status === 200) {
      console.log('[POST] Messages sent successfully to the server.');

      // If mediaURL was a one-time resource, you can delete it:
      // if (mediaURL) {
      //   await deleteFile(mediaURL);
      // }

      let messagesDate =  new Date();

      const updatedSentMessages = sentMessages;

      const success32 = session ? await update_user({ email: session?.user?.email }, { leads: userLeads, sentMessages: updatedSentMessages }) : await update_user({ apiKey: apiKey }, { leads: userLeads, sentMessages: updatedSentMessages });
      const success2 = session ? await update_user({ email: session?.user?.email }, { messages_date: { date: messagesDate, count: countMessages } }, "$push") : await update_user({ apiKey: apiKey }, { messages_date: { date: messagesDate, count: countMessages } }, "$push");

      const targetCampaign = all_campaigns.find((c) => c.campaignId === campaignId);
      targetCampaign.numberOfRunsExecuted += 1;
      console.log(`[POST] Updated numberOfRunsExecuted: ${targetCampaign.numberOfRunsExecuted}`);

      if (targetCampaign.numberOfRunsExecuted === targetCampaign.totalNumberOfRuns) {
        targetCampaign.completed = true;
        console.log('[POST] Campaign now marked as completed.');
      }

      const updateFilter = userUniqueId
        ? { unique_id: userUniqueId }
        : { email: userEmailSession };

      console.log('[POST] Attempting to update user campaigns...');
      const success = await update_user(updateFilter, { campaigns: all_campaigns });

      if (success) {
        console.log('[POST] Successfully updated user campaigns in DB.');
        return NextResponse.json({ message: 'Campaign sent successfully' }, { status: 200 });
      } else {
        console.log('[POST] Failed to update user campaigns in DB.');
        return NextResponse.json({ error: 'Failed to update campaigns' }, { status: 500 });
      }
    } else {
      console.log('[POST] kb server returned non-200:', response.status);
      return NextResponse.json({ error: 'Message not sent' }, { status: 404 });
    }
  } catch (error) {
    console.error('[POST] Error during campaign execution:', error);
    return NextResponse.json({ error: 'Message not sent' }, { status: 500 });
  }
}
