import { clientPromiseDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { update_user } from '@/lib/utils';

export async function POST(req) {
    try {
        // Parse the JSON body
        const { userEmail, leadsList } = await req.json();

        console.log(`userEmail: ${userEmail}, messageLogicList: ${JSON.stringify(leadsList)}`);

        const success = await update_user({ email: userEmail }, { leads: leadsList });
        
        if (success) {
        return NextResponse.json(
                { message: "Leads saved successfully" },
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        } else {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }
    } catch (error) {
        console.error("Error saving data:", error);
        return NextResponse.json(
            { error: "Leads not saved" },
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
