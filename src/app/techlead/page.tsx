import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function ManagerDashboard() {
  const user = await getCurrentUser();

  // Get employees through the UserManager junction table
  const managerRelations = await prisma.userManager.findMany({
    where: {
      managerId: user?.id
    },
    include: {
      user: {
        include: {
          attendances: {
            where: {
              date: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)), // Today's start
                lt: new Date(new Date().setHours(23, 59, 59, 999)) // Today's end
              }
            },
            orderBy: {
              checkIn: 'desc'
            },
            take: 1
          },
          tasks: {
            where: {
              status: 'PENDING'
            }
          }
        }
      }
    }
  });

  // Extract the users from the relations
  const employees = managerRelations.map(relation => relation.user);

  const totalEmployees = employees.length;
  const presentToday = employees.filter(emp =>
    emp.attendances.length > 0 && emp.attendances[0].checkIn
  ).length;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700">Total Employees</h3>
          <p className="text-3xl font-bold text-blue-600">{totalEmployees}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700">Present Today</h3>
          <p className="text-3xl font-bold text-green-600">{presentToday}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700">Pending Tasks</h3>
          <p className="text-3xl font-bold text-orange-600">
            {employees.reduce((acc, emp) => acc + emp.tasks.length, 0)}
          </p>
        </div>
      </div>

      {/* Employees List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">My Employees</h2>
            <Link
              href="/manager/employees"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              View All
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Punch In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours Worked</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending Tasks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.map((employee) => {
                const todayAttendance = employee.attendances[0];
                const hoursWorked = todayAttendance?.checkOut
                  ? Math.round((new Date(todayAttendance.checkOut).getTime() -
                    new Date(todayAttendance.checkIn).getTime()) / (1000 * 60 * 60) * 10) / 10
                  : todayAttendance?.checkIn
                    ? Math.round((new Date().getTime() -
                      new Date(todayAttendance.checkIn).getTime()) / (1000 * 60 * 60) * 10) / 10
                    : 0;
                return (
                  <tr key={employee.id}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{employee.name}</p>
                        <p className="text-sm text-gray-500">{employee.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${todayAttendance?.checkIn
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {todayAttendance?.checkIn ? 'Present' : 'Absent'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {todayAttendance?.checkIn
                        ? new Date(todayAttendance.checkIn).toLocaleTimeString()
                        : '--'
                      }
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {hoursWorked > 0 ? `${hoursWorked}h` : '--'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                        {employee.tasks.length} tasks
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex space-x-4">
          <Link
            href="/manager/assign-task"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Assign New Task
          </Link>
          <Link
            href="/manager/attendance"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            View Attendance Report
          </Link>
        </div>
      </div>
    </div>
  );
}