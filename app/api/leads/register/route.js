import { NextResponse } from 'next/server';
import { update_user, find_user } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/serverStuff';

export async function POST(req) {

    const apiKey = req.headers.get('x-api-key');

    // Attempt to get the session
    const session = await getServerSession(authOptions);

    // Handle missing session
    if (!session) {
        console.log('No session found for the request.');
    }
    
    const { name, your_name, phone_number, phoneNumbersList } = await req.json();

    // Attempt to find the user based on session (if available)
    const user = session ? await find_user({ email: session.user.email }) : await find_user({ apiKey });
    
    // Determine unique_id
    const unique_id = user?.unique_id;

    console.log(`unique_id: ${unique_id}`);

    const existingLeadsPhones = user?.leads?.map((lead) => lead.phone_number);

    const leadName = name || your_name || null;

    const { searchParams } = new URL(req.url);
    let source = searchParams.get('source', "other");

    const acceptedSources = ["wpforms", "facebook", "contact-forms7"];

    if (!acceptedSources.includes(source)) {
        source = "other";
    }

    if (phoneNumbersList) {
        console.log(`phoneNumbersList: ${phoneNumbersList}`);
        const transformedPhoneNumbersList = phoneNumbersList
            .filter((phone) => !existingLeadsPhones.includes(phone.split("--")[0]))
            .map((phone) => ({name: phone.split("--")[1], phone_number: phone.split("--")[0], source: "other" }));
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
        return NextResponse.json({ message: `Lead from ${source} source added` });
    } else {
        return NextResponse.json({ error: `Lead from ${source} source NOT added` });
    }
}