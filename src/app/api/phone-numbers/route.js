// app/api/generate-qr/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/serverStuff";
import { find_user } from "@/lib/utils";
import { NextResponse } from "next/server";


/**
 * @swagger
 * /api/phone-numbers:
 *   get:
 *     summary: Get user's phone numbers
 *     description: Retrieves a list of phone numbers associated with the user, including their active status
 *     tags:
 *       - Phone Numbers
 *     security:
 *       - apiKey: []
 *       - session: []
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         schema:
 *           type: string
 *         description: Optional API key for authentication
 *     responses:
 *       200:
 *         description: List of phone numbers with their active status
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   phoneNumber:
 *                     type: string
 *                     description: The phone number
 *                   active:
 *                     type: boolean
 *                     description: Whether the phone number is currently active
 */


export async function GET(req) {
  const session = await getServerSession(authOptions);

  const userEmail = session?.user?.email;
  const apiKey = req.headers.get('x-api-key');

  const user = userEmail ? await find_user({ email: userEmail }) : await find_user({ apiKey });

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

  console.log(`Returning phone numbers: ${JSON.stringify(phoneNumbersList)}`)

  return NextResponse.json(phoneNumbersList);
}
