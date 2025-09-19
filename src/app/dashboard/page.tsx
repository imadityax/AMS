'use client';

import { useState, useEffect } from 'react';

interface Notification {
  id: number;
  message: string;
  time: string;
}

interface TeamStatus {
  present: number;
  total: number;
  onLeave: number;
  remote: number;
  onLunch: number;
}

export default function Dashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(true);
  const [isOnLunch, setIsOnLunch] = useState(false);
  
  const notifications: Notification[] = [
    { id: 1, message: 'Leave approved for Dec 25-26', time: '2 hours ago' },
    { id: 2, message: 'New task assigned: Q4 Report', time: '5 hours ago' },
    { id: 3, message: 'Payroll processed successfully', time: '1 day ago' },
  ];
  
  const teamStatus: TeamStatus = {
    present: 24,
    total: 28,
    onLeave: 3,
    remote: 1,
    onLunch: 5
  };

  // Format date on client-side only to avoid hydration mismatch
  const formattedDate = isMounted 
    ? new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'Loading...';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePunch = () => {
    setIsClockedIn(!isClockedIn);
  };

  const handleLunch = () => {
    setIsOnLunch(!isOnLunch);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, John!</h1>
            <p className="text-gray-600">
              Today is {formattedDate}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
              <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
              On Time
            </div>
            <div className="text-sm text-gray-600">
              Checked in at 9:00 AM
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition-shadow">
            <button 
              onClick={handlePunch}
              className={`w-full py-3 px-4 rounded-md font-medium ${isClockedIn ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
            >
              <i className="far fa-clock mr-2"></i>
              {isClockedIn ? 'Punch Out' : 'Punch In'}
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition-shadow">
            <button 
              onClick={handleLunch}
              className={`w-full py-3 px-4 rounded-md font-medium ${isOnLunch ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <i className="fas fa-utensils mr-2"></i>
              {isOnLunch ? 'End Lunch' : 'Lunch Break'}
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition-shadow">
            <button className="w-full py-3 px-4 bg-purple-100 text-purple-700 rounded-md font-medium hover:bg-purple-200">
              <i className="far fa-calendar-alt mr-2"></i>
              Apply Leave
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition-shadow">
            <button className="w-full py-3 px-4 bg-indigo-100 text-indigo-700 rounded-md font-medium hover:bg-indigo-200">
              <i className="fas fa-tasks mr-2"></i>
              View Tasks
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">This Month</h3>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-indigo-600">22</span>
              <span className="ml-2 text-sm text-gray-500">Days</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Attendance</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Leave Balance</h3>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-green-600">18</span>
              <span className="ml-2 text-sm text-gray-500">Days</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Remaining</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tasks</h3>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-yellow-600">5</span>
              <span className="ml-2 text-sm text-gray-500">Pending</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">To be completed</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Performance</h3>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-blue-600">94%</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">This quarter</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Notifications */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Notifications</h3>
              </div>
              <ul className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <li key={notification.id} className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Team Overview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Team Overview</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                    <span className="text-xl font-bold text-blue-600">{teamStatus.present}/{teamStatus.total}</span>
                  </div>
                  <h4 className="mt-4 text-sm font-medium text-gray-900">Present Today</h4>
                </div>
                
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                    <span className="text-xl font-bold text-yellow-600">{teamStatus.onLeave}</span>
                  </div>
                  <h4 className="mt-4 text-sm font-medium text-gray-900">On Leave</h4>
                </div>
                
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <span className="text-xl font-bold text-green-600">{teamStatus.remote}</span>
                  </div>
                  <h4 className="mt-4 text-sm font-medium text-gray-900">Remote Work</h4>
                </div>
                
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100">
                    <span className="text-xl font-bold text-purple-600">{teamStatus.onLunch}</span>
                  </div>
                  <h4 className="mt-4 text-sm font-medium text-gray-900">Lunch Break</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}