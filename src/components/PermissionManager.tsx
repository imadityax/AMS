// src/components/PermissionManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { HierarchyUser } from '@/types/hierarchy';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Shield,
    Users,
    CheckCircle,
    XCircle,
    Settings,
    FileText,
    Calendar,
    BarChart3,
    UserCog
} from 'lucide-react';

interface Permission {
    id: string;
    name: string;
    description: string;
    category: 'USER_MANAGEMENT' | 'TASK_MANAGEMENT' | 'LEAVE_MANAGEMENT' | 'REPORTING' | 'SYSTEM_SETTINGS';
    isActive: boolean;
}

interface PermissionManagerProps {
    selectedUser: HierarchyUser | null;
    onPermissionUpdate: (userId: string, permissions: string[]) => void;
    currentUserRole?: 'SuperAdmin' | 'Admin' | 'Manager' | 'TechLead' | 'Employee';
}

const PermissionManager = ({ selectedUser, onPermissionUpdate, currentUserRole = 'SuperAdmin' }: PermissionManagerProps) => {
    const [userPermissions, setUserPermissions] = useState<string[]>([]);
    const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingPermissions, setLoadingPermissions] = useState(true);

    // Fetch available permissions on component mount
    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const response = await fetch('/api/permissions');
                if (response.ok) {
                    const permissions = await response.json();
                    setAvailablePermissions(permissions);
                } else {
                    console.error('Failed to fetch permissions');
                }
            } catch (error) {
                console.error('Error fetching permissions:', error);
            } finally {
                setLoadingPermissions(false);
            }
        };

        fetchPermissions();
    }, []);

    // Fetch user permissions when selectedUser changes
    useEffect(() => {
        const fetchUserPermissions = async () => {
            if (selectedUser) {
                try {
                    const response = await fetch(`/api/users/${selectedUser.id}/permissions`);
                    if (response.ok) {
                        const permissions = await response.json();
                        setUserPermissions(permissions.map((p: Permission) => p.name));
                    } else {
                        console.error('Failed to fetch user permissions');
                        setUserPermissions([]);
                    }
                } catch (error) {
                    console.error('Error fetching user permissions:', error);
                    setUserPermissions([]);
                }
            } else {
                setUserPermissions([]);
            }
        };

        fetchUserPermissions();
    }, [selectedUser]);

    const handlePermissionToggle = (permissionId: string) => {
        setUserPermissions(prev => {
            if (prev.includes(permissionId)) {
                return prev.filter(id => id !== permissionId);
            } else {
                return [...prev, permissionId];
            }
        });
    };

    const handleSavePermissions = async () => {
        if (!selectedUser) return;

        setIsLoading(true);
        try {
            await onPermissionUpdate(selectedUser.id, userPermissions);
            // You could add a success message here
        } catch (error) {
            console.error('Failed to update permissions:', error);
            // You could add an error message here
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetToDefault = async () => {
        if (!selectedUser) return;

        setIsLoading(true);
        try {
            // Call the seed endpoint to reset permissions to default
            const response = await fetch('/api/permissions/seed', {
                method: 'POST',
            });

            if (response.ok) {
                // Refresh user permissions
                const userResponse = await fetch(`/api/users/${selectedUser.id}/permissions`);
                if (userResponse.ok) {
                    const permissions = await userResponse.json();
                    setUserPermissions(permissions.map((p: Permission) => p.name));
                }
            } else {
                console.error('Failed to reset permissions');
            }
        } catch (error) {
            console.error('Error resetting permissions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'USER_MANAGEMENT':
                return <Users className="w-4 h-4" />;
            case 'TASK_MANAGEMENT':
                return <FileText className="w-4 h-4" />;
            case 'LEAVE_MANAGEMENT':
                return <Calendar className="w-4 h-4" />;
            case 'REPORTING':
                return <BarChart3 className="w-4 h-4" />;
            case 'SYSTEM_SETTINGS':
                return <Settings className="w-4 h-4" />;
            default:
                return <Shield className="w-4 h-4" />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'USER_MANAGEMENT':
                return 'bg-blue-50 border-blue-200 text-blue-800';
            case 'TASK_MANAGEMENT':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'LEAVE_MANAGEMENT':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'REPORTING':
                return 'bg-purple-50 border-purple-200 text-purple-800';
            case 'SYSTEM_SETTINGS':
                return 'bg-red-50 border-red-200 text-red-800';
            default:
                return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };

    if (!selectedUser) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center text-gray-500">
                    <UserCog className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">Select a User</h3>
                    <p className="text-sm">Click on a user in the hierarchy to manage their permissions</p>
                </div>
            </div>
        );
    }

    const groupedPermissions = availablePermissions.reduce((acc, permission) => {
        if (!acc[permission.category]) {
            acc[permission.category] = [];
        }
        acc[permission.category].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Permission Management</h3>
                    <p className="text-sm text-gray-600">
                        Managing permissions for <span className="font-medium">{selectedUser.name}</span>
                    </p>
                </div>
                <Badge className={`${selectedUser.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                    selectedUser.role === 'Manager' ? 'bg-blue-100 text-blue-800' :
                        selectedUser.role === 'TechLead' ? 'bg-orange-100 text-orange-800' :
                            'bg-green-100 text-green-800'}`}>
                    {selectedUser.role}
                </Badge>
            </div>

            {loadingPermissions ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="space-y-6">
                    {currentUserRole !== 'SuperAdmin' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <Shield className="w-5 h-5 text-yellow-600 mr-2" />
                                <p className="text-sm text-yellow-800">
                                    Only SuperAdmin can modify permissions. You can view current permissions but cannot make changes.
                                </p>
                            </div>
                        </div>
                    )}
                    {Object.entries(groupedPermissions).map(([category, permissions]) => (
                        <div key={category} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-4">
                                <div className={`p-2 rounded-lg ${getCategoryColor(category)}`}>
                                    {getCategoryIcon(category)}
                                </div>
                                <h4 className="font-medium text-gray-900 capitalize">
                                    {category.replace('_', ' ')}
                                </h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {permissions.map((permission) => {
                                    const isGranted = userPermissions.includes(permission.name);
                                    const canEdit = currentUserRole === 'SuperAdmin';

                                    return (
                                        <div
                                            key={permission.id}
                                            className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${canEdit ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                                                } ${isGranted
                                                    ? 'bg-green-50 border-green-200 hover:bg-green-100'
                                                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                                }`}
                                            onClick={() => canEdit && handlePermissionToggle(permission.name)}
                                        >
                                            <div className="flex-shrink-0">
                                                {isGranted ? (
                                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {permission.name.replace('_', ' ')}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {permission.description}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {currentUserRole === 'SuperAdmin' && (
                <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                    <Button
                        variant="outline"
                        onClick={handleResetToDefault}
                        disabled={isLoading}
                    >
                        Reset to Default
                    </Button>

                    <div className="flex space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => setUserPermissions([])}
                            disabled={isLoading}
                        >
                            Clear All
                        </Button>
                        <Button
                            onClick={handleSavePermissions}
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isLoading ? 'Saving...' : 'Save Permissions'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PermissionManager;
