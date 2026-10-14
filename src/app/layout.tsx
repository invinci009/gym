import type { Metadata, Viewport } from 'next';
import React, { Suspense } from 'react';
import './globals.css';
import { AuthProvider } from '@/lib/auth/context';
import { PwaProvider } from '@/components/pwa/PwaProvider';
import PwaInstallPrompt from '@/components/pwa/PwaInstallPrompt';
import OfflineIndicator from '@/components/pwa/OfflineIndicator';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'FIT FIBER GYM — Attendance, Streak & Loyalty Rewards',
  description:
    'Official Attendance, Streak Tracking & Loyalty Rewards platform for FIT FIBER GYM, Phulwari Sharif, Patna, Bihar.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Fit Fiber Gym',
  },
  icons: {
    icon: [
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="bg-[#090d16] text-gray-100 min-h-screen flex flex-col antialiased">
        <PwaProvider>
          <AuthProvider>
            <OfflineIndicator />
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
            <PwaInstallPrompt />
          </AuthProvider>
        </PwaProvider>
      </body>
    </html>
  );
}
