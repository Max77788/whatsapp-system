import { NextResponse } from 'next/server';
import { update_user, find_user } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/serverStuff';

/**
 * @openapi
 * /api/leads/register:
 *   post:
 *     summary: Register new leads for a user
 *     description: Registers single or multiple leads with associated details like name, phone number, and group.
 *     tags:
 *       - Leads
 *     security:
 *       - apiKey: []
 *       - session: []
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 *         description: API key for authentication
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           enum: [wpforms, facebook, contact-forms7, other]
 *         description: Source of the lead registration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Lead's name
 *               your_name:
 *                 type: string
 *                 description: Alternative field for lead's name
 *               phone_number:
 *                 type: string
 *                 description: Lead's phone number
 *               group:
 *                 type: string
 *                 description: Group assignment for the lead
 *               phoneNumbersList:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of phone numbers in format "number--name--group"
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message indicating leads were added
 *       400:
 *         description: Error in operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating leads were not added
 */


export async function POST(req) {

    const apiKey = req.headers.get('x-api-key');

    const session = await getServerSession(authOptions);
    
    const user = session ? await find_user({ email: session.user.email }) : await find_user({ apiKey });

    const { name, your_name, phone_number, group, phoneNumbersList } = await req.json();

    // Determine unique_id
    const unique_id = user?.unique_id;

    console.log(`unique_id: ${unique_id}`);

    const existingLeadsPhones = user?.leads?.map((lead) => lead.phone_number) || [];

    const leadName = name || your_name || null;

    const { searchParams } = new URL(req.url);
    let source = searchParams.get('source', "other");

    const acceptedSources = ["wpforms", "facebook", "contact-forms7"];

    if (!acceptedSources.includes(source)) {
        source = "other";
    }

    if (phoneNumbersList) {
        console.log(`phoneNumbersList: ${phoneNumbersList}`);
        // Extract unique group names
        const uniqueGroups = [...new Set(phoneNumbersList.filter(phone => phone.split("--")[2] && phone.split("--")[2] !== "" && phone.split("--")[2] !== "All Contacts")
        .map(phone => phone.split("--")[2]))];
        
        await update_user({ unique_id: unique_id }, { leadGroups: { "$each": uniqueGroups } }, "$addToSet");

        const transformedPhoneNumbersList = phoneNumbersList
            .filter((phone) => !existingLeadsPhones.includes(phone.split("--")[0]))
            .map((phone) => ({name: phone.split("--")[1], phone_number: phone.split("--")[0], source: "other", group: phone.split("--")[2] !== "All Contacts" ? phone.split("--")[2] : "other" }));
        const success = await update_user({ unique_id: unique_id }, { leads: { "$each": transformedPhoneNumbersList } }, "$addToSet");
        
        if (success) {
            console.log(`Leads added list success on leads/register: ${transformedPhoneNumbersList}`);
            return NextResponse.json({ message: `Leads from ${source} added` });
        } else {
            console.log(`Leads not added: ${transformedPhoneNumbersList}`);
            return NextResponse.json({ message: `Leads from ${source} not added` });
        }
    }
    
    const success = await update_user({ unique_id: unique_id }, { leads: { name: leadName, phone_number: phone_number, source: source, group: group || "other" } }, "$addToSet");
    
    if (success) {
        return NextResponse.json({ message: `Lead from ${source} source added` });
    } else {
        return NextResponse.json({ error: `Lead from ${source} source NOT added` });
    }
}