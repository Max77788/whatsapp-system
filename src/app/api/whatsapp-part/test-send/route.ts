import { NextRequest, NextResponse } from 'next/server';
import { initializeWhatsAppService } from '../../../../lib/whatsappService/whatsappBusinessAPI';

export async function POST(req: NextRequest) {
  try {
    const { to, message, mediaUrl } = await req.json();

    if (!to || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing "to" or "message" in request body' },
        { status: 400 }
      );
    }

    const service = await initializeWhatsAppService();

    const result = await service.sendMessage(to, message, mediaUrl);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
