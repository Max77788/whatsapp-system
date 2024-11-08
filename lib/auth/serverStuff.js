import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "../mongodb"; // Setup MongoDB client connection
import { toast } from 'react-toastify';
import { redirect } from 'next/navigation';
import { getServerSession } from "next-auth";

// Define authOptions separately
export const authOptions = {
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email", placeholder: "example@example.com" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          const client = await clientPromise;
          const db = client.db();
  
          // Check if the user exists for sign-in
          const existingUser = await db.collection("users").findOne({ email: credentials.email });
          if (existingUser) {
            // If user exists, check password (for sign-in)
            if (existingUser.password !== credentials.password) {
              throw new Error("Invalid password");
            }
            return existingUser;
          }
  
          // If the user does not exist, create a new user (sign-up)
          const newUser = await db.collection("users").insertOne({
            email: credentials.email,
            password: credentials.password,  // Make sure to hash passwords in a real app
          });
  
          return newUser.ops[0];  // Return the newly created user
        },
      }),
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
    adapter: MongoDBAdapter(clientPromise),
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
      signIn: '/auth/signin', // Custom login page path
      error: '/auth/error', // Custom error page path (optional)
    },

    callbacks: {
    // Modify the JWT token only for CredentialsProvider
    async jwt({ token, account, user }) {
      if (account?.provider === "credentials" && user) {
        // Store user information in the token only for CredentialsProvider
        token.id = user._id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image || ''; // Optionally store image
      } else {
        // Reset session info for other providers like Google
        token.id = null;
        token.email = null;
        token.name = null;
        token.image = null;
      }
      return token;
    },

    // Modify the session object only for CredentialsProvider
    async session({ session, token }) {
      if (token?.id) {
        console.log("Entered session from CredentialsProvider");
        // Populate the session with user data only if it's from CredentialsProvider
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.image;
      } else {
        // For non-CredentialsProvider, clear session user data
        session.user = {
          id: null,
          email: null,
          name: null,
          image: null,
        };
      }
      return session;
    },
      async redirect({ baseUrl }) {
        return `${baseUrl}/dashboard`; // Otherwise, redirect to the base URL
      },
    },
    debug: process.env.NODE_ENV === "development", // Enable debug logs in development mode
  };

  export async function loginIsRequiredServer() {
    const session = await getServerSession(authOptions);

    console.log(`session: ${JSON.stringify(session)}`);

    if (!session) {
      // toast.error('You must be signed in to view this page');
      return redirect("/auth/signin?notification=login-required");
    }
  }