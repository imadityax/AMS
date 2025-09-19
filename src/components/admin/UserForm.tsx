'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';

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

interface UserFormProps {
    editingUser: User | null;
    formData: CreateUserRequest;
    managers: User[];
    showManagerField: boolean;
    onFormDataChange: (data: CreateUserRequest) => void;
    onShowManagerFieldChange: (show: boolean) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
}

export default function UserForm({
    editingUser,
    formData,
    managers,
    showManagerField,
    onFormDataChange,
    onShowManagerFieldChange,
    onSubmit,
    onCancel,
}: UserFormProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        const newData = { ...formData, [name]: value };

        // Show manager field only for Employees, TechLeads, Managers, and Admins
        if (name === 'role') {
            onShowManagerFieldChange(value === 'Employee' || value === 'TechLead' || value === 'Manager' || value === 'Admin');

            // Clear managerId if role is changed to SuperAdmin
            if (value === 'SuperAdmin') {
                newData.managerId = '';
            }
        }

        onFormDataChange(newData);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                    {editingUser ? 'Edit User' : 'Add New User'}
                </h2>
                {editingUser && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onCancel}
                    >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                    </Button>
                )}
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
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
    );
}
