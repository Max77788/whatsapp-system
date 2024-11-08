import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "../../../../lib/mongodb"; // Setup MongoDB client connection

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
        const client = await clientPromise; // Wait for the client to connect
        const db = client.db(); // Get the database instance

        const user = await db.collection("users").findOne({ email: credentials.email });
        if (!user) throw new Error("User not found");
        
        if (user.password !== credentials.password) throw new Error("Invalid password");
        
        return user;
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
  adapter: MongoDBAdapter(clientPromise),
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/signin', // Custom login page path
    error: '/auth/error', // Custom error page path (optional)
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }
      return token; // Return the modified token
    },
    
    async session({ session, token }) {
      session.user.id = token.id; // Ensure token is defined before accessing id
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.image = token.image;
      return session; // Return the modified session object
    },

    async redirect({ url, baseUrl }) {
      return `${baseUrl}/dashboard`; // Otherwise, redirect to the base URL
    },
  },
  debug: process.env.NODE_ENV === "development", // Enable debug logs in development mode
};

// Initialize NextAuth with authOptions
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
