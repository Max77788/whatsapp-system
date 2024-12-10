import { getAllUsersFromDatabase } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET(req) {
    const users = await getAllUsersFromDatabase();
    return NextResponse.json(users);
}
