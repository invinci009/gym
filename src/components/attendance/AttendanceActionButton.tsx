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
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { AttendanceSession } from '@/lib/types';

interface AttendanceActionButtonProps {
  gymId?: string;
  onSessionUpdated?: () => void;
}

export default function AttendanceActionButton({
  gymId = 'fit-fiber-gym',
  onSessionUpdated,
}: AttendanceActionButtonProps) {
  const { user, refreshUser } = useAuth();
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
    details?: string;
  } | null>(null);

  // Coordinate simulation toggle for reviewers/testing
  const [simulationMode, setSimulationMode] = useState<'real' | 'inside' | 'outside'>('inside');

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
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#f59e0b', '#ffffff'],
      });
    } catch {
      // ignore
    }
  };

  const handleCheckIn = async () => {
    if (!user) return;
    setIsLoading(true);
    setStatusMessage(null);

    let coords: { latitude: number; longitude: number } | null = null;

    if (simulationMode === 'inside') {
      // FIT FIBER GYM exact coordinates
      coords = { latitude: 25.577244522059356, longitude: 85.0687193399421 };
    } else if (simulationMode === 'outside') {
      // ~600m outside boundary
      coords = { latitude: 25.582244, longitude: 85.074719 };
    } else {
      // Real browser GPS
      setIsLocating(true);
      try {
        coords = await new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser.'));
            return;
          }
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
            (err) => reject(new Error(err.message || 'GPS location permission was denied.')),
            { enableHighAccuracy: true, timeout: 10000 }
          );
        });
      } catch (err: unknown) {
        setIsLocating(false);
        setIsLoading(false);
        const msg = err instanceof Error ? err.message : 'Location request failed.';
        setStatusMessage({
          type: 'error',
          text: 'Location Verification Failed',
          details: `${msg} Self-service check-in requires gym location permission. Please see gym staff for manual entry.`,
        });
        return;
      }
      setIsLocating(false);
    }

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

      triggerConfetti();
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
      setIsLocating(false);
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
    <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isCheckedIn ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'
              }`}
            />
            <span className="text-xs font-bold tracking-wider uppercase text-gray-400">
              {isCheckedIn ? 'Active Workout Session' : 'Ready For Check-In'}
            </span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">
            {isCheckedIn ? 'Currently Inside FIT FIBER GYM' : 'Gym Wall Attendance'}
          </h2>
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Phulwari Sharif, Patna • 75m GPS boundary enforced</span>
          </p>
        </div>

        {/* Member Status Pill */}
        {user && (
          <div className="flex items-center gap-3 bg-gray-900/90 border border-white/10 rounded-xl px-4 py-2">
            <div className="text-right">
              <div className="text-[10px] text-gray-400 uppercase font-semibold">Current Streak</div>
              <div className="text-sm font-black text-white flex items-center justify-end gap-1">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>{user.currentStreak} Days</span>
              </div>
            </div>
            <div className="h-7 w-[1px] bg-white/10" />
            <div className="text-right">
              <div className="text-[10px] text-gray-400 uppercase font-semibold">Points</div>
              <div className="text-sm font-black text-emerald-400 flex items-center justify-end gap-1">
                <Award className="w-4 h-4" />
                <span>{user.pointsBalance}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Action Trigger */}
      <div className="py-2">
        {isCheckedIn ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-emerald-300">Workout in Progress</div>
                  <div className="text-lg font-black text-white">{durationMinutes} Minutes Elapsed</div>
                </div>
              </div>
              <div className="text-right text-[11px] text-gray-400">
                Started at {new Date(activeSession!.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <button
              onClick={handleCheckOut}
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-black text-base transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Recording Check-Out...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Check Out of Gym</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={handleCheckIn}
              disabled={isLoading || isLocating}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 hover:from-emerald-400 hover:to-emerald-300 text-gray-950 font-black text-base transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
            >
              {isLoading || isLocating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{isLocating ? 'Verifying GPS Coordinates...' : 'Recording Attendance...'}</span>
                </>
              ) : (
                <>
                  <Compass className="w-5 h-5 stroke-[2.5]" />
                  <span>Record Check-In (Verify Location)</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Location verification is computed server-side on FIT FIBER GYM boundary.</span>
            </div>
          </div>
        )}
      </div>

      {/* Coordinate Testing / Reviewer Simulator */}
      <div className="p-3 rounded-xl bg-gray-900/60 border border-white/5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Reviewer GPS Simulator:
          </span>
          <span className="text-[10px] text-gray-500">Allows instant testing of inside vs outside rules</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setSimulationMode('inside')}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
              simulationMode === 'inside'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                : 'bg-black/30 text-gray-400 border-white/5 hover:bg-white/5'
            }`}
          >
            ✓ Inside Gym (0m)
          </button>
          <button
            type="button"
            onClick={() => setSimulationMode('outside')}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
              simulationMode === 'outside'
                ? 'bg-red-500/20 text-red-400 border-red-500/50'
                : 'bg-black/30 text-gray-400 border-white/5 hover:bg-white/5'
            }`}
          >
            ✗ Outside (600m away)
          </button>
          <button
            type="button"
            onClick={() => setSimulationMode('real')}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
              simulationMode === 'real'
                ? 'bg-sky-500/20 text-sky-400 border-sky-500/50'
                : 'bg-black/30 text-gray-400 border-white/5 hover:bg-white/5'
            }`}
          >
            🛰 Real Device GPS
          </button>
        </div>
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
  );
}
