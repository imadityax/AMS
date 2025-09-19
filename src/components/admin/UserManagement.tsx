'use client';

import { useState } from 'react';
import { HierarchyUser } from '@/types/hierarchy';
import { UserRole } from '@/lib/accessControl';
import UserForm from './UserForm';
import UserList from './UserList';

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

interface UserManagementProps {
    users: User[];
    managers: User[];
    hierarchyUsers: HierarchyUser[];
    currentUser: { id: string; role: UserRole } | null;
    onUserEdit: (user: HierarchyUser) => void;
    onUserDelete: (userId: string) => void;
    onSubmit: (formData: CreateUserRequest) => Promise<boolean>;
    message: { type: 'success' | 'error', text: string } | null;
}

export default function UserManagement({
    users,
    managers,
    hierarchyUsers,
    currentUser,
    onUserEdit,
    onUserDelete,
    onSubmit,
    message,
}: UserManagementProps) {
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<CreateUserRequest>({
        email: '',
        role: 'Employee',
        managerId: '',
        position: '',
        department: ''
    });
    const [showManagerField, setShowManagerField] = useState(false);

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
        }
        onUserEdit(user);
    };

    const handleCancel = () => {
        setEditingUser(null);
        setFormData({
            email: '',
            role: 'Employee',
            managerId: '',
            position: '',
            department: ''
        });
        setShowManagerField(false);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await onSubmit(formData);
        if (success && !editingUser) {
            // Reset form only if adding new user and successful
            setFormData({
                email: '',
                role: 'Employee',
                managerId: '',
                position: '',
                department: ''
            });
            setShowManagerField(false);
        }
    };

    return (
        <div className="space-y-6">
            {message && (
                <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <UserForm
                    editingUser={editingUser}
                    formData={formData}
                    managers={managers}
                    showManagerField={showManagerField}
                    onFormDataChange={setFormData}
                    onShowManagerFieldChange={setShowManagerField}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCancel}
                />

                <UserList
                    users={users}
                    hierarchyUsers={hierarchyUsers}
                    currentUser={currentUser}
                    onUserEdit={handleUserEdit}
                    onUserDelete={onUserDelete}
                />
            </div>
        </div>
    );
}
