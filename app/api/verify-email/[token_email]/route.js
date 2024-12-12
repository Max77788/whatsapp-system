import { NextRequest, NextResponse } from "next/server";
import { clientPromiseDb } from "@/lib/mongodb";
import { signIn } from "next-auth/react";
import { redirect } from "next/navigation";
import { createK8sDeployment } from "@/lib/whatsAppService/kubernetes_part.mjs";

export async function GET(req, { params }) {
    const { token_email } = await params;
    console.log(`Token received: ${token_email}`);

    const db = await clientPromiseDb;
    const userFound = await db.collection("users").findOne({ email_verification_token : token_email });

    if (userFound) {
        // Modify the document's properties
        await db.collection("users").updateOne(
          { email_verification_token: token_email },   // Filter by the token to locate the document
          {
            $set: {
              email_verified: true    // Example of adding a timestamp
            }   
          }
        );
        // await createK8sDeployment(userFound.unique_id);
        return redirect("/auth/signin?notification=email-verified")
      } else {
        return redirect("/auth/signin?notification=invalid-token")
      }
}
