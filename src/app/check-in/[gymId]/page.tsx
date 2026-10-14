'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import AttendanceActionButton from '@/components/attendance/AttendanceActionButton';
import CameraQrScanner from '@/components/qr/CameraQrScanner';
import {
  MapPin,
  QrCode,
  ShieldCheck,
  Dumbbell,
  AlertTriangle,
  ArrowRight,
  Smartphone,
  LayoutDashboard,
  User,
} from 'lucide-react';

interface CheckInPageProps {
  params: Promise<{ gymId: string }>;
}

export default function CheckInPage({ params }: CheckInPageProps) {
  const resolvedParams = use(params);
  const gymId = resolvedParams.gymId;
  const { user, isAuthenticated, role } = useAuth();
  const [triggerAutoCheckIn, setTriggerAutoCheckIn] = useState(false);

  const isRecognizedGym = gymId === 'fit-fiber-gym';

  const handleCameraScanSuccess = (decodedText: string) => {
    if (decodedText.includes('fit-fiber-gym') || decodedText.includes('check-in')) {
      setTriggerAutoCheckIn(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-2 sm:py-4">
      {/* Standalone Brand Navigation Header (Like qr~zaika /r/[slug]) */}
      <header className="flex items-center justify-between pb-4 border-b border-white/10">
        <Link href={role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-gray-950 font-black shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
            <Dumbbell className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white leading-tight flex items-center gap-1.5">
              FIT FIBER <span className="text-emerald-400 font-extrabold text-xs px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">GYM</span>
            </h1>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>Phulwari Sharif, Patna</span>
            </p>
          </div>
        </Link>

        {isAuthenticated ? (
          <Link
            href={role === 'admin' ? '/admin' : '/dashboard'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition-all shadow-sm active:scale-95"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
            <span>{role === 'admin' ? 'Admin' : 'Dashboard'}</span>
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
        )}
      </header>

      {/* Gateway Badge & Subtitle */}
      <div className="text-center space-y-1.5 pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
          <QrCode className="w-3.5 h-3.5" />
          <span>Official Wall QR Check-In Gateway</span>
        </div>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Scan the wall QR code with your phone camera or use the scanner below to record attendance and earn loyalty points.
        </p>

        {/* 3rd Party Scanner Compatibility Pill */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
          <Smartphone className="w-3.5 h-3.5 text-sky-400" />
          <span>Works with iPhone Camera, Android, Google Lens, Paytm &amp; all QR apps</span>
        </div>
      </div>

      {!isRecognizedGym && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <span className="font-bold">Unrecognized Gym Identifier: </span>
            <span>The scanned QR code contains gym ID &quot;{gymId}&quot;, which is not configured on this server.</span>
          </div>
        </div>
      )}

      {/* Authentication Check */}
      {!isAuthenticated ? (
        <div className="border border-slate-800 bg-slate-900/90 backdrop-blur-xl rounded-3xl p-7 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
            <Dumbbell className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">Sign In to Record Your Attendance</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              You scanned the FIT FIBER GYM wall QR code. Please sign in or register to log your visit, save your streak, and receive +10 points!
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20"
            >
              <span>Sign In to Member Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors"
            >
              <span>New Member Registration</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Authenticated Attendance Experience */
        <div className="space-y-6">
          {/* Main Attendance Action Card with points increase banner */}
          <AttendanceActionButton
            gymId={gymId}
            autoCheckIn={triggerAutoCheckIn}
            onSessionUpdated={() => setTriggerAutoCheckIn(false)}
          />

          {/* Camera Scanner option for scanning from within the web app */}
          <CameraQrScanner onScanSuccess={handleCameraScanSuccess} />

          {/* Security & Static QR Policy Notice */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-[11px] text-slate-400 space-y-1.5 leading-relaxed">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Permanent Wall QR Policy:</span>
            </div>
            <p>
              This permanent QR code is fixed on gym walls at Alam Market, Phulwari Sharif, Patna.
              Members scanning with any camera app receive verified attendance and daily loyalty points.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
