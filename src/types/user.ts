// src/types/user.ts
export type Role = "admin" | "manager" | "employee";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  managerId?: string | null;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: 'Admin' | 'Manager' | 'Employee';
  managerId?: string;
}