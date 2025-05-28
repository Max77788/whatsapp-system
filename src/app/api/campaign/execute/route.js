import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { find_user, update_user } from '@/lib/db';
import { initializeWhatsAppService } from '@/src/lib/whatsappService/whatsappBusinessAPI';

export async function POST(req) {
  try {
    // Get session and validate user
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request data
    const { campaignId, batchSize = 10, interval = 1000 } = await req.json();

    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
    }

    // Get user data
    const user = await find_user({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get campaign data
    const campaign = user.campaigns?.find(c => c.id === campaignId);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Initialize WhatsApp Business API service
    const whatsappService = await initializeWhatsAppService();
    
    // Update campaign status to running
    await update_user(
      { email: session.user.email },
      { 
        $set: { 
          [`campaigns.${campaignId}.status`]: 'running',
          [`campaigns.${campaignId}.startedAt`]: new Date().toISOString()
        }
      }
    );

    const results = {
      success: [],
      failed: [],
      total: campaign.leads.length
    };

    // Process leads in batches
    for (let i = 0; i < campaign.leads.length; i += batchSize) {
      const batch = campaign.leads.slice(i, i + batchSize);
      
      // Process each lead in the batch
      const batchPromises = batch.map(async (lead) => {
        try {
          // Check if message is a template
          if (campaign.message.startsWith('{{') && campaign.message.endsWith('}}')) {
            const templateName = campaign.message.slice(2, -2);
            await whatsappService.sendMessage({
              to: lead.phoneNumber,
              type: 'template',
              template: {
                name: templateName,
                language: { code: 'en' },
                components: [] // Add components if template has variables
              }
            });
          } else {
            await whatsappService.sendMessage({
              to: lead.phoneNumber,
              type: 'text',
              text: { body: campaign.message }
            });
          }

          results.success.push(lead.phoneNumber);
          return { phoneNumber: lead.phoneNumber, status: 'success' };
        } catch (error) {
          console.error(`Error sending message to ${lead.phoneNumber}: ${error.message}`);
          results.failed.push({
            phoneNumber: lead.phoneNumber,
            error: error.message
          });
          return { phoneNumber: lead.phoneNumber, status: 'failed', error: error.message };
        }
      });

      // Wait for all messages in the batch to be sent
      const batchResults = await Promise.all(batchPromises);
      
      // Update campaign progress
      await update_user(
        { email: session.user.email },
        { 
          $set: { 
            [`campaigns.${campaignId}.progress`]: {
              total: results.total,
              success: results.success.length,
              failed: results.failed.length
            }
          }
        }
      );

      // Wait for the specified interval before processing the next batch
      if (i + batchSize < campaign.leads.length) {
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }

    // Update campaign status based on results
    const finalStatus = results.failed.length === 0 ? 'completed' : 
                      results.success.length === 0 ? 'failed' : 'partially_completed';

    await update_user(
      { email: session.user.email },
      { 
        $set: { 
          [`campaigns.${campaignId}.status`]: finalStatus,
          [`campaigns.${campaignId}.completedAt`]: new Date().toISOString(),
          [`campaigns.${campaignId}.results`]: results
        }
      }
    );

    return NextResponse.json({
      message: 'Campaign execution completed',
      results: {
        total: results.total,
        success: results.success.length,
        failed: results.failed.length,
        failedDetails: results.failed
      }
    });

  } catch (error) {
    console.error(`Error executing campaign: ${error.message}`);
    return NextResponse.json(
      { error: `Error executing campaign: ${error.message}` },
      { status: 500 }
    );
  }
} 
