import { getDb } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function POST(req) {
    const { updatedPlan } = await req.json();
    
    console.log(updatedPlan);

    const db = await getDb();
    
    // const plan = await db.collection("plans").findOne({ id: updatedPlan.id });

    const { _id, ...planWithoutId } = updatedPlan;
    const plans = await db.collection("plans").updateOne({ id: updatedPlan.id }, { $set: planWithoutId });
    return NextResponse.json(plans);
}