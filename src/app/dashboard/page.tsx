'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import StreakFlameCard from '@/components/dashboard/StreakFlameCard';
import AttendanceActionButton from '@/components/attendance/AttendanceActionButton';
import {
  Award,
  Calendar,
  Gift,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  QrCode,
} from 'lucide-react';
import { AttendanceSession, Reward } from '@/lib/types';

export default function MemberDashboardPage() {
  const { user, refreshUser } = useAuth();
  const [recentSessions, setRecentSessions] = useState<AttendanceSession[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      const [historyRes, rewardsRes] = await Promise.all([
        fetch(`/api/attendance/history?memberId=${user.uid}&limit=5`),
        fetch(`/api/rewards?gymId=fit-fiber-gym&memberId=${user.uid}`),
      ]);
      const historyData = await historyRes.json();
      const rewardsData = await rewardsRes.json();

      if (historyData.success) {
        setRecentSessions(historyData.history || []);
      }
      if (rewardsData.success) {
        setRewards(rewardsData.rewards?.slice(0, 3) || []);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-white">Please sign in to view your dashboard</h2>
        <Link
          href="/login"
          className="inline-block px-5 py-2.5 rounded-xl bg-emerald-500 text-gray-950 font-bold text-xs"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-2">
      {/* Top Greeting Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Member Portal</span>
            <span className="text-gray-600">•</span>
            <span className="text-xs text-gray-400">FIT FIBER GYM</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Welcome back, {user.displayName}!
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Phulwari Sharif, Patna • Member ID: <span className="font-mono text-gray-300">{user.uid}</span>
          </p>
        </div>

        {/* Membership Status Badge */}
        <div className="flex items-center gap-3 bg-gray-900/80 border border-white/10 rounded-2xl px-4 py-3">
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Membership Status</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  user.membershipStatus === 'active'
                    ? 'bg-emerald-400'
                    : user.membershipStatus === 'suspended'
                    ? 'bg-red-400'
                    : 'bg-amber-400'
                }`}
              />
              <span className="text-xs font-bold text-white capitalize">{user.membershipStatus}</span>
            </div>
          </div>
          <div className="h-7 w-[1px] bg-white/10" />
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Expires</div>
            <div className="text-xs font-bold text-gray-300 mt-0.5">
              {user.membershipExpiresAt ? new Date(user.membershipExpiresAt).toLocaleDateString() : 'Active Member'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Streak Engine & Live Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Streak Flame & 30-Day Window */}
        <div className="lg:col-span-5 space-y-6">
          <StreakFlameCard member={user} />

          {/* Points Wallet Card */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <Award className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Points Wallet</span>
                  <span className="text-[10px] text-gray-400 block">Authoritative Ledger</span>
                </div>
              </div>
              <Link
                href="/rewards"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <span>Catalogue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <div className="text-4xl font-black text-white">{user.pointsBalance}</div>
                <div className="text-xs text-gray-400">Available Loyalty Points</div>
              </div>
              <div className="text-right text-xs">
                <span className="text-emerald-400 font-bold">+10 pts</span>
                <span className="text-gray-500 block text-[10px]">Per daily visit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Attendance Action & Recent Visits */}
        <div className="lg:col-span-7 space-y-6">
          {/* Prominent Attendance Trigger */}
          <AttendanceActionButton
            gymId="fit-fiber-gym"
            onSessionUpdated={() => {
              fetchDashboardData();
              refreshUser();
            }}
          />

          {/* Recent Attendance Preview */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Recent Attendance Sessions</h3>
              </div>
              <Link
                href="/attendance"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <span>View Full Calendar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentSessions.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                No attendance sessions recorded yet. Scan the wall QR code to record your first visit!
              </div>
            ) : (
              <div className="divide-y divide-white/5 space-y-2">
                {recentSessions.map((session) => (
                  <div key={session.id} className="pt-2 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">{session.localDate}</div>
                      <div className="text-[11px] text-gray-400 flex items-center gap-2 mt-0.5">
                        <span className="font-mono">
                          {new Date(session.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {session.checkOutAt && (
                          <>
                            <span>→</span>
                            <span className="font-mono">
                              {new Date(session.checkOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {session.pointsAwarded > 0 ? (
                        <span className="text-emerald-400 font-bold">+{session.pointsAwarded} pts</span>
                      ) : (
                        <span className="text-gray-500 text-[10px]">Repeat visit</span>
                      )}
                      <div className="text-[10px] text-gray-400 capitalize">{session.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rewards Catalog Preview */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-emerald-400" />
              <span>Available Loyalty Rewards</span>
            </h3>
            <p className="text-xs text-gray-400">Redeem your accumulated points for gym gear and perks</p>
          </div>
          <Link
            href="/rewards"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>See All Rewards</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {rewards.map((reward) => (
            <div key={reward.id} className="glass-card rounded-2xl p-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gray-800 overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={reward.imageUrl} alt={reward.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">{reward.name}</div>
                <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">{reward.pointsCost} Points</div>
                <div className="text-[10px] text-gray-500 capitalize">{reward.category}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
