import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AssignTaskForm from '../assign-task/AssignTaskForm';

export default async function AssignTaskPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return <div>Unauthorized</div>;
  }

  // Alternative approach using nested relation query
  const teamMembers = await prisma.user.findMany({
    where: {
      managers: {
        some: {
          managerId: user.id
        }
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      position: true
    },
    orderBy: { 
      name: 'asc'
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">Assign New Task</h1>
        <p className="text-gray-600 mt-2">Assign tasks to your team members</p>
      </div>

      {/* Task Form */}
      <AssignTaskForm teamMembers={teamMembers} />
    </div>
  );
}