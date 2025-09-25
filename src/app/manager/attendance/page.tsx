import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function ManagerAttendancePage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return <div>Unauthorized</div>;
  }

  // Get attendance data for the last 7 days for manager's team
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const teamAttendance = await prisma.user.findMany({
    where: { 
      managerId: user.id 
    },
    include: {
      attendances: {
        where: {
          date: {
            gte: sevenDaysAgo
          }
        },
        orderBy: { date: 'desc' }
      }
    },
    orderBy: { name: 'asc' }
  });

  // Generate dates for the last 7 days
  const dateRange = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const getAttendanceForDate = (attendances: any[], date: string) => {
    return attendances.find(att => att.date.toISOString().split('T')[0] === date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-800';
      case 'Late': return 'bg-yellow-100 text-yellow-800';
      case 'HalfDay': return 'bg-blue-100 text-blue-800';
      case 'SickLeave': return 'bg-purple-100 text-purple-800';
      case 'Absent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Team Attendance</h1>
        <p className="text-gray-600 mt-2">View your team's attendance for the past 7 days</p>
      </div>

      {/* Attendance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700">Present Today</h3>
          <p className="text-3xl font-bold text-green-600">
            {teamAttendance.filter(member => 
              member.attendances.some((att: any) => 
                att.date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0] && 
                ['Present', 'Late', 'HalfDay'].includes(att.status)
              )
            ).length}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700">Late Today</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {teamAttendance.filter(member => 
              member.attendances.some((att: any) => 
                att.date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0] && 
                att.status === 'Late'
              )
            ).length}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700">Absent Today</h3>
          <p className="text-3xl font-bold text-red-600">
            {teamAttendance.filter(member => 
              !member.attendances.some((att: any) => 
                att.date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
              )
            ).length}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700">On Leave</h3>
          <p className="text-3xl font-bold text-purple-600">
            {teamAttendance.filter(member => 
              member.attendances.some((att: any) => 
                att.date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0] && 
                att.status === 'SickLeave'
              )
            ).length}
          </p>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">7-Day Attendance Report</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Member</th>
                {dateRange.map(date => (
                  <th key={date} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {teamAttendance.map(member => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                        {member.name?.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.role}</p>
                      </div>
                    </div>
                  </td>
                  {dateRange.map(date => {
                    const attendance = getAttendanceForDate(member.attendances, date);
                    return (
                      <td key={date} className="px-3 py-4 text-center">
                        {attendance ? (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(attendance.status)}`}>
                            {attendance.status === 'Present' ? '✓' : 
                             attendance.status === 'Late' ? '⌚' :
                             attendance.status === 'HalfDay' ? '½' :
                             attendance.status === 'SickLeave' ? '🏥' : '✗'}
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold mb-3">Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex w-6 h-6 bg-green-100 text-green-800 text-xs font-semibold rounded-full items-center justify-center">✓</span>
            <span className="text-sm">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex w-6 h-6 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full items-center justify-center">⌚</span>
            <span className="text-sm">Late</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex w-6 h-6 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full items-center justify-center">½</span>
            <span className="text-sm">Half Day</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex w-6 h-6 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full items-center justify-center">🏥</span>
            <span className="text-sm">Sick Leave</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex w-6 h-6 bg-red-100 text-red-800 text-xs font-semibold rounded-full items-center justify-center">✗</span>
            <span className="text-sm">Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex w-6 h-6 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full items-center justify-center">-</span>
            <span className="text-sm">No Record</span>
          </div>
        </div>
      </div>
    </div>
  );
}