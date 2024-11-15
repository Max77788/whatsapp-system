import { NextResponse } from 'next/server';
import { update_user } from '@/lib/utils';

export async function POST(req) {

    const { name, email } = await req.json();
    
    const { searchParams } = new URL(req.url);
    const unique_id = searchParams.get('unique_id');
    console.log(`unique_id: ${unique_id}`);

    const success = await update_user({ unique_id: unique_id }, { leads: { name, email } }, "$addToSet");
    
    if (success) {
        return NextResponse.json({ message: "Facebook lead added" });
    } else {
        return NextResponse.json({ message: "Failed to receive message" });
    }
}