import NextAuth from "next-auth";
import { authOptions } from "./auth"; // Import the authOptions from auth.ts

// export const authOptions = {
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//   ],
// };

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
