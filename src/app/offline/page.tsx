'use client';

import React from 'react';
import { WifiOff, RefreshCw, Dumbbell, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="glass-card max-w-md w-full rounded-3xl p-8 border border-white/10 space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto animate-pulse">
          <WifiOff className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
            Offline Mode
          </span>
          <h1 className="text-2xl font-black text-white">No Internet Connection</h1>
          <p className="text-xs text-gray-400 leading-relaxed">
            FIT FIBER GYM requires an active internet connection to verify your GPS proximity and sync your streak.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-gray-900/60 border border-white/5 text-[11px] text-gray-400 space-y-1">
          <div className="font-semibold text-gray-300 flex items-center justify-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>FIT FIBER GYM, Phulwari Sharif, Patna</span>
          </div>
          <p>If you are inside the gym, connect to the Fit Fiber Gym member Wi-Fi.</p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={handleReload}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Reconnecting</span>
          </button>
          <Link
            href="/dashboard"
            className="w-full py-2.5 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-xs transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
