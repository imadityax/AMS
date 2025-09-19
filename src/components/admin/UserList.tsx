'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { HierarchyUser } from '@/types/hierarchy';
import { canManageUser, UserRole } from '@/lib/accessControl';

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

interface UserListProps {
    users: User[];
    hierarchyUsers: HierarchyUser[];
    currentUser: { id: string; role: UserRole } | null;
    onUserEdit: (user: HierarchyUser) => void;
    onUserDelete: (userId: string) => void;
}

export default function UserList({
    users,
    hierarchyUsers,
    currentUser,
    onUserEdit,
    onUserDelete,
}: UserListProps) {
    return (
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
                                        {currentUser && canManageUser(currentUser.role, user.role, currentUser.id, user.id) && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const hierarchyUser = hierarchyUsers.find(u => u.id === user.id);
                                                        if (hierarchyUser) {
                                                            onUserEdit(hierarchyUser);
                                                        }
                                                    }}
                                                >
                                                    <Edit className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onUserDelete(user.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </>
                                        )}
                                        {currentUser && !canManageUser(currentUser.role, user.role, currentUser.id, user.id) && (
                                            <span className="text-xs text-gray-400">No permissions</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
