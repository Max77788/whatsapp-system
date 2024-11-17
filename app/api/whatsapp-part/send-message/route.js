import { NextResponse } from 'next/server';
import { find_user, find_qr_id_by_phone, update_user } from '@/lib/utils';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/serverStuff';
import axios from 'axios';

export async function POST(req) {
    const session = await getServerSession(authOptions);

    try {
        const userEmail = session?.user?.email;
        
        // Parse the JSON body
        const { fromNumber, toNumbers, message } = await req.json();

        console.log(`fromNumber: ${fromNumber}, toNumbers: ${JSON.stringify(toNumbers)}, message: ${message}`);

        const user = await find_user({ email: userEmail });

        const { clientId, keyThing } = find_qr_id_by_phone(user, fromNumber);

        console.log(`clientId: ${clientId}`);

        /*
        // That's how we usually get kb base app url
        const kbBaseAppUrl = user?.kbBaseAppUrl;
        */

        const kbBaseAppUrl = 'http://localhost:4000';

        const response = await fetch(`${kbBaseAppUrl}/send-message`, {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    clientId,
                    toNumbers,
                    message
                })
        });
        
        if (response.status === 200) {
            const userLeads = user?.leads;
            let isUpdated = false;

            toNumbers.forEach(toNumber => {
                const lead = userLeads.find((lead) => lead.phone_number === toNumber);
                if (lead) {
                    lead.sent_messages = (lead.sent_messages || 0) + 1; // Increment sentMessages
                    isUpdated = true;
                }
            });
    
            if (!isUpdated) {
                console.log(`No matching phoneNumber found in userLeads for ${toNumbers}`);
                return;
            }

            // Push updated userLeads array to MongoDB
            const success = await update_user({ email: userEmail }, { leads: userLeads });
            
            if (success) {
            return NextResponse.json(
                { message: "Message sent successfully" },
                { status: 200, headers: { 'Content-Type': 'application/json' } }
                );
            } else {
                return NextResponse.json(
                    { error: "Failed to update userLeads" },
                    { status: 404, headers: { 'Content-Type': 'application/json' } }
                );
            }
        } else {
            console.log("Response status: ", response);
            return NextResponse.json(
                { error: "Message not sent" },
                { status: 404, headers: { 'Content-Type': 'application/json' } }
                );
            }
    } catch (error) {
        console.error("Error saving data:", error);
        return NextResponse.json(
            { error: "Message not sent" },
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}