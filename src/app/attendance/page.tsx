'use client';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';


// Define TypeScript interfaces
interface AttendanceRecord {
  id: string;
  date: string;
  punchIn: string;
  punchOut: string | null;
  hoursWorked: string | null;
  status: 'Present' | 'Absent' | 'Late' | 'Half-day';
}

interface User {
  name: string;
  position: string;
  avatar: string;
}

const AttendancePage = () => {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isClockedIn, setIsClockedIn] = useState<boolean>(false);
  const [punchInTime, setPunchInTime] = useState<string | null>(null);
  const [punchOutTime, setPunchOutTime] = useState<string | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [user, setUser] = useState<User>({
    name: 'John Doe',
    position: 'Software Developer',
    avatar: '/avatar.png',
  });

  // Fetch user data and attendance records (simulated)
  useEffect(() => {
    // Simulate fetching user data
    const fetchUserData = () => {
      // In a real app, this would be an API call
      setUser({
        name: 'John Doe',
        position: 'Software Developer',
        avatar: '/avatar.png',
      });
    };

    // Simulate fetching attendance records
    const fetchAttendanceRecords = () => {
      // Mock data
      const mockRecords: AttendanceRecord[] = [
        {
          id: '1',
          date: '2023-06-01',
          punchIn: '09:00 AM',
          punchOut: '05:00 PM',
          hoursWorked: '8.0',
          status: 'Present',
        },
        {
          id: '2',
          date: '2023-06-02',
          punchIn: '09:15 AM',
          punchOut: '05:00 PM',
          hoursWorked: '7.75',
          status: 'Late',
        },
        {
          id: '3',
          date: '2023-06-03',
          punchIn: '08:45 AM',
          punchOut: '04:30 PM',
          hoursWorked: '7.75',
          status: 'Present',
        },
        {
          id: '4',
          date: '2023-06-04',
          punchIn: '09:00 AM',
          punchOut: null,
          hoursWorked: null,
          status: 'Half-day',
        },
      ];
      setAttendanceRecords(mockRecords);
    };

    fetchUserData();
    fetchAttendanceRecords();
  }, []);

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle punch in/out
  const handlePunch = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });

    if (!isClockedIn) {
      // Punch in
      setPunchInTime(timeString);
      setPunchOutTime(null);
      setIsClockedIn(true);
      
      // Add to records (in a real app, this would be an API call)
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        date: now.toISOString().split('T')[0],
        punchIn: timeString,
        punchOut: null,
        hoursWorked: null,
        status: 'Present',
      };
      setAttendanceRecords([newRecord, ...attendanceRecords]);
    } else {
      // Punch out
      setPunchOutTime(timeString);
      setIsClockedIn(false);
      
      // Update the latest record (in a real app, this would be an API call)
      const updatedRecords = [...attendanceRecords];
      if (updatedRecords.length > 0) {
        updatedRecords[0].punchOut = timeString;
        
        // Calculate hours worked (simplified)
        const punchInDate = new Date();
        punchInDate.setHours(parseInt(punchInTime?.split(':')[0] || '0'));
        punchInDate.setMinutes(parseInt(punchInTime?.split(' ')[0].split(':')[1] || '0'));
        
        const punchOutDate = new Date();
        punchOutDate.setHours(parseInt(timeString.split(':')[0]));
        punchOutDate.setMinutes(parseInt(timeString.split(' ')[0].split(':')[1]));
        
        const diffMs = punchOutDate.getTime() - punchInDate.getTime();
        const diffHrs = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
        
        updatedRecords[0].hoursWorked = diffHrs.toFixed(2);
      }
      setAttendanceRecords(updatedRecords);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Attendance Management</title>
        <meta name="description" content="Employee attendance management system" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Header */}
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Attendance</h1>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-600">{user.position}</p>
              </div>
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
          </header>

          {/* Current Time and Punch Card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Today's Attendance</h2>
              <div className="text-center py-4">
                <p className="text-3xl font-bold text-blue-600">{currentTime}</p>
                <p className="text-gray-600 mt-2">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between mb-4">
                  <div>
                    <p className="text-gray-600">Punch In</p>
                    <p className="font-semibold">{punchInTime || '--:-- --'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Punch Out</p>
                    <p className="font-semibold">{punchOutTime || '--:-- --'}</p>
                  </div>
                </div>
                
                <button
                  onClick={handlePunch}
                  className={`w-full py-3 rounded-lg font-semibold ${
                    isClockedIn 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {isClockedIn ? 'Punch Out' : 'Punch In'}
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">This Week</h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">38.5</p>
                  <p className="text-gray-600">Hours</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">4</p>
                  <p className="text-gray-600">Days Present</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">1</p>
                  <p className="text-gray-600">Days Late</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Recent Activity</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between text-sm">
                    <span>Monday - Early Departure</span>
                    <span className="text-orange-500">-0.5 hrs</span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span>Tuesday - Overtime</span>
                    <span className="text-green-500">+1.5 hrs</span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span>Wednesday - Regular</span>
                    <span className="text-blue-500">8.0 hrs</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Attendance History */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Attendance History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Punch In
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Punch Out
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hours
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceRecords.map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(record.date)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.punchIn}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.punchOut || '--:-- --'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.hoursWorked || '--'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${record.status === 'Present' ? 'bg-green-100 text-green-800' : ''}
                          ${record.status === 'Late' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${record.status === 'Absent' ? 'bg-red-100 text-red-800' : ''}
                          ${record.status === 'Half-day' ? 'bg-blue-100 text-blue-800' : ''}
                        `}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AttendancePage;