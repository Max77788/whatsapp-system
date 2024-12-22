import { NextResponse } from 'next/server';
import { find_user, find_qr_id_by_phone, update_user } from '@/lib/utils';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/serverStuff';
import { uploadFile, deleteFile } from '@/lib/google_storage/google_storage';
import axios from 'axios';


/**
 * @swagger
 * /api/campaign/delete:
 *   delete:
 *     summary: Delete a campaign
 *     description: Deletes a campaign for a user identified by email, API key, or unique ID
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               campaignId:
 *                 type: string
 *                 description: ID of the campaign to delete
 *     responses:
 *       200:
 *         description: Campaign deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Error deleting campaign
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */


export async function DELETE(req) {
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
