'use client';

import React from 'react';
import { Flame, Trophy, Calendar, Award, Zap, ShieldCheck } from 'lucide-react';
import { GymMember } from '@/lib/types';
import { DEFAULT_MILESTONES, evaluateStreakStatus } from '@/lib/engine/streak';

interface StreakFlameCardProps {
  member: GymMember;
}

export default function StreakFlameCard({ member }: StreakFlameCardProps) {
  const streakStatus = evaluateStreakStatus(
    member.currentStreak,
    member.lastQualifyingVisitAt,
    new Date(),
    30
  );

  // Find next milestone
  const nextMilestone = DEFAULT_MILESTONES.find((m) => m.days > member.currentStreak) || {
    days: 100,
    bonusPoints: 1000,
    label: 'Legendary 100 Days',
  };

  const prevMilestoneDays = DEFAULT_MILESTONES.filter((m) => m.days <= member.currentStreak).pop()?.days || 0;
  const progressPercent = Math.min(
    100,
    Math.round(((member.currentStreak - prevMilestoneDays) / (nextMilestone.days - prevMilestoneDays)) * 100)
  );

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-7 relative overflow-hidden space-y-6">
      {/* Background glow orb */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Flame className="w-4 h-4 fill-amber-400 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Streak Engine</span>
            <span className="text-[11px] text-gray-400 block">30-Day Inactivity Window Policy</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-gray-300">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Best: {member.longestStreak} Days</span>
        </div>
      </div>

      {/* Main Flame & Number */}
      <div className="flex flex-col sm:flex-row items-baseline gap-3">
        <div className="text-5xl sm:text-6xl font-black text-white tracking-tight flex items-baseline gap-2">
          <span>{member.currentStreak}</span>
          <span className="text-xl sm:text-2xl font-bold text-gray-400">Days</span>
        </div>
        <div className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
          Active Consecutive Attendance
        </div>
      </div>

      {/* 30-Day Window Status */}
      <div className="p-3.5 rounded-xl bg-gray-900/80 border border-white/10 space-y-1.5 text-xs">
        <div className="flex items-center justify-between text-gray-300">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Inactivity Expiry Window:</span>
          </span>
          <span className="font-bold text-white">
            {streakStatus.daysRemaining > 0 ? `${streakStatus.daysRemaining} days remaining` : 'At threshold'}
          </span>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Your streak stays alive as long as you visit FIT FIBER GYM at least once every 30 days. No penalty for
          scheduled rest days!
        </p>
      </div>

      {/* Next Milestone Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-300 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Next Milestone: <strong className="text-white font-bold">{nextMilestone.label}</strong> ({nextMilestone.days} days)
          </span>
          <span className="text-emerald-400 font-semibold">+{nextMilestone.bonusPoints} bonus pts</span>
        </div>
        <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden p-0.5 border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(5, progressPercent)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-500">
          <span>{member.currentStreak} days current</span>
          <span>{nextMilestone.days - member.currentStreak} days to unlock</span>
        </div>
      </div>

      {/* Quick stats footer */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
        <div>
          <div className="text-[10px] text-gray-400 uppercase font-semibold">Qualifying Days</div>
          <div className="text-base font-bold text-white flex items-center gap-1 mt-0.5">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>{member.totalQualifyingDays} Days</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] text-gray-400 uppercase font-semibold">Total Visits</div>
          <div className="text-base font-bold text-white flex items-center gap-1 mt-0.5">
            <Award className="w-4 h-4 text-amber-400" />
            <span>{member.totalVisits} Sessions</span>
          </div>
        </div>
      </div>
    </div>
  );
}
