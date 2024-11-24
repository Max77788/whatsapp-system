import { NextResponse } from 'next/server';
import { update_user } from '@/lib/utils';

export async function POST(req) {

    const { name, phone_number } = await req.json();
    
    console.log(`req on leads/register: ${JSON.stringify(req)}`);

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