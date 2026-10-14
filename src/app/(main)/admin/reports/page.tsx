'use client';

import React, { useEffect, useState } from 'react';
import {
  Award,
  Calendar,
  Users,
  AlertTriangle,
  Clock,
  ShieldCheck,
  TrendingUp,
  Download,
  Filter,
} from 'lucide-react';

export default function AdminReportsPage() {
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
    inactiveMembers?: Array<{
      uid: string;
      displayName: string;
      email: string;
      phone?: string;
      lastQualifyingVisitAt?: string;
      currentStreak: number;
    }>;
    recentAuditLogs?: Array<{
      id: string;
      action: string;
      actorEmail: string;
      targetType: string;
      targetId: string;
      timestamp: string;
      details: Record<string, unknown>;
    }>;
  }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch('/api/admin/reports');
        const rData = await res.json();
        if (rData.success) {
          setData(rData);
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

  const inactiveMembers = data.inactiveMembers || [];

  return (
    <div className="space-y-8 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Business Intelligence & Compliance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Operational Reports & Analytics</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Attendance velocity, loyalty ledger totals, and inactive member retention alerts
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold text-xs border border-white/10 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export Summary Report</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
        <div className="glass-card rounded-2xl p-5 space-y-1">
          <div className="text-xs text-gray-400">Total Issued Points</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">+{metrics.totalPointsIssued}</div>
          <div className="text-[11px] text-gray-500">Attendance + Milestones</div>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-1">
          <div className="text-xs text-gray-400">Total Redeemed Points</div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">-{metrics.totalPointsRedeemed}</div>
          <div className="text-[11px] text-gray-500">Product redemptions</div>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-1">
          <div className="text-xs text-gray-400">Net Active Members</div>
          <div className="text-2xl sm:text-3xl font-black text-white">{metrics.activeMembers}</div>
          <div className="text-[11px] text-emerald-400 font-semibold">Eligible for check-in</div>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-1">
          <div className="text-xs text-gray-400">Inactive (&gt; 30 Days)</div>
          <div className="text-2xl sm:text-3xl font-black text-red-400">{inactiveMembers.length}</div>
          <div className="text-[11px] text-gray-500">Streaks expired</div>
        </div>
      </div>

      {/* Inactive Members Retention Alert Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-bold text-white">Inactive Member Retention Watchlist</h3>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Members with no qualifying attendance for 30 consecutive days (streak resets to 1 upon return)
            </p>
          </div>
        </div>

        {inactiveMembers.length === 0 ? (
          <div className="p-8 text-center text-xs text-emerald-400">
            All registered members have attended within the 30-day inactivity window!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-950/60 text-gray-400 uppercase tracking-wider font-semibold border-b border-white/5">
                <tr>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Last Visit</th>
                  <th className="py-3 px-4">Streak Status</th>
                  <th className="py-3 px-4 text-right">Retention Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {inactiveMembers.map((m) => (
                  <tr key={m.uid} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">{m.displayName}</td>
                    <td className="py-3.5 px-4">
                      <div>{m.email}</div>
                      <div className="text-[11px] text-gray-500">{m.phone || 'No phone'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400">
                      {m.lastQualifyingVisitAt
                        ? new Date(m.lastQualifyingVisitAt).toLocaleDateString()
                        : 'Never attended'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                        Inactivity Window Expired
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={`mailto:${m.email}?subject=We%20miss%20you%20at%20FIT%20FIBER%20GYM!&body=Hi%20${encodeURIComponent(
                          m.displayName
                        )},%20it's%20been%20over%2030%20days%20since%20your%20last%20visit%20to%20FIT%20FIBER%20GYM.%20Come%20back%20today%20to%20restart%20your%20streak!`}
                        className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-emerald-400 border border-white/10 transition-colors inline-block"
                      >
                        Send Retention Email
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Comprehensive Audit Logs Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
        <div className="p-4 sm:p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Full Security & Administrative Audit Log</h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Chronological record of settings updates, membership edits, attendance corrections, and reward redemptions
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950/60 text-gray-400 uppercase tracking-wider font-semibold border-b border-white/5">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Admin Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Type</th>
                <th className="py-3 px-4">Target ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {(data.recentAuditLogs || []).map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-gray-400 font-mono whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">
                    {log.actorEmail}
                  </td>
                  <td className="py-3 px-4 capitalize whitespace-nowrap text-emerald-400">
                    {log.action.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-4 capitalize whitespace-nowrap">{log.targetType}</td>
                  <td className="py-3 px-4 font-mono text-[10px] text-gray-500 whitespace-nowrap">
                    {log.targetId}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
