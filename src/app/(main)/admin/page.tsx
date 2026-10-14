'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import {
  Users,
  CheckCircle2,
  Clock,
  QrCode,
  Award,
  Gift,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Calendar,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const { user } = useAuth();
  const [data, setData] = useState<{
    metrics?: {
      totalMembers: number;
      activeMembers: number;
      suspendedMembers: number;
      expiredMembers: number;
      todayQualifyingCount: number;
      openSessionsCount: number;
      totalPointsIssued: number;
      totalPointsRedeemed: number;
      pendingRedemptionsCount: number;
    };
    recentDaysTrend?: { date: string; visits: number }[];
    recentAuditLogs?: Array<{
      id: string;
      action: string;
      actorEmail: string;
      targetType: string;
      timestamp: string;
      details: Record<string, unknown>;
    }>;
  }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch('/api/admin/reports');
        const reportData = await res.json();
        if (reportData.success) {
          setData(reportData);
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, []);

  const metrics = data.metrics || {
    totalMembers: 4,
    activeMembers: 2,
    suspendedMembers: 1,
    expiredMembers: 0,
    todayQualifyingCount: 1,
    openSessionsCount: 0,
    totalPointsIssued: 60,
    totalPointsRedeemed: 150,
    pendingRedemptionsCount: 0,
  };

  return (
    <div className="space-y-8 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Administrative Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">FIT FIBER GYM Overview</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Phulwari Sharif, Patna • Server-side verification & audit controls
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/qr"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20"
          >
            <QrCode className="w-4 h-4" />
            <span>Wall QR Poster</span>
          </Link>
          <Link
            href="/admin/attendance"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold text-xs border border-white/10 transition-colors"
          >
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Live Attendance</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Total Members */}
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Total Members</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">{metrics.totalMembers}</div>
          <div className="text-[11px] text-emerald-400 font-semibold">
            {metrics.activeMembers} active memberships
          </div>
        </div>

        {/* Metric 2: Today's Qualifying Visits */}
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Today&apos;s Attendance</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">{metrics.todayQualifyingCount}</div>
          <div className="text-[11px] text-gray-400">
            {metrics.openSessionsCount} active inside gym
          </div>
        </div>

        {/* Metric 3: Points Issued */}
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Points Issued</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white">{metrics.totalPointsIssued}</div>
          <div className="text-[11px] text-gray-400">
            {metrics.totalPointsRedeemed} pts redeemed
          </div>
        </div>

        {/* Metric 4: Pending Redemptions */}
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Pending Claims</span>
            <Gift className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-black text-white">{metrics.pendingRedemptionsCount}</div>
          <div className="text-[11px] text-amber-400 font-semibold">
            {metrics.pendingRedemptionsCount > 0 ? 'Awaiting staff handover' : 'All claims fulfilled'}
          </div>
        </div>
      </div>

      {/* Middle Section: Quick Nav Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/members"
          className="glass-card glass-card-hover rounded-2xl p-6 space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white flex items-center justify-between">
            <span>Manage Members</span>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-400 transition-colors" />
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Search members, activate/suspend memberships, configure expiry dates, and view streaks.
          </p>
        </Link>

        <Link
          href="/admin/qr"
          className="glass-card glass-card-hover rounded-2xl p-6 space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <QrCode className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white flex items-center justify-between">
            <span>Permanent Wall QR Code</span>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-amber-400 transition-colors" />
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Download print-ready wall poster layout for Alam Market gym walls. Static and forever stable.
          </p>
        </Link>

        <Link
          href="/admin/loyalty-settings"
          className="glass-card glass-card-hover rounded-2xl p-6 space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white flex items-center justify-between">
            <span>Rules & GPS Radius</span>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-sky-400 transition-colors" />
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Configure 30-day inactivity streak window, 75m GPS radius, daily points, and milestone bonuses.
          </p>
        </Link>
      </div>

      {/* Attendance Trend Chart Preview & Recent Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Bar */}
        <div className="lg:col-span-6 glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>7-Day Attendance Trend</span>
            </div>
            <span className="text-xs text-gray-400">Patna Timezone</span>
          </div>

          <div className="pt-4 flex items-end justify-between gap-3 h-40 border-b border-white/5 pb-2">
            {(data.recentDaysTrend || []).map((day) => {
              const heightPercent = Math.max(12, Math.min(100, day.visits * 40));
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="text-[10px] font-bold text-emerald-400">{day.visits}</div>
                  <div
                    className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all duration-500"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <div className="text-[9px] text-gray-500 font-mono">{day.date.split('-').slice(1).join('/')}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit Log Activity */}
        <div className="lg:col-span-6 glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Administrative Audit Trail</span>
            </div>
            <span className="text-xs text-gray-400">Immutable Records</span>
          </div>

          <div className="space-y-3">
            {(data.recentAuditLogs || []).slice(0, 4).map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-gray-900/60 border border-white/5 text-xs space-y-0.5">
                <div className="flex items-center justify-between font-semibold text-white">
                  <span className="capitalize">{log.action.replace('_', ' ')}</span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-[11px] text-gray-400">
                  By {log.actorEmail} on target {log.targetType}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
