'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TeamMember {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  position: string | null;
}

interface AssignTaskFormProps {
  teamMembers: TeamMember[];
}

export default function AssignTaskForm({ teamMembers }: AssignTaskFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    assignedToId: '',
    title: '',
    description: '',
    status: 'pending',
    dueDate: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        router.push('/manager');
        router.refresh();
      } else {
        alert('Error assigning task');
      }
    } catch (error) {
      console.error('Error assigning task:', error);
      alert('Error assigning task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      {/* Employee Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assign to Team Member *
        </label>
        <select
          name="assignedToId"
          required
          value={formData.assignedToId}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select a team member</option>
          {teamMembers.map(member => (
            <option key={member.id} value={member.id}>
              {member.name} - {member.position} ({member.role})
            </option>
          ))}
        </select>
      </div>

      {/* Task Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Task Title *
        </label>
        <input
          type="text"
          name="title"
          required
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter task title"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Task Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          name="description"
          required
          value={formData.description}
          onChange={handleChange}
          rows={5}
          placeholder="Describe the task in detail..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Status and Due Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Due Date
          </label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
        >
          {isSubmitting ? 'Assigning Task...' : 'Assign Task'}
        </button>
      </div>
    </form>
  );
}