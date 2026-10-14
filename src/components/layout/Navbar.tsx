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

export default function Navbar() {
  const pathname = usePathname();
  const { user, role, logout, switchDemoUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = role === 'admin';

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

            {/* Quick Demo Role Switcher (for instant testing of all personas) */}
            <div className="relative">
              <button
                onClick={() => setSwitchOpen(!switchOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 border border-white/10 text-xs text-gray-200 transition-colors"
                title="Switch test accounts"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-medium truncate max-w-[120px]">
                  {mounted ? (user?.displayName || 'Select Account') : 'Select Account'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {switchOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-gray-900 border border-white/10 shadow-2xl p-2 z-50">
                  <div className="px-2 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Quick Switch Account
                  </div>
                  <button
                    onClick={() => {
                      switchDemoUser('admin-aman-00');
                      setSwitchOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-white/5 flex items-center justify-between text-amber-300"
                  >
                    <span>Coach Aman (Admin)</span>
                    <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-400">Admin</span>
                  </button>
                  <button
                    onClick={() => {
                      switchDemoUser('mem-rahul-01');
                      setSwitchOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-white/5 flex items-center justify-between text-gray-200"
                  >
                    <span>Rahul Sharma (Active)</span>
                    <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-400">Streak: 8</span>
                  </button>
                  <button
                    onClick={() => {
                      switchDemoUser('mem-priya-02');
                      setSwitchOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-white/5 flex items-center justify-between text-gray-200"
                  >
                    <span>Priya Singh (29d Streak)</span>
                    <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-400">Streak: 29</span>
                  </button>
                  <button
                    onClick={() => {
                      switchDemoUser('mem-vikram-03');
                      setSwitchOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-white/5 flex items-center justify-between text-gray-400"
                  >
                    <span>Vikram Kumar (Suspended)</span>
                    <span className="text-[10px] bg-red-500/20 px-1.5 py-0.5 rounded text-red-400">Suspended</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0d131f] px-4 pt-3 pb-5 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  isActive ? 'bg-emerald-500/15 text-emerald-400' : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <div className="text-xs text-gray-400">
              Signed in as <span className="font-semibold text-white">{mounted ? user?.displayName : ''}</span> {mounted && user?.role ? `(${user.role})` : ''}
            </div>
            <button onClick={logout} className="text-xs text-red-400 hover:underline">
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
