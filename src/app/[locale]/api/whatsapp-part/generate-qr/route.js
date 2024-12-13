// app/api/generate-qr/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/serverStuff";
import QRCode from "qrcode";
import { find_user } from "@/lib/utils";

export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const user = await find_user({ email: session.user.email });

  let nonNullPhoneNumberCount = 0;

  for (let i = 1; i <= 5; i++) {
    let attr = `qrCode${i}`;
    if (user[attr] && user[attr].phoneNumber !== null) {
            nonNullPhoneNumberCount++;
        }
    }

    let keyThing = ""

    for (let i = 1; i <= 5; i++) {
        let attr = `qrCode${i}`;
        if (user[attr] && user[attr].phoneNumber === null) {
            keyThing = attr
            break
        }
    }

    if (nonNullPhoneNumberCount === 5) {
      return new Response(JSON.stringify({ error: "No more QR codes available" }), { status: 400 });
    }

    const numberOfPhonesConnected = nonNullPhoneNumberCount
    
    console.log(`keyThing: ${keyThing}`)
    
    const qrData = user[keyThing].qrString;

  try {
    // Convert the encoded string into a QR code data URL
    const qrCodeString = await QRCode.toDataURL(qrData);
    // console.log(`QR code string: ${qrCodeString}`)
    return new Response(JSON.stringify({ qrCodeString, numberOfPhonesConnected }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to generate QR code" }), { status: 500 });
  }
}
