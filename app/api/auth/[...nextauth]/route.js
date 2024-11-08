import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "../../../../lib/mongodb"; // Setup MongoDB client connection
import { authOptions } from "../../../../lib/auth/helpers";

// Initialize NextAuth with authOptions
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
