import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/serverStuff";

// Initialize NextAuth with authOptions
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
