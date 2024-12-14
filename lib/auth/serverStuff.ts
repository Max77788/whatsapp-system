import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { clientPromise, dbPromise, getDb, update_user } from "../utils"; // Setup MongoDB client connection
import { toast } from 'react-toastify';
import { redirect } from 'next/navigation';
import { getServerSession, Session } from "next-auth";
import { NextAuthOptions } from "next-auth";
import { MongoClient, ObjectId } from "mongodb"; // Import MongoClient type
import { UserInterface } from "@/lib/models/User";
import credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';
import { createK8sDeployment } from '@/lib/whatsAppService/kubernetes_part.mjs';
import { nanoid } from 'nanoid'; // Generate unique keys
import { sendVerificationEmail, sendNotificationEmailToAviv } from '@/actions/register';
import { useLocale } from "next-intl";

interface Credentials {
  name?: string;
  email: string;
  password: string;
}

async function connectDB() {
  await dbPromise; // Ensure the database is connected before executing operations
}

const DATABASE_NAME = process.env.DATABASE_NAME || "whatsappSystem";

const unique_id_aydi_part = uuidv4().slice(-4);

// Define authOptions separately
export const authOptions: NextAuthOptions = {
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email", placeholder: "example@example.com" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials: Record<string, string> | undefined): Promise<UserInterface | null> {
          
          const db = await getDb();
          const userFound = await db.collection("users").findOne({ email: credentials?.email,
             }) as UserInterface | null;

          
          
          if (!userFound) {
            throw new Error("User with this email not found") // Return null instead of an error object
          }

          if (!userFound.email_verified && !userFound.id) {
            const verificationToken = uuidv4().slice(-4);
            
            await sendVerificationEmail(userFound.email, verificationToken);
            
            await update_user({email: userFound.email}, {email_verification_token: verificationToken});
            
            throw new Error("User email not verified. Check your inbox") // Return null instead of an error object
          }



          console.log(`userFound on signin: ${JSON.stringify(userFound)}`);

          
          if (userFound.provider === "google") {
            throw new Error("Please use Google sign-in to login");
          }

          const passwordMatch = await bcrypt.compare(
            credentials!.password,
            userFound.password
          );

          if (!passwordMatch) {
            throw new Error("Wrong Password"); // Return null for wrong password
          }
          return userFound; // Use typeof to reference the value
        }
      }),
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
      EmailProvider({
        server: {
          host: process.env.EMAIL_SERVER_HOST,
          port: process.env.EMAIL_SERVER_PORT,
          auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
          },
        },
        from: process.env.EMAIL_FROM,
      }),
    ],
    pages: {
      error: "/auth/error",
      signIn: "/auth/signin",
      signOut: "/auth/signout",
    },
    session: {
      strategy: "jwt",
    },
    adapter: MongoDBAdapter(clientPromise!),
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      async signIn({ user, account, profile }) {
        try {
            if (account && account.provider === "google") {
                // Create a unique ID for the user
                const isLatin = (str: string) => /^[A-Za-z\s]*$/.test(str);
                const generateRandomLatinLetters = (length: number) => {
                    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
                    let result = '';
                    for (let i = 0; i < length; i++) {
                        result += characters.charAt(Math.floor(Math.random() * characters.length));
                    }
                    return result.toLowerCase();
                };

                const namePart = isLatin(user.name || '') ? user.name?.replace(' ', '-').toLowerCase() : generateRandomLatinLetters(5);
                const unique_id = namePart + "-" + unique_id_aydi_part;
    
                // Ensure the database client is connected
                const db = await getDb();
    
                // Check if the user already exists
                const existingUser = await db.collection("users").findOne({ email: profile?.email });
    
                if (existingUser) {
                  // Ensure the account is linked
                  await db.collection("accounts").updateOne(
                    { provider: account.provider, providerAccountId: account.providerAccountId },
                    {
                        $set: {
                            userId: existingUser._id,
                            type: account.type,
                            provider: account.provider,
                            accessToken: account.access_token,
                            refreshToken: account.refresh_token, // Store refresh token if available
                            expiresAt: account.expires_at,
                        },
                    },
                    { upsert: true } // Create the account link if it doesn't exist
                );
                  return true;
              } else {
                    console.log(`New Google signup for email: ${profile?.email}`);
    
                    const messageLogicListDefault = [{"name": "Default Empty", "rows": [{"type": "includes", "search_term": "", "message_to_send": "", "delay": 5, "platforms": ["wpforms"]}] }];
                    
                    // Add custom attributes for a new user
                    const newUser = {
                        id: account.providerAccountId,
                        name: user.name,
                        provider: "google",
                        email: user.email,
                        image: user.image,
                        unique_id,
                        messageLogicList: messageLogicListDefault,
                        apiKey: nanoid(32),
                        planId: "0",
                        startedAt: new Date(),
                        expiresAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7)
                    };
    
                    // Create a new user document
                    const result = await db.collection("users").insertOne(newUser);
    
                    
                    // Link the account to the newly created user
                    await db.collection("accounts").insertOne({
                      userId: result.insertedId,
                      provider: account.provider,
                      providerAccountId: account.providerAccountId,
                      type: account.type,
                      accessToken: account.access_token,
                      refreshToken: account.refresh_token,
                      expiresAt: account.expires_at,
                  });
    
                    if (process.env.NODE_ENV !== "development") {
                      await createK8sDeployment(unique_id);
                      
                      await sendNotificationEmailToAviv(user.email);
                    }

                    return true;
                }
            }
    
            return true; // Allow sign-in
        } catch (error) {
            console.error("Error during Google sign-in:", error);
            throw new Error("Google sign-in failed. Please try again.");
        }
    },
      async redirect({ url, baseUrl }) {
        // const callbackUrl = new URL(url);
        const locale = url.split('/')[1] || 'en'; // Default to 'en' if no locale
        return `${baseUrl}/${locale}/dashboard`;
      },
    },
    debug: process.env.NODE_ENV === "development",
  };



  export function loginIsRequiredServer(session: any, loggedOut: boolean = false, currentLocale: any = "en") {
    
    if (loggedOut) {
      return redirect(`/${currentLocale}/auth/signin?notification=loggedOut`);
    }

    if (!session) {
      // toast.error('You must be signed in to view this page');
      return redirect(`/${currentLocale}/auth/signin?notification=login-required`);
    }
  }
