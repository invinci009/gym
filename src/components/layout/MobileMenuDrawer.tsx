'use client';

import React from 'react';
import Link from 'next/link';
import {
  X,
  Dumbbell,
  MapPin,
  Flame,
  Award,
  Gift,
  QrCode,
  Calendar,
  Users,
  Clock,
  ShieldCheck,
  Share2,
  Smartphone,
  LogOut,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { usePwa } from '@/components/pwa/PwaProvider';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenuDrawer({ isOpen, onClose }: MobileMenuDrawerProps) {
  const { user, role, logout, switchDemoUser } = useAuth();
  const { isInstallable, isInstalled, promptInstall, setShowInstallModal } = usePwa();
  const isAdmin = role === 'admin';

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      await promptInstall();
    } else {
      setShowInstallModal(true);
    }
    onClose();
  };

  const handleShareCheckIn = async () => {
    const url = `${window.location.origin}/check-in/fit-fiber-gym`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FIT FIBER GYM - Wall Check-In',
          text: 'Scan to check in, track your streak, and earn loyalty points at FIT FIBER GYM, Patna!',
          url,
        });
      } catch {
        // ignore
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Check-in link copied to clipboard!');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xs bg-gradient-to-b from-gray-900 via-gray-950 to-black border-l border-white/10 h-full p-5 flex flex-col justify-between overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-250 pb-safe"
        role="dialog"
        aria-modal="true"
      >
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-gray-950 shadow-md">
                <Dumbbell className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white leading-tight">FIT FIBER GYM</h3>
                <p className="text-[10px] text-gray-400 flex items-center gap-0.5">
                  <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Phulwari Sharif, Patna</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User Profile Card */}
          {user && (
            <div className="p-3.5 rounded-2xl bg-gray-900/90 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{user.displayName}</div>
                  <div className="text-[10px] text-gray-400 truncate max-w-[160px]">{user.email}</div>
                </div>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    isAdmin
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {isAdmin ? 'Admin' : 'Member'}
                </span>
              </div>

              {!isAdmin && (
                <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs">
                  <span className="flex items-center gap-1 font-bold text-amber-400">
                    <Flame className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{user.currentStreak} Day Streak</span>
                  </span>
                  <span className="flex items-center gap-1 font-bold text-emerald-400">
                    <Award className="w-3.5 h-3.5" />
                    <span>{user.pointsBalance} pts</span>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Navigation Links */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 py-1">
              {isAdmin ? 'Admin Management' : 'Member Navigation'}
            </div>

            {isAdmin ? (
              <>
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-xs text-gray-200 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Dumbbell className="w-4 h-4 text-emerald-400" />
                    <span>Command Overview</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                </Link>

                <Link
                  href="/admin/attendance"
                  onClick={onClose}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-xs text-gray-200 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span>Live Attendance</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                </Link>

                <Link
                  href="/admin/members"
                  onClick={onClose}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-xs text-gray-200 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>Members Directory</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                </Link>

                <Link
                  href="/admin/rewards"
                  onClick={onClose}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-xs text-gray-200 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Gift className="w-4 h-4 text-emerald-400" />
                    <span>Rewards &amp; Claims</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                </Link>

                <Link
                  href="/admin/loyalty-settings"
                  onClick={onClose}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-xs text-gray-200 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Rules &amp; GPS Radius</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                </Link>

                <Link
                  href="/admin/qr"
                  onClick={onClose}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-xs text-gray-200 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <span>Permanent Wall QR</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  onClick={onClose}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-xs text-gray-200 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Dashboard &amp; Streaks</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                </Link>

                <Link
                  href="/check-in/fit-fiber-gym"
                  onClick={onClose}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-xs text-gray-200 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <span>Wall Check-In Gateway</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                </Link>

                <Link
                  href="/attendance"
                  onClick={onClose}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-xs text-gray-200 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span>History &amp; Calendar</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                </Link>

                <Link
                  href="/rewards"
                  onClick={onClose}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-xs text-gray-200 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Gift className="w-4 h-4 text-emerald-400" />
                    <span>Rewards Catalogue</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                </Link>
              </>
            )}
          </div>

          {/* Quick Share and Install Actions */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <button
              onClick={handleShareCheckIn}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-xs text-white border border-white/10 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-sky-400" />
                <span>Share Check-In Link</span>
              </span>
              <span className="text-[10px] text-gray-400">Patna QR</span>
            </button>

            {!isInstalled && (
              <button
                onClick={handleInstallClick}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-xs text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Install App on Home Screen</span>
                </span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </button>
            )}
          </div>
        </div>

        {/* Footer Account Switcher & Sign Out */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider px-1">
            Test Accounts:
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <button
              onClick={() => {
                switchDemoUser('admin@fitgym.com');
                onClose();
              }}
              className="py-1 px-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-amber-300 text-left truncate border border-white/5 cursor-pointer"
            >
              Coach Aman (Admin)
            </button>
            <button
              onClick={() => {
                switchDemoUser('mem-rahul-01');
                onClose();
              }}
              className="py-1 px-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-emerald-300 text-left truncate border border-white/5 cursor-pointer"
            >
              Rahul (Active)
            </button>
          </div>

          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer border border-red-500/20 mt-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
