import AssignTaskForm from '../assign-task/AssignTaskForm';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function AssignTaskPage() {
  const user = await getCurrentUser();

  if (!user) return <div>Unauthorized</div>;

  const teamMembers = await prisma.user.findMany({
    where: {
      managers: { some: { managerId: user.id } }
    },
    select: { id: true, name: true, email: true, role: true, position: true },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Assign New Task</h1>
      <AssignTaskForm teamMembers={teamMembers} />
    </div>
  );
}
