// src/lib/accessControl.ts
import { HierarchyUser } from '@/types/hierarchy';

export type UserRole = 'SuperAdmin' | 'Admin' | 'Manager' | 'TechLead' | 'Employee';

/**
 * Filters users based on role-based access control
 * SuperAdmin > Admin > Manager > TechLead > Employee
 * 
 * Access rules:
 * - SuperAdmin: Can view all users (Admin, Manager, TechLead, Employee)
 * - Admin: Can view Manager, TechLead, Employee (but not other Admins or SuperAdmin)
 * - Manager: Can view TechLead and Employee
 * - TechLead: Can view Employee (their direct reports)
 * - Employee: Can only view themselves
 */
export function filterUsersByRole(users: HierarchyUser[], currentUserRole: UserRole, currentUserId?: string): HierarchyUser[] {
    switch (currentUserRole) {
        case 'SuperAdmin':
            // SuperAdmin can see everyone
            return users;

        case 'Admin':
            // Admin can see Manager, TechLead, Employee (but not other Admins or SuperAdmin)
            return users.filter(user =>
                user.role === 'Manager' ||
                user.role === 'TechLead' ||
                user.role === 'Employee' ||
                user.id === currentUserId // Can always see themselves
            );

        case 'Manager':
            // Manager can see TechLead and Employee
            return users.filter(user =>
                user.role === 'TechLead' ||
                user.role === 'Employee' ||
                user.id === currentUserId // Can always see themselves
            );

        case 'TechLead':
            // TechLead can see Employee (their direct reports)
            return users.filter(user =>
                user.role === 'Employee' ||
                user.id === currentUserId // Can always see themselves
            );

        case 'Employee':
            // Employee can only see themselves
            return users.filter(user => user.id === currentUserId);

        default:
            return [];
    }
}

/**
 * Checks if a user can view another user based on role hierarchy
 */
export function canViewUser(viewerRole: UserRole, targetUserRole: UserRole, viewerId?: string, targetUserId?: string): boolean {
    // Users can always view themselves
    if (viewerId && targetUserId && viewerId === targetUserId) {
        return true;
    }

    switch (viewerRole) {
        case 'SuperAdmin':
            return true; // SuperAdmin can see everyone

        case 'Admin':
            return targetUserRole === 'Manager' || targetUserRole === 'TechLead' || targetUserRole === 'Employee';

        case 'Manager':
            return targetUserRole === 'TechLead' || targetUserRole === 'Employee';

        case 'TechLead':
            return targetUserRole === 'Employee';

        case 'Employee':
            return false; // Employee can only see themselves

        default:
            return false;
    }
}

/**
 * Checks if a user can manage (edit/delete) another user
 */
export function canManageUser(managerRole: UserRole, targetUserRole: UserRole, managerId?: string, targetUserId?: string): boolean {
    // Users cannot manage themselves
    if (managerId && targetUserId && managerId === targetUserId) {
        return false;
    }

    switch (managerRole) {
        case 'SuperAdmin':
            return true; // SuperAdmin can manage everyone

        case 'Admin':
            return targetUserRole === 'Manager' || targetUserRole === 'TechLead' || targetUserRole === 'Employee';

        case 'Manager':
            return targetUserRole === 'TechLead' || targetUserRole === 'Employee';

        case 'TechLead':
            return targetUserRole === 'Employee';

        case 'Employee':
            return false; // Employee cannot manage anyone

        default:
            return false;
    }
}

/**
 * Gets the role hierarchy level (lower number = higher authority)
 */
export function getRoleLevel(role: UserRole): number {
    switch (role) {
        case 'SuperAdmin': return 1;
        case 'Admin': return 2;
        case 'Manager': return 3;
        case 'TechLead': return 4;
        case 'Employee': return 5;
        default: return 6;
    }
}

/**
 * Checks if a role is higher in hierarchy than another
 */
export function isHigherRole(role1: UserRole, role2: UserRole): boolean {
    return getRoleLevel(role1) < getRoleLevel(role2);
}
