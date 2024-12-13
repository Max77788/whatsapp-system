import { NextResponse } from 'next/server';
import { find_user, find_qr_id_by_phone, update_user } from '@/lib/utils';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/serverStuff';
import { uploadFile, deleteFile } from '@/lib/google_storage/google_storage';
import axios from 'axios';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  
  const userEmailSession = session?.user?.email;
  const apiKey = req.headers.get('x-api-key');
  try {
    const { campaignId, userUniqueId } = await req.json()

    const user = userUniqueId ? await find_user({ unique_id: userUniqueId }) : userEmailSession ? await find_user({ email: userEmailSession }) : await find_user({ apiKey: apiKey });
    
    const all_campaigns = user?.campaigns || [];
    
    const filtered_campaigns = all_campaigns.filter((campaign) => campaign.campaignId !== campaignId);

      const success = userUniqueId ? await update_user({ unique_id: userUniqueId }, { campaigns: filtered_campaigns }) : userEmailSession ? await update_user({ email: userEmailSession }, { campaigns: filtered_campaigns }) : await update_user({ apiKey: apiKey }, { campaigns: filtered_campaigns });

      if (success) {
        return NextResponse.json({ message: `Campaign ${campaignId} deleted successfully` }, { status: 200 });
      } else {
        return NextResponse.json({ error: `Failed to delete campaign ${campaignId}` }, { status: 500 });
      }
  } catch (error) {
    console.error('Error saving data:', error);
    return NextResponse.json({ error: `Failed to delete campaign ${campaignId}` }, { status: 500 });
  }
}
