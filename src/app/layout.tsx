// app/layout.tsx
import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { Providers } from '@/components/Providers';


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
             <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}