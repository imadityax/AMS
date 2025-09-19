// src/lib/seedPermissions.ts
import { prisma } from './prisma';

export const DEFAULT_PERMISSIONS = [
  // User Management
  { name: 'create_user', description: 'Create new user accounts', category: 'USER_MANAGEMENT' },
  { name: 'edit_user', description: 'Modify user information', category: 'USER_MANAGEMENT' },
  { name: 'delete_user', description: 'Remove user accounts', category: 'USER_MANAGEMENT' },
  { name: 'view_users', description: 'View user list and details', category: 'USER_MANAGEMENT' },
  { name: 'manage_hierarchy', description: 'Modify organizational structure', category: 'USER_MANAGEMENT' },
  
  // Task Management
  { name: 'create_task', description: 'Create new tasks', category: 'TASK_MANAGEMENT' },
  { name: 'assign_task', description: 'Assign tasks to users', category: 'TASK_MANAGEMENT' },
  { name: 'edit_task', description: 'Modify task details', category: 'TASK_MANAGEMENT' },
  { name: 'delete_task', description: 'Remove tasks', category: 'TASK_MANAGEMENT' },
  { name: 'view_all_tasks', description: 'View tasks across organization', category: 'TASK_MANAGEMENT' },
  
  // Leave Management
  { name: 'approve_leave', description: 'Approve leave requests', category: 'LEAVE_MANAGEMENT' },
  { name: 'reject_leave', description: 'Reject leave requests', category: 'LEAVE_MANAGEMENT' },
  { name: 'view_leave_requests', description: 'View all leave requests', category: 'LEAVE_MANAGEMENT' },
  { name: 'manage_leave_policies', description: 'Configure leave policies', category: 'LEAVE_MANAGEMENT' },
  
  // Reporting
  { name: 'view_reports', description: 'Access reporting dashboard', category: 'REPORTING' },
  { name: 'export_data', description: 'Export system data', category: 'REPORTING' },
  { name: 'view_analytics', description: 'Access analytics and insights', category: 'REPORTING' },
  
  // System Settings
  { name: 'system_settings', description: 'Configure system settings', category: 'SYSTEM_SETTINGS' },
  { name: 'backup_restore', description: 'Manage system backups', category: 'SYSTEM_SETTINGS' },
  { name: 'audit_logs', description: 'Access system audit logs', category: 'SYSTEM_SETTINGS' },
];

export async function seedPermissions() {
  try {
    console.log('Seeding permissions...');
    
    // Create permissions
    for (const permission of DEFAULT_PERMISSIONS) {
      await prisma.permission.upsert({
        where: { name: permission.name },
        update: {},
        create: permission,
      });
    }
    
    console.log('Permissions seeded successfully!');
  } catch (error) {
    console.error('Error seeding permissions:', error);
    throw error;
  }
}

export async function assignDefaultRolePermissions() {
  try {
    console.log('Assigning default role permissions...');
    
    // Get all permissions
    const permissions = await prisma.permission.findMany();
    const permissionMap = new Map(permissions.map(p => [p.name, p.id]));
    
    // Get all users
    const users = await prisma.user.findMany();
    
    for (const user of users) {
      // Clear existing permissions
      await prisma.userPermission.deleteMany({
        where: { userId: user.id }
      });
      
      // Assign permissions based on role
      let permissionNames: string[] = [];
      
      switch (user.role) {
        case 'SuperAdmin':
          permissionNames = permissions.map(p => p.name);
          break;
        case 'Admin':
          permissionNames = [
            'view_users', 'create_user', 'edit_user', 'delete_user', 'manage_hierarchy',
            'create_task', 'assign_task', 'edit_task', 'delete_task', 'view_all_tasks',
            'approve_leave', 'reject_leave', 'view_leave_requests', 'manage_leave_policies',
            'view_reports', 'export_data', 'view_analytics'
          ];
          break;
        case 'Manager':
          permissionNames = [
            'view_users', 'create_task', 'assign_task', 'edit_task', 'view_all_tasks',
            'approve_leave', 'reject_leave', 'view_leave_requests', 'view_reports', 'export_data'
          ];
          break;
        case 'TechLead':
          permissionNames = [
            'view_users', 'create_task', 'assign_task', 'edit_task', 'view_all_tasks',
            'approve_leave', 'reject_leave', 'view_leave_requests', 'view_reports'
          ];
          break;
        case 'Employee':
          permissionNames = [
            'view_users', 'create_task', 'edit_task', 'view_reports'
          ];
          break;
      }
      
      // Create user permissions
      for (const permissionName of permissionNames) {
        const permissionId = permissionMap.get(permissionName);
        if (permissionId) {
          await prisma.userPermission.create({
            data: {
              userId: user.id,
              permissionId: permissionId,
            },
          });
        }
      }
    }
    
    console.log('Default role permissions assigned successfully!');
  } catch (error) {
    console.error('Error assigning default role permissions:', error);
    throw error;
  }
}
