import { NextResponse } from 'next/server';
import { update_user, find_user } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/serverStuff';

export async function POST(req) {

    // Attempt to get the session
    const session = await getServerSession(authOptions);

    // Handle missing session
    if (!session) {
        console.log('No session found for the request.');
    }

    // Attempt to find the user based on session (if available)
    const user = session ? await find_user({ email: session.user.email }) : null;
    
    // Determine unique_id
    const unique_id = user?.unique_id || searchParams.get('unique_id');

    console.log(`unique_id: ${unique_id}`);

    const existingLeadsPhones = user?.leads?.map((lead) => lead.phone_number);

    const { name, your_name, phone_number, phoneNumbersList } = await req.json();
    const leadName = name || your_name || null;

    const { searchParams } = new URL(req.url);
    const source = searchParams.get('source', "other");

    if (phoneNumbersList) {
        console.log(`phoneNumbersList: ${phoneNumbersList}`);
        const transformedPhoneNumbersList = phoneNumbersList
            .filter((phone) => !existingLeadsPhones.includes(phone))
            .map((phone) => ({name: null, phone_number: phone, source: "other" }));
        const success = await update_user({ unique_id: unique_id }, { leads: { "$each": transformedPhoneNumbersList } }, "$addToSet");
        if (success) {
            console.log(`Leads added list success on leads/register: ${transformedPhoneNumbersList}`);
            return NextResponse.json({ message: `Leads from ${source} added` });
        } else {
            console.log(`Leads not added: ${transformedPhoneNumbersList}`);
            return NextResponse.json({ message: `Leads from ${source} not added` });
        }
    }
    
    const success = await update_user({ unique_id: unique_id }, { leads: { name: leadName, phone_number: phone_number, source: source } }, "$addToSet");
    
    if (success) {
        return NextResponse.json({ message: `Lead from ${source} added` });
    } else {
        return NextResponse.json({ message: `Lead from ${source} not added` });
    }
}