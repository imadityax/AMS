// src/lib/auth-options.ts
import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Ensure Prisma client is properly initialized
if (!prisma) {
  throw new Error('Prisma client is not initialized');
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role; // Add role to JWT token
      }
      return token;
    },
    async session({ session, token, user }) {
      // For database strategy, user object is available
      if (user) {
        session.user.id = user.id;
        session.user.role = (user as any).role;
      } 
      // For JWT strategy, use token
      else if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as "SuperAdmin" | "Admin" | "Manager" | "TechLead" | "Employee";
      }
      
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Check if user exists by email
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: { accounts: true }
          });

          if (existingUser) {
            // Check if Google account is already linked
            const googleAccount = existingUser.accounts.find(
              acc => acc.provider === "google" && acc.providerAccountId === account.providerAccountId
            );

            if (!googleAccount) {
              // Link the Google account to existing user
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state,
                }
              });
            }

            // Update user info from Google
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
                emailVerified: new Date(),
              }
            });

            return true;
          } else {
            console.log(`User ${user.email} not found in database. Admin needs to create user account first.`);
            return false;
          }
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
};