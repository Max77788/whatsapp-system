import { NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/serverStuff';
import { update_user } from '@/lib/utils';
import { uploadFile } from '@/lib/google_storage/google_storage';

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
  const scheduleTime = formData.get('scheduleTime');
  const timeZone = formData.get('timeZone');
  const campaignId = formData.get('campaignId');
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
  
  const campaignData = {
    campaignName,
    fromNumber,
    message,
    leads,
    mediaURL: fileUrl,
    scheduleTime,
    timeZone,
    campaignId,
    completed: false
  }
  
  const userEmail = session?.user?.email;
  const apiKey = req.headers.get('x-api-key');
  
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
