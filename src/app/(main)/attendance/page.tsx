'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import AttendanceCalendar from '@/components/attendance/AttendanceCalendar';
import AttendanceHistoryTable from '@/components/attendance/AttendanceHistoryTable';
import { Calendar, History, QrCode } from 'lucide-react';
import Link from 'next/link';
import { AttendanceSession } from '@/lib/types';

export default function AttendancePage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/attendance/history?memberId=${user.uid}&limit=100`);
        const data = await res.json();
        if (data.success) {
          setSessions(data.history || []);
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-white">Please sign in to view your attendance</h2>
        <Link
          href="/login"
          className="inline-block px-5 py-2.5 rounded-xl bg-emerald-500 text-gray-950 font-bold text-xs"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            <span>Attendance Log & Calendar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Attendance History</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            FIT FIBER GYM, Phulwari Sharif, Patna • Asia/Kolkata Timezone
          </p>
        </div>

        <Link
          href="/check-in/fit-fiber-gym"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20"
        >
          <QrCode className="w-4 h-4" />
          <span>Wall Check-In Screen</span>
        </Link>
      </div>

      {/* Monthly Attendance Calendar */}
      <AttendanceCalendar sessions={sessions} timezone="Asia/Kolkata" />

      {/* Full Attendance History Table */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <History className="w-4 h-4 text-emerald-400" />
          <span>Detailed Attendance Records & Location Audit</span>
        </div>
        <AttendanceHistoryTable sessions={sessions} />
      </div>
    </div>
  );
}
