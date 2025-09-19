// app/layout.tsx
import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import './globals.css';

export const metadata = {
  title: 'Attendance Management',
  description: 'Employee attendance management system',
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div>
          <Navigation />
          {children}
        </div>
      </body>
    </html>
  );
}