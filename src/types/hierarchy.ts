// src/types/hierarchy.ts
import { Node, Edge } from 'reactflow';

export interface HierarchyUser {
    id: string;
    name: string;
    email: string;
    role: 'SuperAdmin' | 'Admin' | 'Manager' | 'TechLead' | 'Employee';
    managerId?: string;
    managerName?: string;
    position?: string;
    department?: string;
    avatar?: string;
}

export interface Permission {
    id: string;
    name: string;
    description: string;
    category: 'user_management' | 'task_management' | 'leave_management' | 'reporting' | 'system_settings';
}

export interface RolePermission {
    role: 'SuperAdmin' | 'Admin' | 'Manager' | 'TechLead' | 'Employee';
    permissions: string[]; // Permission IDs
}

export interface HierarchyNode extends Node {
    data: {
        user: HierarchyUser;
        isSelected?: boolean;
        isDragging?: boolean;
    };
    type: 'hierarchyNode';
}

export type HierarchyEdge = Edge<{
    relationship: 'manager' | 'peer' | 'subordinate';
}> & {
    type: 'hierarchyEdge';
};

export interface HierarchyData {
    nodes: HierarchyNode[];
    edges: HierarchyEdge[];
}

export interface PermissionUpdate {
    userId: string;
    permissions: string[];
}

export interface HierarchyUpdate {
    userId: string;
    managerId?: string;
    position?: string;
    department?: string;
}
