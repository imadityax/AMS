import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  
  // if (!user || user.role !== 'Manager' ) {
  //   redirect('/unauthorized');
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <ManagerHeader />
      <div className="flex">
        <ManagerSidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function ManagerHeader() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h1 className="text-2xl font-bold text-gray-900">TechLead Dashboard</h1>
      </div>
    </header>
  );
}

function ManagerSidebar() {
  return (
    <aside className="w-64 bg-white shadow-sm h-screen sticky top-0">
      <nav className="p-6">
        <ul className="space-y-4">
          <li>
            <a href="/techlead" className="text-gray-700 hover:text-blue-600 font-medium">
              Dashboard
            </a>
          </li>
          <li>
            <a href="/techlead/employees" className="text-gray-700 hover:text-blue-600 font-medium">
              My Employees
            </a>
          </li>
          <li>
            <a href="/techlead/assign-task" className="text-gray-700 hover:text-blue-600 font-medium">
              Assign Task
            </a>
          </li>
          <li>
            <a href="/techlead/attendance" className="text-gray-700 hover:text-blue-600 font-medium">
              Attendance
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}