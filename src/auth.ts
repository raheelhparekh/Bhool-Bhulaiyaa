/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth"
import CredentialsProvider from 'next-auth/providers/credentials';

export const { auth, handlers, signIn, signOut }= NextAuth({
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any): Promise<any> {
        try {
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              identifier: credentials.identifier,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            throw new Error("Authentication failed");
          }

          const user = await response.json();

          // Optional: Perform additional checks on the user object
          if (user && user.isVerified) {
            return user;
          } else {
            throw new Error("Account is not verified");
          }
        } catch (error: any) {
          throw new Error(error.message || "Authentication error");
        }
      },
    }),
    // Google
  ],
  callbacks: {
    async jwt({ token, user }) {
      // jwt tokens are stored in user side in frontend
      if (user) {
        token._id = user._id?.toString(); // Convert ObjectId to string
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      // session is stored in server side in backend
      if (token) {
        session.user._id = token._id as string;
        session.user.isVerified = token.isVerified as boolean;
        session.user.isAcceptingMessages = token.isAcceptingMessages as boolean;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/sign-in',
  },
});