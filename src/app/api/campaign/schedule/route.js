import { NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/serverStuff';
import { update_user, findPlanById } from '@/lib/utils';
import { uploadFile } from '@/lib/google_storage/google_storage';


/**
 * @swagger
 * /api/campaign/schedule:
 *   post:
 *     summary: Schedule a new WhatsApp campaign
 *     description: Creates and schedules a new WhatsApp messaging campaign with optional media attachments and batch sending capabilities
 *     tags:
 *       - Campaigns
 *     security:
 *       - apiKey: []
 *       - session: []
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         schema:
 *           type: string
 *         description: API key for authentication (optional if using session)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - campaignName
 *               - fromNumber
 *               - message
 *               - leads
 *               - scheduleTime
 *               - timeZone
 *             properties:
 *               campaignName:
 *                 type: string
 *                 description: Name of the campaign
 *               fromNumber:
 *                 type: string
 *                 description: Sender's WhatsApp number
 *               message:
 *                 type: string
 *                 description: Message content to be sent
 *               leads:
 *                 type: array
 *                 description: Array of recipient information
 *               media:
 *                 type: string
 *                 format: binary
 *                 description: Media file to be attached (optional)
 *               scheduleTime:
 *                 type: string
 *                 format: date-time
 *                 description: Time to schedule the campaign
 *               timeZone:
 *                 type: string
 *                 description: Timezone for scheduling
 *               campaignId:
 *                 type: string
 *                 description: Unique identifier for the campaign
 *               batchSize:
 *                 type: integer
 *                 description: Number of messages per batch
 *               batchIntervalValue:
 *                 type: integer
 *                 description: Interval value between batches
 *               batchIntervalUnit:
 *                 type: string
 *                 enum: [minutes, hours, days, weeks]
 *                 description: Time unit for batch interval
 *     responses:
 *       200:
 *         description: Campaign scheduled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 campaignId:
 *                   type: string
 *                   description: Campaign ID (only returned for API key authentication)
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message (missing fields or plan limitations)
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */


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
