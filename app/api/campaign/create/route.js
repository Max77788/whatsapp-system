import { NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/serverStuff';
import { update_user } from '@/lib/utils';

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { campaignName, fromNumber, message, leads, media } = await req.json();

  const campaignData = {
    campaignName,
    fromNumber,
    message,
    leads,
    media,
  }
  
  const userEmail = session.user.email;

  const success = await update_user({email: userEmail, credits: 10});


  if (!campaignName || !fromNumber || !message || !leads) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Assuming you have a function to save the campaign to your database
    await saveCampaignToDatabase({
      campaignName,
      fromNumber,
      message,
      leads: JSON.parse(leads),
      media,
      userId: session.user.id,
    });

    return NextResponse.json({ message: 'Campaign created successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
