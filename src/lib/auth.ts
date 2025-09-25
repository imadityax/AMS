// src/lib/auth.ts
import { getServerSession } from 'next-auth';
import { authOptions } from './auth-options';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

// Helper function to check user role
export async function getUserRole() {
  const user = await getCurrentUser();
  return user?.role;
}

// Helper function to check if user has specific role
export async function hasRole(requiredRole: "SuperAdmin" | "Admin" | "Manager" | "TechLead" | "Employee") {
  const user = await getCurrentUser();
  return user?.role === requiredRole;
}

// Helper function to check if user has at least one of the required roles
export async function hasAnyRole(requiredRoles: ("SuperAdmin" | "Admin" | "Manager" | "TechLead" | "Employee")[]) {
  const user = await getCurrentUser();
  return user?.role && requiredRoles.includes(user.role);
}