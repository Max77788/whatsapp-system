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
import { createK8sDeployment } from "../whatsAppService/kubernetes_part.mjs";

interface Credentials {
  name?: string;
  email: string;
  password: string;
}

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
          const db = await clientPromiseDb;
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

          if (!passwordMatch) throw new Error("Wrong Password"); // Return null for wrong password
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
        // Check if the provider is Google
        if (account && account.provider === "google") {
          console.log(`Entered Google sign-in`);
          // Custom attributes to add to the user document for Google sign-in
          const unique_id = user.name?.replace(' ', '_').toLowerCase() + "_" + unique_id_aydi_part;
          
          const customAttributes = {
            unique_id: unique_id,
          };

      // Modify the user object by merging with custom attributes
      const modifiedUser = { ...user, ...customAttributes };

      const db = await clientPromiseDb;
      const existingUser = await db.collection("users").findOne({ email: profile?.email });

      if (existingUser) {
        // If user already exists, update the user's document with new attributes
        /*
        await db.collection("users").updateOne(
          { email: user.email },
          { $set: modifiedUser }
        );
        */
       // Link the OAuth account to the existing user
       
       if (existingUser.id) {
       await db.collection("accounts").updateOne(
        { userId: existingUser._id },
        { $set: { provider: "google", providerAccountId: existingUser.id } },
        { upsert: true } // Create if doesn't exist
      );
      return true;
    } else{
      console.log(`No user id found for existing user`);
    }
        
      } else {
        // If the user does not exist, create a new user document and link the OAuth account
        const result = await db.collection("users").insertOne(modifiedUser);
        await db.collection("accounts").insertOne({
            userId: result.insertedId,
            provider: "google",
            providerAccountId: account.providerAccountId
        });

        await createK8sDeployment(unique_id);

        return true;
      }
    }

    return true; // Always return true to allow sign-in
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