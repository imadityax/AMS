import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // add id to session.user
      role?: "SuperAdmin" | "Admin" | "Manager" | "TechLead" | "Employee";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role?: "SuperAdmin" | "Admin" | "Manager" | "TechLead" | "Employee";
  }
}
