import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { clientPromise, dbPromise, getDb } from "../utils"; // Setup MongoDB client connection
import { toast } from 'react-toastify';
import { redirect } from 'next/navigation';
import { getServerSession } from "next-auth";
import { NextAuthOptions } from "next-auth";
import { MongoClient } from "mongodb"; // Import MongoClient type
import { UserInterface } from "@/lib/models/User";
import credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';
import { createK8sDeployment } from '@/lib/whatsAppService/kubernetes_part.mjs';


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
            $or: [
              { email_verified: true },            // Case where email_verified is true
              { email_verified: { $exists: false } } // Case where email_verified is not present
            ] }) as UserInterface | null;

          if (!userFound) {
            throw new Error("User with this email not found") // Return null instead of an error object
          }

          console.log(`userFound on signin: ${JSON.stringify(userFound)}`);

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
                console.log(`Entered Google sign-in`);
    
                // Create a unique ID for the user
                const isLatin = (str: string) => /^[A-Za-z\s]*$/.test(str);
                const generateRandomLatinLetters = (length: number) => {
                    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
                    let result = '';
                    for (let i = 0; i < length; i++) {
                        result += characters.charAt(Math.floor(Math.random() * characters.length));
                    }
                    return result;
                };

                const namePart = isLatin(user.name || '') ? user.name?.replace(' ', '-').toLowerCase() : generateRandomLatinLetters(5);
                const unique_id = namePart + "-" + unique_id_aydi_part;
    
                // Ensure the database client is connected
                const db = await getDb();
    
                // Check if the user already exists
                const existingUser = await db.collection("users").findOne({ email: profile?.email });
    
                if (existingUser) {
                  // Automatically link the Google account
                  await db.collection("accounts").updateOne(
                      { userId: existingUser.id, provider: account.provider },
                      {
                          $set: {
                              providerAccountId: account.providerAccountId,
                              type: account.type,
                              provider: account.provider,
                              accessToken: account.access_token,
                              refreshToken: account.refresh_token,
                          },
                      },
                      { upsert: true } // Create the entry if it doesn't exist
                  );
                  return true;
              } else {
                    console.log(`New Google signup for email: ${profile?.email}`);
    
                    // Add custom attributes for a new user
                    const newUser = {
                        id: account.providerAccountId,
                        name: user.name,
                        email: user.email,
                        image: user.image,
                        unique_id
                    };
    
                    // Create a new user document
                    const result = await db.collection("users").insertOne(newUser);
    
                    
                    // Link the OAuth account
                    await db.collection("accounts").insertOne({
                        userId: result.insertedId,
                        provider: "google",
                        providerAccountId: account.providerAccountId,
                        accessToken: account.access_token,
                        refreshToken: account.refresh_token,
                    });
                  
    
                    // Trigger additional workflows for new users (e.g., Kubernetes deployment)
                    console.log(`Triggering Kubernetes deployment for user: ${unique_id}`);
                    await createK8sDeployment(unique_id);
                }
            }
    
            return true; // Allow sign-in
        } catch (error) {
            console.error("Error during Google sign-in:", error);
            throw new Error("Google sign-in failed. Please try again.");
        }
    },
      async redirect({ baseUrl }) {
        return `${baseUrl}/dashboard`; // Otherwise, redirect to the base URL
      },
    },
    debug: process.env.NODE_ENV === "development",
  };

  export async function loginIsRequiredServer(loggedOut: boolean = false) {
    const session = await getServerSession(authOptions);

    console.log(`session: ${JSON.stringify(session)}`);

    
    if (loggedOut) {
      return redirect("/auth/signin?notification=loggedOut");
    }

    if (!session) {
      // toast.error('You must be signed in to view this page');
      return redirect("/auth/signin?notification=login-required");
    }
  }