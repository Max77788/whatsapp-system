import { NextResponse } from 'next/server';
import { update_user } from '@/lib/utils';

export async function POST(req) {

    const text = await req.text(); // Use req.text() to get the raw text body
    console.log(`req on leads/register: ${text}`);

    const { name, phone_number } = await req.json();
    
    const { searchParams } = new URL(req.url);
    const unique_id = searchParams.get('unique_id');
    const source = searchParams.get('source', "other");

    console.log(`unique_id: ${unique_id}`);

    const success = await update_user({ unique_id: unique_id }, { leads: { name, phone_number, source: source } }, "$addToSet");
    
    if (success) {
        return NextResponse.json({ message: `Lead from ${source} added` });
    } else {
    }
}