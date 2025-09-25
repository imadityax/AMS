'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HierarchyFlow from '@/components/HierarchyFlow';
import PermissionManager from '@/components/PermissionManager';
import UserManagement from '@/components/admin/UserManagement';
import { HierarchyUser } from '@/types/hierarchy';
import { filterUsersByRole, canViewUser, UserRole } from '@/lib/accessControl';
import { useAdminState } from '@/hooks/useAdminState';
import {
  Users,
  Network,
  Shield,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const currentUser = session?.user ? {
    id: session.user.id,
    role: (session.user.role as UserRole) || 'Employee'
  } : null;

  const {
    users,
    managers,
    loading,
    selectedUser,
    activeTab,
    message,
    setActiveTab,
    setMessage,
    handleUserSelect,
    handleUserDelete,
    handleHierarchyChange,
    handlePermissionUpdate,
    handleUserSubmit,
  } = useAdminState();

  // Show loading while session is loading
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!session || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please sign in to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (currentUser.role !== 'SuperAdmin' && currentUser.role !== 'Admin') {
    router.push('/dashboard');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You do not have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  // Convert users to hierarchy format and apply access control
  const allHierarchyUsers: HierarchyUser[] = users.map(user => ({
    id: user.id,
    name: user.name || user.email || 'Unknown User',
    email: user.email,
    role: user.role,
    managerId: user.managerId,
    managerName: user.managerName,
    position: user.position,
    department: user.department,
  }));

  // Apply role-based access control
  const hierarchyUsers = filterUsersByRole(allHierarchyUsers, currentUser.role, currentUser.id);

  // Handle user selection from hierarchy
  const handleUserSelectWithAuth = (user: HierarchyUser) => {
    // Check if current user can view this user
    if (!currentUser || !canViewUser(currentUser.role, user.role, currentUser.id, user.id)) {
      setMessage({ type: 'error', text: 'You do not have permission to view this user' });
      return;
    }

    handleUserSelect(user, currentUser);
  };

  // Handle user delete with auth
  const handleUserDeleteWithAuth = (userId: string) => {
    handleUserDelete(userId, currentUser);
  };

  // Handle user submit
  const handleSubmit = async (formData: any) => {
    return await handleUserSubmit(formData);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">Manage company hierarchy and user permissions</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="hierarchy" className="flex items-center space-x-2">
              <Network className="w-4 h-4" />
              <span>Hierarchy</span>
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Permissions</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>User Management</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hierarchy" className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Organizational Hierarchy</h2>
                  <p className="text-sm text-gray-600">Visualize and manage your company structure</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('users')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>

              <HierarchyFlow
                users={hierarchyUsers}
                onUserSelect={handleUserSelectWithAuth}
                onUserEdit={() => { }} // Handled by UserManagement
                onUserDelete={handleUserDeleteWithAuth}
                onHierarchyChange={handleHierarchyChange}
                currentUser={currentUser}
              />
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            <PermissionManager
              selectedUser={selectedUser}
              onPermissionUpdate={handlePermissionUpdate}
              currentUserRole={currentUser?.role}
            />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement
              users={users}
              managers={managers}
              hierarchyUsers={hierarchyUsers}
              currentUser={currentUser}
              onUserEdit={() => { }} // Handled internally
              onUserDelete={handleUserDeleteWithAuth}
              onSubmit={handleSubmit}
              message={message}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}