"use server"
import { clientPromiseDb } from "@/lib/mongodb";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import { Resend } from 'resend';
import { v4 as uuidv4 } from 'uuid';

const resend = new Resend(process.env.RESEND_API_KEY);

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// Create user with a verification token
const sendVerificationEmail = async (recipientEmail: string, verificationToken: string) => {
    const verificationLink = `${BASE_URL}/api/verify-email/${verificationToken}`;

    const EMAIL_HTML = `
    <p>Welcome to the app!</p>
    <p>To finish registration, please follow this link:</p>
    <p><a href="${verificationLink}"><u>Click here.</u></a></p>
    `

    await resend.emails.send({
        from: 'contact@mom-ai-restaurant.lat',
        to: recipientEmail,
        subject: 'Verify your email',
        html: EMAIL_HTML,
    });

    console.log(`Verification email sent to ${recipientEmail} with token ${verificationToken}`);
}

export const register = async (values: any) => {
    const { email, password, name } = values;

    console.log(`email: ${email}, password: ${password}, name: ${name}`);

    try {
        const db = await clientPromiseDb;
        const userFound = await db.collection("users").findOne({ email: email });
        if(userFound){
            return {
                error: 'Email already exists!'
            }
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = uuidv4().slice(-5);
        const unique_id = name.replace(' ', '_').toLowerCase() + "_" + uuidv4();

        const user = new User({
          unique_id: unique_id,
          name: name,
          email: email,
          password: hashedPassword,
          email_verified: false,
          email_verification_token: verificationToken
        });
        console.log(`user: ${JSON.stringify(user)}`);
        
        await db.collection("users").insertOne(user);
        
        await sendVerificationEmail(email, verificationToken);

        return {
            success: 'User created successfully. Please check your email for verification.',
            email_verification_token: verificationToken
        }

    } catch(e) {
        console.log(e);
    }
}