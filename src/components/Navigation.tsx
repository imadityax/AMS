'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  HomeIcon,
  CalendarIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { Bell } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';
const Navigation = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { data: session } = useSession();
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Attendance', href: '/attendance', icon: CalendarIcon },
    { name: 'Leave', href: '/leave', icon: BriefcaseIcon },
    { name: 'Tasks', href: '/tasks', icon: CheckCircleIcon },
    { name: 'Communication', href: '/communication', icon: ChatBubbleLeftRightIcon },
    { name: 'Notifications', href: '/notifications', icon: Bell },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        {/* Logo */}
        <div className="flex-shrink-0 text-xl font-bold text-blue-600">AMS</div>

        {/* Navigation Items */}
        <nav className="hidden md:flex space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
            >
              <item.icon className="h-5 w-5 mr-2" />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-2"
            >
              <UserCircleIcon className="h-8 w-8 text-gray-400" />
              <span className="hidden md:block">
                {session?.user?.name || "Guest"}
              </span>
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                {session ? (
                  <>
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {session.user?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {session.user?.email}
                      </p>
                    </div>

                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Cog6ToothIcon className="h-4 w-4 mr-2" />
                      Settings
                    </Link>

                    <button
                      onClick={() => signOut()}
                      className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => signIn("google")}
                    className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 w-full text-left"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                    Login
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navigation;