import { NextResponse } from 'next/server';
import { update_user, find_user } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/serverStuff';
import { initializeWhatsAppService } from '../../../../lib/whatsappService/whatsappBusinessAPI';

export async function POST(req) {
    try {
        console.log("Disconnecting phone number");
        
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await find_user({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { phoneNumber } = await req.json();
        if (!phoneNumber) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        // Find the phone number in the user's connected phones
        let phoneIndex = -1;
        for (let i = 1; i <= 5; i++) {
            const keyThing = `qrCode${i}`;
            if (user[keyThing] && user[keyThing].phoneNumber === phoneNumber) {
                phoneIndex = i;
                break;
            }
        }

        if (phoneIndex === -1) {
            return NextResponse.json({ error: 'Phone number not found in user account' }, { status: 404 });
        }

        const keyThing = `qrCode${phoneIndex}`;
        
        // Initialize WhatsApp Business API service
        const whatsappService = await initializeWhatsAppService();
        
        try {
            // Note: The WhatsApp Business API (Cloud API) is a cloud-based service
            // where Meta hosts the API. It doesn't have direct "disconnect" endpoints
            // like the unofficial whatsapp-web.js library.
            
            // Access to the WhatsApp Business API is managed through the Meta Business Manager,
            // not through API calls. To completely revoke access, the user would need to
            // do this through the Meta Business Manager interface.
            
            // For our application, we'll update our local database to remove the phone number association.
            // This will prevent the application from using this phone number for sending messages,
            // but the phone number will still be associated with the Meta Business account.
            
            // Update the user's data to remove the phone number
            const success = await update_user(
                { email: session.user.email }, 
                { [keyThing]: { qrString: null, phoneNumber: null, phoneNumberId: null, accessToken: null } }
            );
            
            if (success) {
                console.log(`Successfully disconnected phone number ${phoneNumber} from local database`);
                return NextResponse.json(
                    { 
                        message: `Phone number ${phoneNumber} disconnected successfully from the application`,
                        note: "To completely revoke access, please use the Meta Business Manager interface."
                    },
                    { status: 200 }
                );
            } else {
                return NextResponse.json(
                    { error: `Failed to disconnect phone number ${phoneNumber}` },
                    { status: 500 }
                );
            }
        } catch (error) {
            console.error(`Error disconnecting phone: ${error.message}`);
            return NextResponse.json(
                { error: `Error disconnecting phone: ${error.message}` },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error(`Error in disconnect-phone endpoint: ${error.message}`);
        return NextResponse.json(
            { error: `Error disconnecting phone: ${error.message}` },
            { status: 500 }
        );
    }
}
