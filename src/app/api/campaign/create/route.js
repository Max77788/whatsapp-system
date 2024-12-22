import { NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/serverStuff';
import { update_user, find_user, findPlanById } from '@/lib/utils';
import { uploadFile } from '@/lib/google_storage/google_storage';
import { v4 as uuidv4 } from 'uuid';

/**
 * @swagger
 * /api/campaign/create:
 *   post:
 *     summary: Create a new messaging campaign
 *     description: Creates a new campaign with message scheduling and batch processing capabilities
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
 *         description: API key for authentication
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
 *             properties:
 *               campaignName:
 *                 type: string
 *                 description: Name of the campaign
 *               fromNumber:
 *                 type: string
 *                 description: Sender phone number
 *               message:
 *                 type: string
 *                 description: Message content to be sent
 *               leads:
 *                 type: array
 *                 description: Array of recipient leads
 *               media:
 *                 type: string
 *                 format: binary
 *                 description: Optional media file to attach
 *               campaignId:
 *                 type: string
 *                 description: Optional custom campaign ID
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
 *         description: Campaign created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 campaignId:
 *                   type: string
 *       400:
 *         description: Bad request or validation error
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 */

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Parse the incoming form data
  const formData = await req.formData();

  const campaignName = formData.get('campaignName');
  const fromNumber = formData.get('fromNumber');
  const message = formData.get('message');
  const leads = JSON.parse(formData.get('leads') || '[]');
  const media = formData.get('media') || null;
  let campaignId = formData.get('campaignId');
  const batchSize = parseInt(formData.get('batchSize'));
  const batchIntervalValue = parseInt(formData.get('batchIntervalValue'));
  const batchIntervalUnit = formData.get('batchIntervalUnit');

  if (!campaignId) {
    campaignId = campaignName.toLowerCase().replace(/\s+/g, '-') + '-' + uuidv4().slice(-4);
  }
  
  if (!campaignName || !fromNumber || !message || !leads) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  let fileUrl = null;
  if (media !== null) {
    const buffer = Buffer.from(await media.arrayBuffer()); // Get the binary buffer
    const base64Content = buffer.toString('base64'); // Convert the buffer to Base64
    const fileName = `${Date.now()}-${media.originalFilename}`;
    fileUrl = await uploadFile(base64Content, fileName, media.type);
  }

  const currentDateTimeUTC = new Date().toISOString();
  const timeZone = "GMT+00:00";

  let scheduledTimes = [];
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
    const scheduledTime = new Date(currentDateTimeUTC);
    scheduledTime.setMinutes(scheduledTime.getMinutes() + (i * batchIntervalValueCalculated));
      scheduledTimes.push(scheduledTime.toISOString());
    }
  } else {
    numberOfRuns = 1;
    scheduledTimes.push(currentDateTimeUTC);
  }

  const campaignData = {
    campaignName,
    fromNumber,
    message,
    leads,
    mediaURL: fileUrl,
    timeZone,
    scheduledTimes,
    campaignId,
    batchSize,
    batchIntervalValue,
    batchIntervalUnit,
    totalNumberOfRuns: numberOfRuns,
    numberOfRunsExecuted: 0,
    completed: false
  }
  
  const apiKey = req.headers.get('x-api-key');

  const userEmail = session?.user?.email;  

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

  const success = session ? await update_user({email: userEmail}, {campaigns: campaignData}, "$push") : await update_user({apiKey: apiKey}, {campaigns: campaignData}, "$push");

  
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
