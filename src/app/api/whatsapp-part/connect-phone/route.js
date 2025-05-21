import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/serverStuff';
import { find_user, update_user } from '@/lib/utils';
import { initializeWhatsAppService } from '../../../../lib/whatsappService/whatsappBusinessAPI';

export async function POST(req) {
  try {
    console.log("Connecting phone number");
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await find_user({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    console.log("🚀 ~ POST ~ user:", user)
    console.log("🚀 ~ POST ~ user:", user)

    const { phoneNumber } = await req.json();
    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Find the first available slot for a new phone number
    let keyThing = null;
    for (let i = 1; i <= 5; i++) {
      const attr = `qrCode${i}`;
      if (!user[attr] || !user[attr].phoneNumber) {
        keyThing = attr;
        break;
      }
    }

    if (!keyThing) {
      return NextResponse.json({ error: 'Maximum number of phones reached' }, { status: 400 });
    }
    
    try {
      // In the WhatsApp Business API (Cloud API), connecting a phone number
      // is typically done through the Meta Business Manager interface.
      // For our application flow, we'll store the phone number and prepare
      // for verification.
      
      // Update the user's data to store the phone number
      const success = await update_user(
        { email: session.user.email }, 
        { 
          [keyThing]: { 
            phoneNumber: phoneNumber,
            isVerified: true,
            isVerified: true,
            connectedAt: new Date().toISOString()
          } 
        }
      );
      
      if (success) {
        console.log(`Successfully connected phone number ${phoneNumber}`);
        console.log(`Successfully connected phone number ${phoneNumber}`);
        return NextResponse.json(
          { message: `Phone number ${phoneNumber} connected successfully` },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { error: `Failed to connect phone number ${phoneNumber}` },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error(`Error connecting phone: ${error.message}`);
      return NextResponse.json(
        { error: `Error connecting phone: ${error.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(`Error in connect-phone endpoint: ${error.message}`);
    return NextResponse.json(
      { error: `Error connecting phone: ${error.message}` },
      { status: 500 }
    );
  }
} 