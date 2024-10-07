import NextAuth from "next-auth";
import { authOptions } from "./auth"; // Import the authOptions from auth.ts

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
