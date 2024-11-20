import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { clientPromise, clientPromiseDb }from "../mongodb"; // Setup MongoDB client connection
import { toast } from 'react-toastify';
import { redirect } from 'next/navigation';
import { getServerSession } from "next-auth";
import { NextAuthOptions } from "next-auth";
import { MongoClient } from "mongodb"; // Import MongoClient type
import { UserInterface } from "@/lib/models/User";
import credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';


interface Credentials {
  name?: string;
  email: string;
  password: string;
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
          const client = await clientPromise;
          
          const db = client.db(DATABASE_NAME);
          const userFound = await db.collection("users").findOne({ email: credentials?.email,
            $or: [
              { email_verified: true },            // Case where email_verified is true
              { email_verified: { $exists: false } } // Case where email_verified is not present
            ] }) as UserInterface | null;

          if (!userFound) {
            await client.close();
            throw new Error("User with this email not found") // Return null instead of an error object
          }

          console.log(`userFound on signin: ${JSON.stringify(userFound)}`);

          const passwordMatch = await bcrypt.compare(
            credentials!.password,
            userFound.password
          );

          if (!passwordMatch) {
            await client.close();
            throw new Error("Wrong Password"); // Return null for wrong password
          }
          await client.close();
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
    adapter: MongoDBAdapter(clientPromise),
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      async signIn({ user, account, profile }) {
        let client;
        try {
          // Check if the provider is Google
          if (account && account.provider === "google") {
            console.log(`Entered Google sign-in`);
      
            // Create unique_id for the user
            const unique_id = user.name?.replace(' ', '_').toLowerCase() + "_" + unique_id_aydi_part;
      
            // Custom attributes to add to the user document
            const customAttributes = { unique_id };
            const modifiedUser = { ...user, ...customAttributes };
      
            // Ensure the database client is connected
            client = await clientPromise;
            const db = client.db(DATABASE_NAME);
      
            // Check if the user already exists
            const existingUser = await db.collection("users").findOne({ email: profile?.email });
      
            if (existingUser) {
              // Update the user's OAuth account if they already exist
              if (existingUser._id) {
                await db.collection("accounts").updateOne(
                  { userId: existingUser._id },
                  { $set: { provider: "google", providerAccountId: account.providerAccountId } },
                  { upsert: true } // Create if doesn't exist
                );
              } else {
                console.log(`No user ID found for existing user.`);
              }
            } else {
              // Create a new user document and link the OAuth account
              const result = await db.collection("users").insertOne(modifiedUser);
              await db.collection("accounts").insertOne({
                userId: result.insertedId,
                provider: "google",
                providerAccountId: account.providerAccountId,
              });
      
              // Optionally, trigger additional actions like Kubernetes deployment
              // await createK8sDeployment(unique_id);
            }
          }
      
          return true; // Allow sign-in
        } catch (error) {
          console.error("Error during sign-in:", error);
          throw new Error("Sign-in failed. Please try again.");
        } finally {
          // Ensure the client connection is closed only once
          if (client) {
            await client.close();
          }
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