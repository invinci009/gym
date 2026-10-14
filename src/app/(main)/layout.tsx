import React, { Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<div className="h-16 bg-[#0b0f17] border-b border-white/10" />}>
        <Navbar />
      </Suspense>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20 md:pb-8">
        <Suspense fallback={<div className="py-12 text-center text-xs text-gray-400">Loading...</div>}>
          {children}
        </Suspense>
      </main>
      <footer className="border-t border-white/5 py-6 text-center text-xs text-gray-500 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-gray-400">
            FIT FIBER GYM • 1st Floor, Alam Market, Phulwari Sharif, Patna, Bihar 801505
          </p>
          <p className="text-[11px] text-gray-600">
            Permanent Wall QR Attendance System • Serverless Firebase Architecture • 30-Day Inactivity Window
          </p>
        </div>
      </footer>
    </>
  );
}
