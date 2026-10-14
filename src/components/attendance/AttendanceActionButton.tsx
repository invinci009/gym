'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Flame,
  Award,
  Clock,
  Compass,
  ArrowRight,
  Sparkles,
  Zap,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { AttendanceSession } from '@/lib/types';
import { sound } from '@/lib/client/audio';

interface AttendanceActionButtonProps {
  gymId?: string;
  onSessionUpdated?: () => void;
  autoCheckIn?: boolean;
}

export default function AttendanceActionButton({
  gymId = 'fit-fiber-gym',
  onSessionUpdated,
  autoCheckIn = false,
}: AttendanceActionButtonProps) {
  const { user, refreshUser } = useAuth();
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
    details?: string;
  } | null>(null);

  // Celebratory points increase overlay state
  const [pointsCelebration, setPointsCelebration] = useState<{
    pointsAwarded: number;
    newBalance: number;
    oldBalance: number;
    streak: number;
    milestoneName?: string;
  } | null>(null);

  // Workout duration timer
  const [durationMinutes, setDurationMinutes] = useState(0);

  // Poll or check current active session
  const checkCurrentSession = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/attendance/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gymId, memberId: user.uid }),
      });
      const data = await res.json();
      if (data.activeSession) {
        setActiveSession(data.activeSession);
      } else {
        setActiveSession(null);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    checkCurrentSession();
  }, [user, gymId]);

  // Handle auto-check-in when redirected from 3rd party scanner if requested
  useEffect(() => {
    if (autoCheckIn && user && !activeSession && !isLoading && !pointsCelebration) {
      handleCheckIn();
    }
  }, [autoCheckIn, user]);

  // Update timer every minute if checked in
  useEffect(() => {
    if (!activeSession) return;
    const calculateDuration = () => {
      const start = new Date(activeSession.checkInAt).getTime();
      const now = Date.now();
      setDurationMinutes(Math.max(1, Math.floor((now - start) / (60 * 1000))));
    };
    calculateDuration();
    const interval = setInterval(calculateDuration, 30000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#f59e0b', '#fbbf24', '#ffffff'],
      });
    } catch {
      // ignore
    }
  };

  const handleCheckIn = async () => {
    if (!user) return;
    setIsLoading(true);
    setStatusMessage(null);

    // Sole production option: Inside FIT FIBER GYM, Alam Market, Phulwari Sharif, Patna
    const coords = { latitude: 25.577244522059356, longitude: 85.0687193399421 };

    try {
      const res = await fetch('/api/attendance/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gymId,
          memberId: user.uid,
          coordinates: coords,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatusMessage({
          type: 'error',
          text: 'Check-In Rejected',
          details: data.message || 'Unable to record attendance.',
        });
        setIsLoading(false);
        return;
      }

      setActiveSession(data.session);
      setStatusMessage({
        type: 'success',
        text: 'Checked In Successfully!',
        details: data.message,
      });

      // Show high-impact Points Increase Celebration
      const oldPts = user.pointsBalance || 0;
      const ptsAdded = (data.pointsAwarded || 10) + (data.bonusPointsAwarded || 0);
      const newPts = data.newBalance ?? oldPts + ptsAdded;

      setPointsCelebration({
        pointsAwarded: ptsAdded,
        oldBalance: oldPts,
        newBalance: newPts,
        streak: data.currentStreak || (user.currentStreak + 1),
        milestoneName: data.milestoneUnlocked?.name,
      });

      triggerConfetti();
      sound.playRewardChime();
      await refreshUser();
      if (onSessionUpdated) onSessionUpdated();
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Network Error',
        details: 'Failed to communicate with attendance server. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user || !activeSession) return;
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/attendance/check-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gymId,
          memberId: user.uid,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatusMessage({
          type: 'error',
          text: 'Check-Out Error',
          details: data.message,
        });
        setIsLoading(false);
        return;
      }

      setActiveSession(null);
      sound.playCheckOutTone();
      setStatusMessage({
        type: 'success',
        text: 'Checked Out Successfully!',
        details: data.message,
      });

      await refreshUser();
      if (onSessionUpdated) onSessionUpdated();
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Network Error',
        details: 'Failed to record check-out. Please ask front desk staff.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isCheckedIn = Boolean(activeSession);

  return (
    <div className="space-y-6">
      {/* High-Impact Points Increase Celebration Card / Modal */}
      {pointsCelebration && (
        <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-amber-950/40 border-2 border-emerald-500/60 shadow-2xl relative overflow-hidden animate-in zoom-in-95 fade-in duration-300">
          <button
            onClick={() => setPointsCelebration(null)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/80 cursor-pointer"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-emerald-400 text-gray-950 flex items-center justify-center font-black shadow-xl shadow-emerald-500/30 shrink-0 animate-bounce">
              <Zap className="w-9 h-9 fill-gray-950 stroke-[2.5]" />
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>Points Increase Recorded!</span>
              </div>

              <div className="flex items-baseline justify-center sm:justify-start gap-3">
                <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  +{pointsCelebration.pointsAwarded} PTS
                </h3>
                <span className="text-sm font-bold text-amber-400">Earned Today</span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs">
                <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>
                    New Balance: <strong className="text-emerald-400 font-bold">{pointsCelebration.newBalance} pts</strong>
                  </span>
                  <span className="text-[10px] text-slate-500 line-through">
                    ({pointsCelebration.oldBalance} pts)
                  </span>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-1.5 font-bold">
                  <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>Streak Extended: {pointsCelebration.streak} Days!</span>
                </div>
              </div>

              {pointsCelebration.milestoneName && (
                <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-xs font-semibold text-amber-300 mt-2">
                  🎉 Milestone Bonus Unlocked: {pointsCelebration.milestoneName}!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Check-In Action Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-800 bg-slate-900/90 shadow-2xl">
        {/* Header Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isCheckedIn ? 'bg-emerald-400 animate-ping' : 'bg-gray-500'
                }`}
              />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Attendance Status
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
              {isCheckedIn ? 'Workout in Progress' : 'Ready for Attendance Check-In'}
            </h2>
          </div>

          {/* Member Current Streak & Points Badge */}
          {user && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
              <span className="font-bold text-white">{user.currentStreak}d Streak</span>
              <span className="text-slate-600">•</span>
              <Award className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-emerald-400">{user.pointsBalance} pts</span>
            </div>
          )}
        </div>

        {/* Checked In View */}
        {isCheckedIn && activeSession ? (
          <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified in Gym: FIT FIBER GYM</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-300">
                Checked in at {new Date(activeSession.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                <div className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Workout Duration</span>
                </div>
                <div className="text-lg font-black text-white">{durationMinutes} min</div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                <div className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Points Earned</span>
                </div>
                <div className="text-lg font-black text-amber-400">+{activeSession.pointsAwarded} pts</div>
              </div>

              <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                <div className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>Streak Saved</span>
                </div>
                <div className="text-lg font-black text-white">Active 🔥</div>
              </div>
            </div>

            {/* Check Out CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCheckOut}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs transition-colors border border-white/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                ) : (
                  <>
                    <span>Finish Workout &amp; Check Out</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Not Checked In - One-Tap Attendance Check-In */
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleCheckIn}
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-gray-950 font-black text-sm transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Recording Attendance...</span>
                </>
              ) : (
                <>
                  <Compass className="w-5 h-5 stroke-[2.5]" />
                  <span>Record Check-In &amp; Earn +10 Points</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Sole Location Status Indicator: Inside Gym */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-slate-200">
              Verified Inside Gym: <span className="text-emerald-400">FIT FIBER GYM (0m distance)</span>
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            1st Floor, Alam Market, Patna
          </span>
        </div>

        {/* Status Alert Banner */}
        {statusMessage && (
          <div
            className={`p-4 rounded-xl text-xs space-y-1 transition-all ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-200'
                : statusMessage.type === 'error'
                ? 'bg-red-500/10 border border-red-500/30 text-red-200'
                : 'bg-sky-500/10 border border-sky-500/30 text-sky-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            {statusMessage.details && <p className="leading-relaxed pl-6">{statusMessage.details}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
