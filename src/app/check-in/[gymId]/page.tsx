'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import AttendanceActionButton from '@/components/attendance/AttendanceActionButton';
import CameraQrScanner from '@/components/qr/CameraQrScanner';
import { MapPin, QrCode, ShieldCheck, Dumbbell, AlertTriangle, ArrowRight } from 'lucide-react';

interface CheckInPageProps {
  params: Promise<{ gymId: string }>;
}

export default function CheckInPage({ params }: CheckInPageProps) {
  const resolvedParams = use(params);
  const gymId = resolvedParams.gymId;
  const { user, isAuthenticated } = useAuth();

  const isRecognizedGym = gymId === 'fit-fiber-gym';

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-2">
      {/* Gym Identification Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <QrCode className="w-3.5 h-3.5" />
          <span>Permanent Wall QR Gateway</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">FIT FIBER GYM</h1>
        <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>1st Floor, Alam Market, Phulwari Sharif, Patna, Bihar 801505</span>
        </p>
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
        <div className="glass-card rounded-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Sign In Required to Record Attendance</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Please sign in with your FIT FIBER GYM member account to record your check-in and update your streak.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs transition-colors"
            >
              <span>Sign In to Member Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Authenticated Attendance Experience */
        <div className="space-y-6">
          <AttendanceActionButton gymId={gymId} />

          {/* Camera Scanner option for members inside the gym */}
          <CameraQrScanner
            onScanSuccess={(decodedText) => {
              console.log('Scanned text from wall:', decodedText);
            }}
          />

          {/* Security & Static QR Policy Notice */}
          <div className="p-4 rounded-xl bg-gray-900/60 border border-white/5 text-[11px] text-gray-400 space-y-1.5 leading-relaxed">
            <div className="font-semibold text-gray-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Anti-Fraud & Attendance Policy Notice:</span>
            </div>
            <p>
              This permanent QR code is fixed on gym walls. To prevent attendance fraud from shared photos,
              self-service check-in calculates geographic proximity against FIT FIBER GYM (Patna) coordinates.
              Members who cannot provide location access must request front-desk staff check-in.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
