'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import {
  Flame,
  Award,
  QrCode,
  Calendar,
  History,
  ShieldAlert,
  User,
  LogOut,
  Menu,
  X,
  Dumbbell,
  Gift,
  ChevronDown,
} from 'lucide-react';
import MobileBottomNav from './MobileBottomNav';
import MobileMenuDrawer from './MobileMenuDrawer';

export default function Navbar() {
  const pathname = usePathname();
  const { user, role, logout, switchDemoUser } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = role === 'admin';

  // Standalone pages (like qr~zaika's /r/[slug] customer landing or print poster)
  if (pathname.startsWith('/check-in') || pathname === '/admin/qr/poster') {
    return null;
  }

  const memberLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Dumbbell },
    { href: '/check-in/fit-fiber-gym', label: 'Check In / Out', icon: QrCode },
    { href: '/attendance', label: 'History & Calendar', icon: Calendar },
    { href: '/rewards', label: 'Rewards', icon: Gift },
  ];

  const adminLinks = [
    { href: '/admin', label: 'Overview', icon: Dumbbell },
    { href: '/admin/members', label: 'Members', icon: User },
    { href: '/admin/attendance', label: 'Live Attendance', icon: History },
    { href: '/admin/qr', label: 'Wall QR Code', icon: QrCode },
    { href: '/admin/rewards', label: 'Rewards Admin', icon: Gift },
    { href: '/admin/loyalty-settings', label: 'Rules & Location', icon: ShieldAlert },
    { href: '/admin/reports', label: 'Reports', icon: Award },
  ];

  const links = isAdmin ? adminLinks : memberLinks;

  return (
    <header className="sticky top-0 z-50 bg-[#0b0f17]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-black font-extrabold shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Dumbbell className="w-5 h-5 text-gray-950 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-lg font-black tracking-wider text-white flex items-center gap-1.5">
                  FIT FIBER <span className="text-emerald-400 font-extrabold text-xs px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">GYM</span>
                </span>
                <span className="block text-[10px] text-gray-400 tracking-tight">Phulwari Sharif, Patna</span>
              </div>
            </Link>

            {/* Admin Badge */}
            {isAdmin && (
              <span className="ml-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Staff Admin
              </span>
            )}
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href) && link.href !== '/admin');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Status / Quick Switcher */}
          <div className="hidden sm:flex items-center gap-3">
            {mounted && !isAdmin && user && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-xs">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
                <span className="font-bold text-white">{user.currentStreak} Day Streak</span>
                <span className="text-gray-500">•</span>
                <Award className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-emerald-400">{user.pointsBalance} pts</span>
              </div>
            )}

            {/* User Profile & Session Controls */}
            <div className="relative">
              <button
                onClick={() => setSwitchOpen(!switchOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition-all cursor-pointer shadow-sm active:scale-95"
                title="Account menu"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px] border border-emerald-500/30">
                  {mounted && user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'FF'}
                </div>
                <span className="font-semibold truncate max-w-[120px]">
                  {mounted ? (user?.displayName || 'My Account') : 'My Account'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {switchOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* Account Header */}
                  <div className="pb-2.5 mb-2 border-b border-slate-800/80">
                    <div className="text-xs font-bold text-white truncate">{user?.displayName}</div>
                    <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        isAdmin ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {isAdmin ? 'Staff Admin' : 'Gym Member'}
                      </span>
                      {!isAdmin && user && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          {user.pointsBalance} pts • {user.currentStreak}d streak
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Account Switcher Options (for staff/multi-user management) */}
                  <div className="space-y-1">
                    <div className="px-1 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Switch User Account
                    </div>
                    <button
                      onClick={() => {
                        switchDemoUser('admin@fitgym.com');
                        setSwitchOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs hover:bg-slate-800 flex items-center justify-between text-amber-300 transition-colors cursor-pointer"
                    >
                      <span className="font-medium">Coach Aman (Admin)</span>
                      <span className="text-[10px] text-amber-400/80">Staff</span>
                    </button>
                    <button
                      onClick={() => {
                        switchDemoUser('mem-rahul-01');
                        setSwitchOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs hover:bg-slate-800 flex items-center justify-between text-slate-200 transition-colors cursor-pointer"
                    >
                      <span className="font-medium">Rahul Sharma</span>
                      <span className="text-[10px] text-emerald-400 font-semibold">8d streak</span>
                    </button>
                    <button
                      onClick={() => {
                        switchDemoUser('mem-priya-02');
                        setSwitchOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs hover:bg-slate-800 flex items-center justify-between text-slate-200 transition-colors cursor-pointer"
                    >
                      <span className="font-medium">Priya Singh</span>
                      <span className="text-[10px] text-emerald-400 font-semibold">29d streak</span>
                    </button>
                  </div>

                  {/* Sign Out */}
                  <div className="pt-2 mt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => {
                        logout();
                        setSwitchOpen(false);
                      }}
                      className="w-full px-2.5 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 font-semibold transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 rounded-xl bg-gray-800 text-gray-300 hover:text-white cursor-pointer"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slideout Drawer */}
      <MobileMenuDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav onOpenDrawer={() => setDrawerOpen(true)} />
    </header>
  );
}
