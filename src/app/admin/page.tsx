// src/app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HierarchyFlow from '@/components/HierarchyFlow';
import PermissionManager from '@/components/PermissionManager';
import { HierarchyUser, PermissionUpdate, HierarchyUpdate } from '@/types/hierarchy';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { filterUsersByRole, canViewUser, canManageUser, UserRole } from '@/lib/accessControl';
import {
  Users,
  Network,
  Shield,
  Plus,
  Edit,
  Trash2,
  Save,
  X
} from 'lucide-react';

// Define TypeScript interfaces
interface User {
  id: string;
  name: string;
  email: string;
  role: 'SuperAdmin' | 'Admin' | 'Manager' | 'TechLead' | 'Employee';
  managerId?: string;
  managerName?: string;
  position?: string;
  department?: string;
}

interface CreateUserRequest {
  email: string;
  role: 'SuperAdmin' | 'Admin' | 'Manager' | 'TechLead' | 'Employee';
  managerId?: string;
  position?: string;
  department?: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<HierarchyUser | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('hierarchy');

  // Get current user from session
  const { data: session, status } = useSession();
  const currentUser = session?.user ? {
    id: session.user.id,
    role: (session.user.role as UserRole) || 'Employee'
  } : null;
  const [formData, setFormData] = useState<CreateUserRequest>({
    email: '',
    role: 'Employee',
    managerId: '',
    position: '',
    department: ''
  });
  const [showManagerField, setShowManagerField] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();

      console.log("Fetched users:", data);

      // ✅ Ensure it's always an array
      if (Array.isArray(data)) {
        setUsers(data);

        // Extract managers (SuperAdmin, Admin, Manager, TechLead can be managers)
        const managerList = data.filter(
          (user: User) => user.role === "SuperAdmin" || user.role === "Admin" || user.role === "Manager" || user.role === "TechLead"
        );
        setManagers(managerList);
      } else {
        console.error("API did not return an array:", data);
        setUsers([]);
        setManagers([]);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
      setManagers([]);
    } finally {
      setLoading(false); // ✅ stop spinner
    }
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const newData = { ...prev, [name]: value };

      // Show manager field only for Employees, TechLeads, Managers, and Admins
      if (name === 'role') {
        setShowManagerField(value === 'Employee' || value === 'TechLead' || value === 'Manager' || value === 'Admin');

        // Clear managerId if role is changed to SuperAdmin
        if (value === 'SuperAdmin') {
          newData.managerId = '';
        }
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'User created successfully!' });
        setFormData({
          email: '',
          role: 'Employee',
          managerId: '',
          position: '',
          department: ''
        });
        setShowManagerField(false);
        fetchUsers(); // Refresh the user list
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Failed to create user' });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setMessage({ type: 'error', text: 'Failed to create user' });
    }
  };

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

  // Apply role-based access control
  const hierarchyUsers = filterUsersByRole(allHierarchyUsers, currentUser.role, currentUser.id);

  // Handle user selection from hierarchy
  const handleUserSelect = (user: HierarchyUser) => {
    setSelectedUser(user);
    setActiveTab('permissions');
  };

  // Handle user edit
  const handleUserEdit = (user: HierarchyUser) => {
    const fullUser = users.find(u => u.id === user.id);
    if (fullUser) {
      setEditingUser(fullUser);
      setFormData({
        email: fullUser.email,
        role: fullUser.role,
        managerId: fullUser.managerId || '',
        position: fullUser.position || '',
        department: fullUser.department || ''
      });
      setShowManagerField(fullUser.role === 'Employee' || fullUser.role === 'TechLead' || fullUser.role === 'Manager' || fullUser.role === 'Admin');
      setActiveTab('users');
    }
  };

  // Handle user delete
  const handleUserDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'User deleted successfully!' });
        fetchUsers();
        if (selectedUser?.id === userId) {
          setSelectedUser(null);
        }
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Failed to delete user' });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setMessage({ type: 'error', text: 'Failed to delete user' });
    }
  };

  // Handle hierarchy changes
  const handleHierarchyChange = async (userId: string, managerId?: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ managerId }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Hierarchy updated successfully!' });
        fetchUsers();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Failed to update hierarchy' });
      }
    } catch (error) {
      console.error('Error updating hierarchy:', error);
      setMessage({ type: 'error', text: 'Failed to update hierarchy' });
    }
  };

  // Handle permission updates
  const handlePermissionUpdate = async (userId: string, permissions: string[]) => {
    try {
      const response = await fetch(`/api/users/${userId}/permissions`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permissions }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Permissions updated successfully!' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Failed to update permissions' });
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
      setMessage({ type: 'error', text: 'Failed to update permissions' });
    }
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

        {message && (
          <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

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
                onUserSelect={handleUserSelect}
                onUserEdit={handleUserEdit}
                onUserDelete={handleUserDelete}
                onHierarchyChange={handleHierarchyChange}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Add/Edit User Form */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">
                    {editingUser ? 'Edit User' : 'Add New User'}
                  </h2>
                  {editingUser && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingUser(null);
                        setFormData({
                          email: '',
                          role: 'Employee',
                          managerId: '',
                          position: '',
                          department: ''
                        });
                        setShowManagerField(false);
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Must match the Google account email they will use to sign in
                    </p>
                  </div>

                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                      Position
                    </label>
                    <input
                      type="text"
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                      Department
                    </label>
                    <input
                      type="text"
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Employee">Employee</option>
                      <option value="TechLead">Tech Lead</option>
                      <option value="Manager">Manager</option>
                      <option value="Admin">Admin</option>
                      <option value="SuperAdmin">Super Admin</option>
                    </select>
                  </div>

                  {showManagerField && (
                    <div>
                      <label htmlFor="managerId" className="block text-sm font-medium text-gray-700">
                        Manager
                      </label>
                      <select
                        id="managerId"
                        name="managerId"
                        value={formData.managerId}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a manager</option>
                        {managers.map(manager => (
                          <option key={manager.id} value={manager.id}>
                            {manager.name} ({manager.role})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingUser ? 'Update User' : 'Add User'}
                  </Button>
                </form>
              </div>

              {/* User List */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">User List</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Manager
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name || user.email || 'Unknown User'}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={`${user.role === 'SuperAdmin' ? 'bg-red-100 text-red-800' :
                              user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                                user.role === 'Manager' ? 'bg-blue-100 text-blue-800' :
                                  user.role === 'TechLead' ? 'bg-orange-100 text-orange-800' :
                                    'bg-green-100 text-green-800'
                              }`}>
                              {user.role}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.managerName || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const hierarchyUser = hierarchyUsers.find(u => u.id === user.id);
                                  if (hierarchyUser) {
                                    handleUserEdit(hierarchyUser);
                                  }
                                }}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUserDelete(user.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}