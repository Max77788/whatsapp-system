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


interface Credentials {
  name?: string;
  email: string;
  password: string;
}

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