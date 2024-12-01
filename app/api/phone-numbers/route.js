// app/api/generate-qr/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/serverStuff";
import { find_user } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const user = await find_user({ email: session.user.email });

  // Assuming the user object has properties qrCode1, qrCode2, qrCode3, qrCode4, qrCode5
    const phoneNumbers = [];

    // Iterate over each property in the user object
    for (let i = 1; i <= 5; i++) {
        const qrCodeKey = `qrCode${i}`;
        
        if (user[qrCodeKey] && user[qrCodeKey].phoneNumber) {
            phoneNumbers.push(user[qrCodeKey].phoneNumber.toString());
        }
    }

  let phoneNumbersList = [];

  const ever_attached_numbers_list = user.ever_attached_numbers || [];
  console.log(ever_attached_numbers_list);
  
  for (let ever_attached_number of ever_attached_numbers_list) {
    if (phoneNumbers.includes(ever_attached_number)) {
      phoneNumbersList.push({ phoneNumber: ever_attached_number, active: true });
    } else {
      phoneNumbersList.push({ phoneNumber: ever_attached_number, active: false });
    }
  }

  return NextResponse.json(phoneNumbersList);
}
