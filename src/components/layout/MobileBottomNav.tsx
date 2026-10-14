'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Flame,
  QrCode,
  Calendar,
  Gift,
  Users,
  Clock,
  Menu,
  Dumbbell,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';

interface MobileBottomNavProps {
  onOpenDrawer: () => void;
}

export default function MobileBottomNav({ onOpenDrawer }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { user, role } = useAuth();
  const isAdmin = role === 'admin';

  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  interface NavTabItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  const memberTabs: NavTabItem[] = [
    { href: '/dashboard', label: 'Streak', icon: Flame, badge: user?.currentStreak ? `${user.currentStreak}d` : undefined },
    { href: '/check-in/fit-fiber-gym', label: 'Check In', icon: QrCode },
    { href: '/attendance', label: 'History', icon: Calendar },
    { href: '/rewards', label: 'Rewards', icon: Gift, badge: user?.pointsBalance ? `${user.pointsBalance}p` : undefined },
  ];

  const adminTabs: NavTabItem[] = [
    { href: '/admin', label: 'Overview', icon: Dumbbell },
    { href: '/admin/attendance', label: 'Live', icon: Clock },
    { href: '/admin/members', label: 'Members', icon: Users },
    { href: '/admin/qr', label: 'Wall QR', icon: QrCode },
  ];

  const tabs = isAdmin ? adminTabs : memberTabs;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070b12]/95 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative ${
                isActive
                  ? 'text-emerald-400 font-bold scale-105'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-3 px-1 py-0.2 rounded-full text-[9px] font-black bg-emerald-500 text-gray-950 leading-tight shadow-sm">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium truncate max-w-[64px]">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-emerald-400 mt-0.5 animate-pulse" />
              )}
            </Link>
          );
        })}

        {/* More Menu Drawer Trigger */}
        <button
          onClick={onOpenDrawer}
          className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl text-gray-400 hover:text-gray-200 cursor-pointer"
        >
          <Menu className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">More</span>
        </button>
      </div>
    </div>
  );
}
