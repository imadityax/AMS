// src/app/tasks/page.tsx
'use client';

import { useState } from 'react';

interface Task {
  id: string;
  title: string;
  description: string;
  assigner: {
    id: string;
    name: string;
    avatar: string;
    department: string;
  };
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  createdAt: string;
}

// Mock data for demonstration
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Update quarterly financial report',
    description: 'Review and update the Q2 financial report with the latest revenue numbers and projections.',
    assigner: {
      id: '101',
      name: 'Sarah Johnson',
      avatar: 'SJ',
      department: 'Finance'
    },
    dueDate: '2023-07-15',
    priority: 'high',
    status: 'todo',
    createdAt: '2023-07-05'
  },
  {
    id: '2',
    title: 'Design new landing page',
    description: 'Create wireframes and mockups for the new product landing page based on the requirements document.',
    assigner: {
      id: '102',
      name: 'Michael Chen',
      avatar: 'MC',
      department: 'Design'
    },
    dueDate: '2023-07-20',
    priority: 'medium',
    status: 'in-progress',
    createdAt: '2023-07-01'
  },
  {
    id: '3',
    title: 'Fix authentication bug',
    description: 'Investigate and fix the bug causing intermittent authentication failures on mobile devices.',
    assigner: {
      id: '103',
      name: 'David Wilson',
      avatar: 'DW',
      department: 'Engineering'
    },
    dueDate: '2023-07-10',
    priority: 'urgent',
    status: 'review',
    createdAt: '2023-07-03'
  },
  {
    id: '4',
    title: 'Prepare client presentation',
    description: 'Prepare slides and talking points for the upcoming client meeting on July 25th.',
    assigner: {
      id: '104',
      name: 'Emily Rodriguez',
      avatar: 'ER',
      department: 'Sales'
    },
    dueDate: '2023-07-18',
    priority: 'high',
    status: 'completed',
    createdAt: '2023-06-28'
  },
  {
    id: '5',
    title: 'Onboard new team members',
    description: 'Schedule and conduct onboarding sessions for the three new team members joining next week.',
    assigner: {
      id: '105',
      name: 'James Thompson',
      avatar: 'JT',
      department: 'HR'
    },
    dueDate: '2023-07-12',
    priority: 'medium',
    status: 'todo',
    createdAt: '2023-07-02'
  }
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'review' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'created'>('dueDate');
  const [updateModal, setUpdateModal] = useState<{isOpen: boolean; task: Task | null}>({isOpen: false, task: null});
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const filteredTasks = tasks.filter(task => 
    filter === 'all' ? true : task.status === filter
  );

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'dueDate') {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    } else if (sortBy === 'priority') {
      const priorityOrder = { 'urgent': 0, 'high': 1, 'medium': 2, 'low': 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    } else {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).setHours(0, 0, 0, 0) !== new Date().setHours(0, 0, 0, 0);
  };

  const handleUpdateClick = (task: Task) => {
    setUpdateModal({isOpen: true, task});
    setSelectedStatus(task.status);
  };

  const handleStatusUpdate = () => {
    if (updateModal.task && selectedStatus) {
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === updateModal.task?.id 
            ? {...task, status: selectedStatus as Task['status']} 
            : task
        )
      );
      setUpdateModal({isOpen: false, task: null});
    }
  };

  const getNextStatusOptions = (currentStatus: string) => {
    switch (currentStatus) {
      case 'todo':
        return ['in-progress', 'completed'];
      case 'in-progress':
        return ['review', 'completed'];
      case 'review':
        return ['in-progress', 'completed'];
      case 'completed':
        return ['todo', 'in-progress'];
      default:
        return ['todo', 'in-progress', 'review', 'completed'];
    }
  };

  const getStatusLabel = (status: string) => {
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* Update Status Modal */}
      {updateModal.isOpen && updateModal.task && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Update Task Status</h3>
            <p className="text-gray-600 mb-2">Update status for:</p>
            <p className="font-medium text-gray-900 mb-6">{updateModal.task.title}</p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select New Status
              </label>
              <div className="grid grid-cols-2 gap-3">
                {getNextStatusOptions(updateModal.task.status).map((status) => (
                  <div key={status} className="flex items-center">
                    <input
                      id={`status-${status}`}
                      name="status"
                      type="radio"
                      value={status}
                      checked={selectedStatus === status}
                      onChange={() => setSelectedStatus(status)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor={`status-${status}`} className="ml-2 block text-sm text-gray-700">
                      {getStatusLabel(status)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setUpdateModal({isOpen: false, task: null})}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={!selectedStatus}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-600 mt-2">View and manage all tasks assigned to you</p>
        </div>

        {/* Filters and Sorting */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">Filters</h2>
              <div className="flex flex-wrap gap-2">
                {(['all', 'todo', 'in-progress', 'review', 'completed'] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => setFilter(option)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${filter === option 
                      ? 'bg-indigo-100 text-indigo-800' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {option === 'all' ? 'All Tasks' : option.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                Sort by
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'dueDate' | 'priority' | 'created')}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="created">Date Created</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tasks Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-gray-100 p-3 mr-4">
                <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{tasks.filter(t => t.status === 'in-progress').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-purple-100 p-3 mr-4">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{tasks.filter(t => t.status === 'completed').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-red-100 p-3 mr-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-gray-900">{tasks.filter(t => t.priority === 'urgent').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {sortedTasks.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No tasks found</h3>
              <p className="mt-1 text-gray-500">You don't have any tasks matching your current filters.</p>
            </div>
          ) : (
            sortedTasks.map((task) => (
              <div key={task.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                      </div>
                      
                      <p className="mt-2 text-gray-600">{task.description}</p>
                      
                      <div className="mt-4 flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-medium">
                            {task.assigner.avatar}
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Assigned by {task.assigner.name}</p>
                          <p className="text-sm text-gray-500">{task.assigner.department} Department</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                        {task.status.split('-').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </span>
                      
                      <div className="text-right">
                        <p className={`text-sm font-medium ${isOverdue(task.dueDate) ? 'text-red-600' : 'text-gray-600'}`}>
                          Due: {formatDate(task.dueDate)}
                        </p>
                        {isOverdue(task.dueDate) && (
                          <p className="text-xs text-red-500">Overdue</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-3 flex justify-end">
                  <button
                    onClick={() => handleUpdateClick(task)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    Update Status
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}