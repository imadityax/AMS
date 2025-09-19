import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // add id to session.user
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role?: "Admin" | "Manager" | "Employee"; // optional if you track roles
  }
}
