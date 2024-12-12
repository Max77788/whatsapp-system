import { NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/serverStuff';
import { update_user, findPlanById } from '@/lib/utils';
import { uploadFile } from '@/lib/google_storage/google_storage';

export async function POST(req) {
  const session = await getServerSession(authOptions);

  // Parse the incoming form data
  const formData = await req.formData();

  const campaignName = formData.get('campaignName');
  const fromNumber = formData.get('fromNumber');
  const message = formData.get('message');
  const leads = JSON.parse(formData.get('leads') || '[]');
  const media = formData.get('media') || null;
  const scheduleTime = formData.get('scheduleTime');
  const timeZone = formData.get('timeZone');
  const campaignId = formData.get('campaignId');
  const batchSize = parseInt(formData.get('batchSize'));
  const batchIntervalValue = parseInt(formData.get('batchIntervalValue') || 0);
  const batchIntervalUnit = formData.get('batchIntervalUnit');
  
  if (!campaignName || !fromNumber || !message || !leads || !scheduleTime || !timeZone) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  let fileUrl = null;
  if (media !== null) {
    const buffer = Buffer.from(await media.arrayBuffer()); // Get the binary buffer
    const base64Content = buffer.toString('base64'); // Convert the buffer to Base64
    const fileName = `${Date.now()}-${media.originalFilename}`;
    fileUrl = await uploadFile(base64Content, fileName, media.type);
  }

  const scheduledTimes = [];

  let numberOfRuns = 0;

  if (batchIntervalValue !== 0) {
  let batchIntervalValueCalculated;
  if (batchIntervalUnit === 'minutes') {
    batchIntervalValueCalculated = batchIntervalValue;
  } else if (batchIntervalUnit === 'hours') {
    batchIntervalValueCalculated = batchIntervalValue * 60;
  } else if (batchIntervalUnit === 'days') {
    batchIntervalValueCalculated = batchIntervalValue * 60 * 24;
  } else if (batchIntervalUnit === 'weeks') {
    batchIntervalValueCalculated = batchIntervalValue * 60 * 24 * 7;
  }
  
  numberOfRuns = Math.ceil(leads.length / batchSize);
  for (let i = 0; i < numberOfRuns; i++) {
    const scheduledTime = new Date(scheduleTime);
    scheduledTime.setMinutes(scheduledTime.getMinutes() + (i * batchIntervalValueCalculated));
      scheduledTimes.push(scheduledTime.toISOString());
    }
  } else {
    numberOfRuns = 1;
    scheduledTimes.push(scheduleTime);
  }

  

  
  
  
  
  const campaignData = {
    campaignName,
    fromNumber,
    message,
    leads,
    mediaURL: fileUrl,
    scheduledTimes,
    timeZone,
    campaignId,
    batchSize,
    batchIntervalValue,
    batchIntervalUnit,
    totalNumberOfRuns: numberOfRuns,
    numberOfRunsExecuted: 0,
    completed: false,
  }
  
  const userEmail = session?.user?.email;
  const apiKey = req.headers.get('x-api-key');

  const user = session ? await find_user({email: userEmail}) : await find_user({apiKey: apiKey});

  const plan = await findPlanById(user?.planId);

  const subscriptionStartDate = user.startedAt;

  let totalMessagesSentSoFar = 0;
  if (user?.messages_date) {
    totalMessagesSentSoFar = user?.messages_date?.filter(message => message.date >= subscriptionStartDate).reduce((acc, message) => acc + message.count, 0);
  } else {
    totalMessagesSentSoFar = 0;
  }

  const messagesLimit = plan?.messagesLimit;
  
  if (messagesLimit) {
  if (totalMessagesSentSoFar + leads.length > plan?.messagesLimit) {
    return NextResponse.json({ message: 'You have reached the messages limit for your plan' }, { status: 400 });
  }
}
  
  const success = userEmail ? await update_user({email: userEmail}, {campaigns: campaignData}, "$push") : await update_user({apiKey: apiKey}, {campaigns: campaignData}, "$push");

  
  if (session) {
  if (success) {
    return NextResponse.json({ message: 'Campaign created successfully' }, { status: 200 });
  } else {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
  } else {
    if (success) {
      return NextResponse.json({ message: 'Campaign created successfully', campaignId: campaignId }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  }
}
