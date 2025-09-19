// src/components/HierarchyNode.tsx
'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { HierarchyUser } from '@/types/hierarchy';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    User,
    Mail,
    Crown,
    Users,
    UserCheck,
    MoreVertical,
    Edit,
    Trash2
} from 'lucide-react';

interface HierarchyNodeData {
    user: HierarchyUser;
    isSelected?: boolean;
    isDragging?: boolean;
    onEdit?: (user: HierarchyUser) => void;
    onDelete?: (userId: string) => void;
    onSelect?: (user: HierarchyUser) => void;
}

const HierarchyNode = memo(({ data, selected }: NodeProps<HierarchyNodeData>) => {
    const { user, onEdit, onDelete, onSelect } = data;

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'SuperAdmin':
                return <Crown className="w-4 h-4 text-red-600" />;
            case 'Admin':
                return <Crown className="w-4 h-4 text-purple-600" />;
            case 'Manager':
                return <Users className="w-4 h-4 text-blue-600" />;
            case 'TechLead':
                return <User className="w-4 h-4 text-orange-600" />;
            default:
                return <UserCheck className="w-4 h-4 text-green-600" />;
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'SuperAdmin':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'Admin':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Manager':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'TechLead':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            default:
                return 'bg-green-100 text-green-800 border-green-200';
        }
    };

    return (
        <div
            className={`
        bg-white rounded-lg shadow-lg border-2 min-w-[250px] max-w-[300px]
        ${selected ? 'border-blue-500 shadow-xl' : 'border-gray-200 hover:border-gray-300'}
        transition-all duration-200 cursor-pointer
      `}
            onClick={() => onSelect?.(user)}
        >
            {/* Top Handle */}
            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 bg-gray-400 border-2 border-white"
            />

            {/* Node Content */}
            <div className="p-4">
                {/* Header with Avatar and Actions */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 text-sm">{user.name}</h3>
                            <p className="text-xs text-gray-500">{user.position || 'Position'}</p>
                        </div>
                    </div>

                    <div className="flex space-x-1">
                        {onEdit && (
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(user);
                                }}
                            >
                                <Edit className="w-3 h-3" />
                            </Button>
                        )}
                        {onDelete && (
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(user.id);
                                }}
                            >
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Role Badge */}
                <div className="flex items-center space-x-2 mb-3">
                    {getRoleIcon(user.role)}
                    <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                        {user.role}
                    </Badge>
                </div>

                {/* Contact Info */}
                <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{user.email}</span>
                    </div>

                    {user.department && (
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                            <User className="w-3 h-3" />
                            <span>{user.department}</span>
                        </div>
                    )}
                </div>

                {/* Manager Info */}
                {user.managerName && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                            Reports to: <span className="font-medium text-gray-700">{user.managerName}</span>
                        </p>
                    </div>
                )}
            </div>

            {/* Bottom Handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 bg-gray-400 border-2 border-white"
            />
        </div>
    );
});

HierarchyNode.displayName = 'HierarchyNode';

export default HierarchyNode;
