import type { Metadata, Viewport } from 'next';
import React from 'react';
import './globals.css';
import { AuthProvider } from '@/lib/auth/context';
import { PwaProvider } from '@/components/pwa/PwaProvider';
import PwaInstallPrompt from '@/components/pwa/PwaInstallPrompt';
import OfflineIndicator from '@/components/pwa/OfflineIndicator';

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
            {children}
            <PwaInstallPrompt />
          </AuthProvider>
        </PwaProvider>
      </body>
    </html>
  );
}
