import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Ensure Prisma client is properly initialized
if (!prisma) {
  throw new Error('Prisma client is not initialized');
}

// Test Prisma connection
prisma.$connect().catch((error) => {
  console.error('Failed to connect to database:', error);
});

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database", // Use database sessions with Prisma adapter
  },
  callbacks: {
    async session({ session, user }) {
      if (user && session.user) {
        session.user.id = user.id;
        try {
          // Get user role from database
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true, name: true, email: true, image: true }
          });

          if (dbUser) {
            session.user.role = dbUser.role;
            session.user.name = dbUser.name;
            session.user.email = dbUser.email;
            session.user.image = dbUser.image;
          }
        } catch (error) {
          console.error('Error fetching user data in session callback:', error);
          // Don't throw error, just continue with basic session data
        }
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Check if user exists by email (created by admin beforehand)
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

            // Update user info from Google if needed
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
                emailVerified: new Date(),
              }
            });

            return true; // Allow sign in
          } else {
            // User doesn't exist - they need to be created by admin first
            console.log(`User ${user.email} not found in database. Admin needs to create user account first.`);
            return false; // Deny sign in
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
    signIn: "/login", // custom login page
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
