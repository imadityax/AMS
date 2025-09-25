import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function ManagerEmployeesPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return <div>Unauthorized</div>;
  }

  const employees = await prisma.user.findMany({
    where: { 
      managerId: user.id 
    },
    include: {
      attendances: {
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        },
        orderBy: { checkIn: 'desc' },
        take: 1
      },
      tasks: {
        where: { 
          OR: [
            { status: 'pending' },
            { status: 'in-progress' }
          ]
        }
      },
      leaves: {
        where: { status: 'pending' }
      }
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Team</h1>
          <p className="text-gray-600 mt-2">Manage your team members and their activities</p>
        </div>
        <Link 
          href="/manager/assign-task" 
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Assign New Task
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700">Total Team Members</h3>
          <p className="text-3xl font-bold text-blue-600">{employees.length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700">Present Today</h3>
          <p className="text-3xl font-bold text-green-600">
            {employees.filter(emp => emp.attendances.length > 0 && emp.attendances[0].checkIn).length}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700">Pending Tasks</h3>
          <p className="text-3xl font-bold text-orange-600">
            {employees.reduce((acc, emp) => acc + emp.tasks.length, 0)}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700">Leave Requests</h3>
          <p className="text-3xl font-bold text-purple-600">
            {employees.reduce((acc, emp) => acc + emp.leaves.length, 0)}
          </p>
        </div>
      </div>

      {/* Employees List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Team Members ({employees.length})</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Today's Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Tasks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.map((employee) => {
                const todayAttendance = employee.attendances[0];
                const activeTasks = employee.tasks.length;
                const pendingLeaves = employee.leaves.length;

                return (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                          {employee.name?.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{employee.name}</p>
                          <p className="text-sm text-gray-500">{employee.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {employee.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        todayAttendance?.checkIn 
                          ? todayAttendance.status === 'Late' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {todayAttendance?.checkIn 
                          ? todayAttendance.status 
                          : 'Absent'
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {todayAttendance?.checkIn 
                        ? new Date(todayAttendance.checkIn).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '--:--'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                          {activeTasks} tasks
                        </span>
                        {pendingLeaves > 0 && (
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                            {pendingLeaves} leaves
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Link 
                          href={`/manager/assign-task?employee=${employee.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Assign Task
                        </Link>
                        <span className="text-gray-300">|</span>
                        <Link 
                          href={`/manager/employees/${employee.id}`}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          View Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}