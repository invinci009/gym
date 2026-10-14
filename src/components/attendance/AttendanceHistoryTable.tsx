'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Clock, CheckCircle2, ShieldCheck, AlertCircle, MapPin, Filter } from 'lucide-react';
import { AttendanceSession } from '@/lib/types';

interface AttendanceHistoryTableProps {
  sessions: AttendanceSession[];
}

export default function AttendanceHistoryTable({ sessions }: AttendanceHistoryTableProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredSessions = sessions.filter((s) => {
    if (filterStatus === 'all') return true;
    return s.status === filterStatus;
  });

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white">Attendance Log & Verification Audit</h3>
          <p className="text-xs text-gray-400">All session timestamps recorded server-side</p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Sessions ({sessions.length})</option>
            <option value="completed">Completed</option>
            <option value="checked_in">Currently Active</option>
            <option value="corrected">Admin Corrected</option>
          </select>
        </div>
      </div>

      {/* Table / List */}
      {filteredSessions.length === 0 ? (
        <div className="p-8 text-center text-gray-400 text-xs">
          No attendance records match the selected filter.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950/60 text-gray-400 uppercase tracking-wider font-semibold border-b border-white/5">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Check-In</th>
                <th className="py-3 px-4">Check-Out</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Points</th>
                <th className="py-3 px-4">Location Check</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {filteredSessions.map((session) => {
                const checkInDate = new Date(session.checkInAt);
                const checkOutDate = session.checkOutAt ? new Date(session.checkOutAt) : null;
                const durationMinutes = checkOutDate
                  ? Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (60 * 1000)))
                  : null;

                return (
                  <tr key={session.id} className="hover:bg-white/5 transition-colors">
                    {/* Date */}
                    <td className="py-3.5 px-4 font-semibold text-white whitespace-nowrap">
                      {session.localDate}
                    </td>

                    {/* Check In */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-gray-200">
                        {format(checkInDate, 'hh:mm a')}
                      </span>
                    </td>

                    {/* Check Out */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-gray-300">
                      {checkOutDate ? (
                        format(checkOutDate, 'hh:mm a')
                      ) : (
                        <span className="text-emerald-400 font-semibold animate-pulse">In Progress...</span>
                      )}
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {durationMinutes ? (
                        <span className="flex items-center gap-1 text-gray-200 font-medium">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{durationMinutes} min</span>
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>

                    {/* Points */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {session.pointsAwarded > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          +{session.pointsAwarded} pts
                        </span>
                      ) : (
                        <span className="text-gray-500 text-[11px]">0 (2nd visit)</span>
                      )}
                    </td>

                    {/* Location Verification */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {session.locationVerified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300">
                          <MapPin className="w-3 h-3 text-emerald-400" />
                          <span>Verified ({session.reportedDistanceMeters || 0}m)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-400">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Staff Override</span>
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {session.status === 'checked_in' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Active
                        </span>
                      )}
                      {session.status === 'completed' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-800 text-gray-300 border border-white/10">
                          Completed
                        </span>
                      )}
                      {session.status === 'corrected' && (
                        <div className="space-y-0.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Corrected
                          </span>
                          {session.correctionReason && (
                            <p className="text-[10px] text-gray-400 max-w-[150px] truncate" title={session.correctionReason}>
                              {session.correctionReason}
                            </p>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
