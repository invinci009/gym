import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FIT FIBER GYM - Attendance & Streaks',
    short_name: 'FitFiber',
    description: 'Wall QR check-in, streak tracking, and loyalty rewards for FIT FIBER GYM, Phulwari Sharif, Patna',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#020617',
    theme_color: '#0f172a',
    categories: ['fitness', 'health', 'lifestyle', 'productivity'],
    lang: 'en',
    dir: 'ltr',
    prefer_related_applications: false,
    icons: [
      {
        src: '/icons/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcuts: [
      {
        name: 'Wall Check-In Gateway',
        short_name: 'Check In',
        description: 'Instant GPS attendance verification for Fit Fiber Gym',
        url: '/check-in/fit-fiber-gym',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Member Dashboard',
        short_name: 'Streak & Points',
        description: 'View your live streak flames and loyalty points balance',
        url: '/dashboard',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Loyalty Rewards Catalog',
        short_name: 'Rewards',
        description: 'Redeem protein shakes, gym gear, and personal training',
        url: '/rewards',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
    ],
  };
}
