'use client';

import React, { useEffect, useState } from 'react';
import { Dumbbell, MapPin, QrCode, ShieldCheck, Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function WallPosterPrintPage() {
  const [mounted, setMounted] = useState(false);
  const [appUrl, setAppUrl] = useState('');

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setAppUrl(window.location.origin);
    }
  }, []);

  const gymId = 'fit-fiber-gym';
  const qrImageUrl = `/api/gym/qr?gymId=${gymId}&format=png&v=1`;
  const checkInUrl = `${appUrl}/check-in/${gymId}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 flex flex-col items-center">
      {/* Screen-only Controls (Hidden during print) */}
      <div className="w-full max-w-2xl mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/admin/qr"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to QR Studio</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-950 bg-emerald-400 hover:bg-emerald-300 px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Poster (A4 / A3)</span>
          </button>
        </div>
      </div>

      {/* The Official A4 Printable Poster Frame */}
      <div className="w-full max-w-2xl bg-white text-slate-950 rounded-3xl p-8 sm:p-12 shadow-2xl border-4 border-slate-950 relative flex flex-col items-center text-center print:shadow-none print:border-none print:p-6 print:m-0 print:max-w-none print:w-full">
        {/* Top Badges */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase bg-emerald-600 text-white">
            Official Attendance Gateway
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-slate-100 text-slate-700 border border-slate-200">
            Permanent Wall QR
          </span>
        </div>

        {/* Brand Header */}
        <div className="flex items-center justify-center gap-3 mt-1 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-950 text-emerald-400 flex items-center justify-center font-extrabold shadow-md">
            <Dumbbell className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div className="text-left">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 leading-none">
              FIT FIBER <span className="text-emerald-600">GYM</span>
            </h1>
            <p className="text-xs font-bold text-slate-600 tracking-wide mt-1">
              Strength • Conditioning • Loyalty
            </p>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-700 font-medium mb-6">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>1st Floor, Alam Market, Phulwari Sharif, Patna, Bihar 801505</span>
        </div>

        {/* High Resolution Wall QR Frame */}
        <div className="p-5 bg-white rounded-3xl border-4 border-slate-900 shadow-xl my-2 max-w-xs sm:max-w-sm w-full flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrImageUrl}
            alt="FIT FIBER GYM Wall Check-In QR"
            className="w-64 h-64 sm:w-72 sm:h-72 object-contain"
          />
        </div>

        {/* Direct Link Caption */}
        <div className="mt-3 text-[11px] font-mono text-slate-500 font-semibold">
          {checkInUrl || 'http://localhost:3000/check-in/fit-fiber-gym'}
        </div>

        {/* Step-by-Step Instructions */}
        <div className="w-full max-w-md mt-6 pt-6 border-t-2 border-slate-200 grid grid-cols-3 gap-3 text-center">
          <div className="space-y-1">
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center mx-auto">
              1
            </div>
            <div className="text-xs font-bold text-slate-900">Point Camera</div>
            <div className="text-[10px] text-slate-600 leading-tight">
              Open your phone camera or QR scanner
            </div>
          </div>

          <div className="space-y-1">
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center mx-auto">
              2
            </div>
            <div className="text-xs font-bold text-slate-900">Tap to Open</div>
            <div className="text-[10px] text-slate-600 leading-tight">
              Verify gym location &amp; record attendance
            </div>
          </div>

          <div className="space-y-1">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center mx-auto">
              3
            </div>
            <div className="text-xs font-bold text-emerald-700">Earn &amp; Streak</div>
            <div className="text-[10px] text-slate-600 leading-tight">
              Maintain 30d streak &amp; unlock free rewards
            </div>
          </div>
        </div>

        {/* Security & Verification Callout */}
        <div className="mt-8 pt-4 border-t border-slate-200 w-full flex items-center justify-center gap-2 text-[11px] font-bold text-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Server-Side GPS Verified • 75m Gym Boundary • Anti-Fraud Protection</span>
        </div>
      </div>
    </div>
  );
}
