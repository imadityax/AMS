import { useState, useEffect } from 'react';
import { HierarchyUser } from '@/types/hierarchy';
import { UserRole } from '@/lib/accessControl';

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

export function useAdminState() {
    const [users, setUsers] = useState<User[]>([]);
    const [managers, setManagers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<HierarchyUser | null>(null);
    const [activeTab, setActiveTab] = useState('hierarchy');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users");
            const data = await res.json();

            console.log("Fetched users:", data);

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
            setLoading(false);
        }
    };

    const handleUserSelect = (user: HierarchyUser, currentUser: { id: string; role: UserRole } | null) => {
        if (!currentUser) {
            setMessage({ type: 'error', text: 'You do not have permission to view this user' });
            return;
        }

        setSelectedUser(user);
        setActiveTab('permissions');
    };

    const handleUserDelete = async (userId: string, currentUser: { id: string; role: UserRole } | null) => {
        const targetUser = users.find(u => u.id === userId);
        if (!targetUser) {
            setMessage({ type: 'error', text: 'User not found' });
            return;
        }

        if (!currentUser) {
            setMessage({ type: 'error', text: 'You do not have permission to delete this user' });
            return;
        }

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

    const handleUserSubmit = async (formData: CreateUserRequest) => {
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
                fetchUsers();
                return true;
            } else {
                const error = await response.json();
                setMessage({ type: 'error', text: error.message || 'Failed to create user' });
                return false;
            }
        } catch (error) {
            console.error('Error creating user:', error);
            setMessage({ type: 'error', text: 'Failed to create user' });
            return false;
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return {
        users,
        managers,
        loading,
        selectedUser,
        activeTab,
        message,
        setActiveTab,
        setMessage,
        fetchUsers,
        handleUserSelect,
        handleUserDelete,
        handleHierarchyChange,
        handlePermissionUpdate,
        handleUserSubmit,
    };
}
