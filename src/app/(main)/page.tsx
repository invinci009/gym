'use client';

import React from 'react';
import Link from 'next/link';
import {
  Flame,
  QrCode,
  ShieldCheck,
  Award,
  MapPin,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Dumbbell,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';

export default function HomePage() {
  const { user, role } = useAuth();

  return (
    <div className="space-y-12 sm:space-y-16 py-4">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto pt-4 sm:pt-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Permanent Wall QR Attendance & 30-Day Streak Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
          FIT FIBER <span className="text-emerald-400">GYM</span>
          <span className="block text-2xl sm:text-3xl font-extrabold text-gray-300 mt-2">
            Phulwari Sharif, Patna
          </span>
        </h1>

        <p className="text-base sm:text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto">
          Scan the permanent printed QR code on our gym walls to record your attendance, maintain your streak,
          accumulate fitness loyalty points, and unlock exclusive rewards.
        </p>

        {/* Call to action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/check-in/fit-fiber-gym"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black text-sm transition-all shadow-xl shadow-emerald-500/25 hover:scale-105"
          >
            <QrCode className="w-4 h-4 stroke-[2.5]" />
            <span>Scan Wall QR & Check In</span>
            <ChevronRight className="w-4 h-4" />
          </Link>

          <Link
            href={role === 'admin' ? '/admin' : '/dashboard'}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm border border-white/10 transition-all hover:border-white/20"
          >
            <Dumbbell className="w-4 h-4 text-emerald-400" />
            <span>{role === 'admin' ? 'Admin Portal' : 'Member Dashboard'}</span>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-6 text-xs text-gray-500 pt-2">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            Alam Market, Phulwari Sharif
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            75m GPS Security Check
          </span>
        </div>
      </div>

      {/* Feature Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pillar 1: Permanent Static QR */}
        <div className="glass-card glass-card-hover rounded-2xl p-6 sm:p-7 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <QrCode className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h3 className="text-lg font-bold text-white">Permanent Wall QR Code</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Printed once and framed permanently on the gym walls. No rotating electronic screens needed.
            Attendance is validated dynamically with server-side geolocation on Patna coordinates.
          </p>
          <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
            <span>Stable & Anti-Fraud Verified</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Pillar 2: 30-Day Inactivity Window Streak Engine */}
        <div className="glass-card glass-card-hover rounded-2xl p-6 sm:p-7 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Flame className="w-6 h-6 fill-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-white">30-Day Streak Inactivity Policy</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Streaks do not break when taking rest days! Your streak increments with every qualifying day and only
            resets to 1 if 30 consecutive days pass without a visit.
          </p>
          <div className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
            <span>Milestone bonuses at 7, 14, 30 & 60 days</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Pillar 3: Points Ledger & Rewards */}
        <div className="glass-card glass-card-hover rounded-2xl p-6 sm:p-7 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center">
            <Award className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h3 className="text-lg font-bold text-white">Atomic Loyalty Ledger</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Earn 10 points on your first daily visit. Redeem points for protein shakes, shaker bottles, gym
            towels, personal training consultations, and membership discounts.
          </p>
          <div className="text-[11px] font-semibold text-sky-400 flex items-center gap-1">
            <span>Server-side atomic ledger</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Gym Overview & Location Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <MapPin className="w-4 h-4" />
            <span>Phulwari Sharif Headquarters</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">FIT FIBER GYM</h2>
          <p className="text-xs text-gray-400 max-w-xl leading-relaxed">
            1st Floor, Alam Market, Phulwari Sharif, Patna, Bihar 801505.
            Coordinates: 25.57724, 85.06871. Open Monday to Sunday with morning and evening slots.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/check-in/fit-fiber-gym"
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs transition-colors"
          >
            Open Check-In
          </Link>
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold text-xs border border-white/10 transition-colors"
          >
            Sign In / Register
          </Link>
        </div>
      </div>
    </div>
  );
}
