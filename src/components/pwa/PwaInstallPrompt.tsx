'use client';

import React from 'react';
import { usePwa } from './PwaProvider';
import { Download, Share, PlusSquare, X, Sparkles, Check, Smartphone, Dumbbell } from 'lucide-react';

export default function PwaInstallPrompt() {
  const {
    isInstallable,
    isInstalled,
    isIOS,
    showInstallModal,
    promptInstall,
    dismissInstallPrompt,
  } = usePwa();

  if (isInstalled || !showInstallModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-gradient-to-b from-gray-900 via-gray-900 to-slate-950 border border-emerald-500/30 rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_-15px_rgba(16,185,129,0.3)] text-slate-100 relative space-y-4 animate-in slide-in-from-bottom-6 duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pwa-install-title"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={dismissInstallPrompt}
          aria-label="Dismiss installation prompt"
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with App Icon */}
        <div className="flex items-center gap-3.5 pt-1">
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-600/30 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/icon-192x192.png"
              alt="FIT FIBER GYM"
              className="w-full h-full rounded-2xl object-cover"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-950 border border-emerald-400 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-3 h-3" />
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Official Web App
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h2 id="pwa-install-title" className="text-lg font-black tracking-tight text-white leading-tight">
              Install FIT FIBER GYM
            </h2>
            <p className="text-xs text-gray-400">
              Instant Wall Check-In &amp; Streaks on your Home Screen
            </p>
          </div>
        </div>

        {/* Value Proposition bullets */}
        <div className="space-y-2 py-1 text-xs text-gray-300">
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span><strong>One-tap wall check-in:</strong> Instant GPS verification without opening browser tabs.</span>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5 text-amber-400">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span><strong>Live streak flames:</strong> 30-day inactivity countdown to protect your streak.</span>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shrink-0 mt-0.5 text-sky-400">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span><strong>Digital Rewards Pass:</strong> Redeem protein shakes &amp; merch right at the counter.</span>
          </div>
        </div>

        {/* Action button based on OS */}
        {isIOS ? (
          <div className="space-y-2.5 pt-1">
            <div className="p-3 rounded-2xl bg-gray-800/80 border border-white/10 text-xs text-gray-300 space-y-2">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>To install on iPhone / iPad:</span>
              </p>
              <ol className="space-y-1.5 pl-4 list-decimal text-gray-400 text-[11px] leading-relaxed">
                <li>
                  Tap the <strong className="text-white">Share</strong> button{' '}
                  <Share className="w-3 h-3 inline text-sky-400 mx-0.5" /> in Safari menu.
                </li>
                <li>
                  Scroll down and tap{' '}
                  <strong className="text-white">Add to Home Screen</strong>{' '}
                  <PlusSquare className="w-3 h-3 inline text-emerald-400 mx-0.5" />.
                </li>
                <li>
                  Tap <strong className="text-white">Add</strong> in top right corner.
                </li>
              </ol>
            </div>
            <button
              type="button"
              onClick={dismissInstallPrompt}
              className="w-full py-2.5 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition-colors"
            >
              Got it, thanks!
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={promptInstall}
              disabled={!isInstallable}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-gray-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Install App on Device</span>
            </button>
            <button
              type="button"
              onClick={dismissInstallPrompt}
              className="w-full py-2 text-center text-xs text-gray-500 hover:text-gray-400 transition-colors cursor-pointer"
            >
              Maybe later
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
