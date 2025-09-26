// src/app/manager/assigned-task/page.tsx
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export default async function AssignedTasksPage() {
  const user = await getCurrentUser();

  if (!user) return <div className="text-center mt-10 text-red-500 font-medium">Unauthorized</div>;

  const tasks = await prisma.task.findMany({
    where: { createdById: user.id },
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true, position: true, department: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Tasks Assigned by Me</h1>

      {tasks.length === 0 ? (
        <p className="text-gray-600 text-lg">You haven't assigned any tasks yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map(task => (
            <div key={task.id} className="bg-white shadow-md rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold text-gray-800">{task.title}</h2>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                  task.status === 'todo' ? 'bg-gray-200 text-gray-800' :
                  task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  task.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.status.replace('-', ' ')}
                </span>
              </div>
              
              <p className="text-gray-600 mt-2">{task.description}</p>

              <div className="mt-4 flex flex-col gap-2 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Assigned To:</span>{' '}
                  {task.assignedTo ? task.assignedTo.name : 'Unassigned'}
                </p>
                <p>
                  <span className="font-medium">Due Date:</span>{' '}
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                </p>
                <p>
                  <span className="font-medium">Priority:</span>{' '}
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    task.priority === 'low' ? 'bg-green-100 text-green-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {task.priority}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
