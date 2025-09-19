// src/components/HierarchyFlow.tsx
'use client';

import { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
    Node,
    Edge,
    addEdge,
    Connection,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    MiniMap,
    NodeTypes,
    EdgeTypes,
    ReactFlowProvider,
    MarkerType,
    ConnectionLineType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import HierarchyNode from './HierarchyNode';
import { HierarchyUser, HierarchyNode as HierarchyNodeType, HierarchyEdge } from '@/types/hierarchy';
import { canManageUser, UserRole } from '@/lib/accessControl';

interface HierarchyFlowProps {
    users: HierarchyUser[];
    onUserSelect?: (user: HierarchyUser) => void;
    onUserEdit?: (user: HierarchyUser) => void;
    onUserDelete?: (userId: string) => void;
    onHierarchyChange?: (userId: string, managerId?: string) => void;
    currentUser?: { id: string; role: UserRole };
}

const nodeTypes: NodeTypes = {
    hierarchyNode: HierarchyNode,
};

const edgeTypes: EdgeTypes = {};

const HierarchyFlow = ({
    users,
    onUserSelect,
    onUserEdit,
    onUserDelete,
    onHierarchyChange,
    currentUser,
}: HierarchyFlowProps) => {
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    // Convert users to nodes
    const initialNodes: Node[] = useMemo(() => {
        return users.map((user, index) => {
            // Calculate permissions for this user
            const canEdit = currentUser ? canManageUser(currentUser.role, user.role, currentUser.id, user.id) : false;
            const canDelete = currentUser ? canManageUser(currentUser.role, user.role, currentUser.id, user.id) : false;

            return {
                id: user.id,
                type: 'hierarchyNode',
                position: calculateNodePosition(user, users, index),
                data: {
                    user,
                    onEdit: onUserEdit,
                    onDelete: onUserDelete,
                    onSelect: (selectedUser: HierarchyUser) => {
                        setSelectedNodeId(selectedUser.id);
                        onUserSelect?.(selectedUser);
                    },
                    canEdit,
                    canDelete,
                },
            };
        });
    }, [users, onUserEdit, onUserDelete, onUserSelect, currentUser]);

    // Convert user relationships to edges
    const initialEdges: Edge[] = useMemo(() => {
        const edges: Edge[] = [];

        users.forEach((user) => {
            if (user.managerId) {
                edges.push({
                    id: `${user.managerId}-${user.id}`,
                    source: user.managerId,
                    target: user.id,
                    type: 'smoothstep',
                    animated: false,
                    style: { stroke: '#94a3b8', strokeWidth: 2 },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#94a3b8',
                    },
                });
            }
        });

        return edges;
    }, [users]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback(
        (params: Connection) => {
            const newEdge = {
                ...params,
                id: `${params.source}-${params.target}`,
                type: 'smoothstep',
                animated: false,
                style: { stroke: '#94a3b8', strokeWidth: 2 },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: '#94a3b8',
                },
            };

            setEdges((eds) => addEdge(newEdge, eds));

            // Update hierarchy in parent component
            if (params.source && params.target) {
                onHierarchyChange?.(params.target, params.source);
            }
        },
        [setEdges, onHierarchyChange]
    );

    const onNodeDragStop = useCallback(
        (event: any, node: Node) => {
            // Update node position
            setNodes((nds) =>
                nds.map((n) =>
                    n.id === node.id ? { ...n, position: node.position } : n
                )
            );
        },
        [setNodes]
    );

    return (
        <div className="w-full h-[600px] border border-gray-200 rounded-lg bg-gray-50">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeDragStop={onNodeDragStop}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                connectionLineType={ConnectionLineType.SmoothStep}
                defaultEdgeOptions={{
                    type: 'smoothstep',
                    animated: false,
                }}
                className="bg-gray-50"
            >
                <Controls className="bg-white border border-gray-200 rounded-lg shadow-sm" />
                <MiniMap
                    className="bg-white border border-gray-200 rounded-lg shadow-sm"
                    nodeColor={(node) => {
                        const user = node.data?.user;
                        if (!user) return '#e5e7eb';

                        switch (user.role) {
                            case 'SuperAdmin':
                                return '#dc2626';
                            case 'Admin':
                                return '#8b5cf6';
                            case 'Manager':
                                return '#3b82f6';
                            case 'TechLead':
                                return '#f97316';
                            default:
                                return '#10b981';
                        }
                    }}
                />
                <Background color="#f3f4f6" gap={20} />
            </ReactFlow>
        </div>
    );
};

// Helper function to calculate node positions for better layout
function calculateNodePosition(user: HierarchyUser, allUsers: HierarchyUser[], index: number) {
    // Simple layout algorithm - can be improved with a proper hierarchy layout
    const level = getHierarchyLevel(user, allUsers);
    const siblingsAtLevel = allUsers.filter(u => getHierarchyLevel(u, allUsers) === level);
    const siblingIndex = siblingsAtLevel.findIndex(u => u.id === user.id);

    const x = siblingIndex * 300 + 100;
    const y = level * 200 + 100;

    return { x, y };
}

function getHierarchyLevel(user: HierarchyUser, allUsers: HierarchyUser[]): number {
    if (!user.managerId) return 0;

    const manager = allUsers.find(u => u.id === user.managerId);
    if (!manager) return 1;

    return 1 + getHierarchyLevel(manager, allUsers);
}

// Wrapper component with ReactFlowProvider
const HierarchyFlowWrapper = (props: HierarchyFlowProps) => {
    return (
        <ReactFlowProvider>
            <HierarchyFlow {...props} />
        </ReactFlowProvider>
    );
};

export default HierarchyFlowWrapper;
