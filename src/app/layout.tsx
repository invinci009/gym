import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import './globals.css';
import { AuthProvider } from '@/lib/auth/context';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'FIT FIBER GYM — Attendance, Streak & Loyalty Rewards',
  description:
    'Official Attendance, Streak Tracking & Loyalty Rewards platform for FIT FIBER GYM, Phulwari Sharif, Patna, Bihar.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-gray-100 min-h-screen flex flex-col antialiased">
        <AuthProvider>
          <Suspense fallback={<div className="h-16 bg-[#0b0f17] border-b border-white/10" />}>
            <Navbar />
          </Suspense>
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <Suspense fallback={<div className="py-12 text-center text-xs text-gray-400">Loading...</div>}>
              {children}
            </Suspense>
          </main>
          <footer className="border-t border-white/5 py-6 text-center text-xs text-gray-500">
            <div className="max-w-7xl mx-auto px-4 space-y-1">
              <p className="font-semibold text-gray-400">
                FIT FIBER GYM • 1st Floor, Alam Market, Phulwari Sharif, Patna, Bihar 801505
              </p>
              <p className="text-[11px] text-gray-600">
                Permanent Wall QR Attendance System • Serverless Firebase Architecture • 30-Day Inactivity Window
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
