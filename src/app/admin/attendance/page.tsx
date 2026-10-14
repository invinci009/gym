'use client';

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Filter,
  ShieldCheck,
  Edit,
  X,
  MapPin,
  RefreshCw,
  Download,
  UserCheck,
  Search,
} from 'lucide-react';
import { AttendanceSession, GymMember } from '@/lib/types';
import { useAuth } from '@/lib/auth/context';

export default function AdminAttendancePage() {
  const { user: currentAdmin } = useAuth();
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [members, setMembers] = useState<GymMember[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Correction Modal State
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<'completed' | 'corrected'>('completed');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manual Staff Check-In Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualMemberId, setManualMemberId] = useState('');
  const [manualReason, setManualReason] = useState('');
  const [manualLoading, setManualLoading] = useState(false);

  const fetchAttendance = async () => {
    try {
      const query = new URLSearchParams();
      if (statusFilter !== 'all') query.set('status', statusFilter);
      if (dateFilter) query.set('date', dateFilter);

      const res = await fetch(`/api/admin/attendance?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setSessions(data.attendance || []);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [statusFilter, dateFilter]);

  useEffect(() => {
    fetch('/api/admin/members')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setMembers(d.members || []);
      })
      .catch(() => {});
  }, []);

  const handleManualCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualMemberId || !manualReason) return;
    setManualLoading(true);

    try {
      const res = await fetch('/api/admin/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: manualMemberId,
          reason: manualReason,
          adminId: currentAdmin?.uid || 'admin',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsManualModalOpen(false);
        setManualMemberId('');
        setManualReason('');
        fetchAttendance();
      } else {
        alert(data.message || 'Manual check-in failed');
      }
    } catch {
      alert('Network error recording manual attendance');
    } finally {
      setManualLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (sessions.length === 0) return;
    const headers = [
      'Session ID',
      'Member Name',
      'Member Email',
      'Check-in At',
      'Check-out At',
      'Local Date',
      'Status',
      'Points Awarded',
      'Location Verified',
      'Distance (m)',
      'Correction Note',
    ];
    const rows = sessions.map((s) => [
      s.id,
      `"${(s.memberName || '').replace(/"/g, '""')}"`,
      s.memberEmail || '',
      s.checkInAt,
      s.checkOutAt || '',
      s.localDate,
      s.status,
      s.pointsAwarded,
      s.locationVerified ? 'YES' : 'NO',
      s.reportedDistanceMeters?.toFixed(1) || '0',
      `"${(s.correctionReason || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fit-fiber-gym-attendance-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const handleCorrectSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession || !reason) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/attendance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedSession.id,
          status: newStatus,
          reason,
          adminId: currentAdmin?.uid || 'admin',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setSelectedSession(null);
        setReason('');
        fetchAttendance();
      } else {
        alert(data.message || 'Correction failed');
      }
    } catch {
      alert('Error during attendance correction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCorrectionModal = (session: AttendanceSession) => {
    setSelectedSession(session);
    setNewStatus(session.status === 'checked_in' ? 'completed' : 'corrected');
    setReason('');
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>Attendance Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Live Attendance &amp; Session Monitor</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Monitor real-time gym check-ins, location verifications, and perform audited corrections
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 border border-white/10 transition-colors cursor-pointer"
            title="Download CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 text-xs font-bold transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Manual Staff Check-In</span>
          </button>
          <button
            onClick={fetchAttendance}
            className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Session States ({sessions.length})</option>
              <option value="checked_in">Currently Checked In</option>
              <option value="completed">Completed Normally</option>
              <option value="corrected">Admin Corrected</option>
            </select>
          </div>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
          />

          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-xs text-emerald-400 hover:underline"
            >
              Clear Date
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search member, email or ID..."
            className="bg-gray-900 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 w-60"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950/60 text-gray-400 uppercase tracking-wider font-semibold border-b border-white/5">
              <tr>
                <th className="py-3.5 px-4">Member</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Check-In</th>
                <th className="py-3.5 px-4">Check-Out</th>
                <th className="py-3.5 px-4">Points</th>
                <th className="py-3.5 px-4">GPS Check</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {sessions
                .filter((s) => {
                  if (!searchTerm) return true;
                  const q = searchTerm.toLowerCase();
                  return (
                    (s.memberName && s.memberName.toLowerCase().includes(q)) ||
                    (s.memberEmail && s.memberEmail.toLowerCase().includes(q)) ||
                    (s.memberId && s.memberId.toLowerCase().includes(q)) ||
                    (s.id && s.id.toLowerCase().includes(q))
                  );
                })
                .map((s) => (
                <tr key={s.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white">{s.memberName || s.memberId}</div>
                    <div className="text-[10px] text-gray-500 font-mono">{s.memberEmail || s.memberId}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-white whitespace-nowrap">{s.localDate}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                    {format(new Date(s.checkInAt), 'hh:mm a')}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                    {s.checkOutAt ? (
                      format(new Date(s.checkOutAt), 'hh:mm a')
                    ) : (
                      <span className="text-emerald-400 font-semibold animate-pulse">In Progress...</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {s.pointsAwarded > 0 ? (
                      <span className="text-emerald-400 font-bold">+{s.pointsAwarded} pts</span>
                    ) : (
                      <span className="text-gray-500">0 pts</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {s.locationVerified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        <span>Verified ({s.reportedDistanceMeters || 0}m)</span>
                      </span>
                    ) : (
                      <span className="text-gray-400">Manual / Staff</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        s.status === 'checked_in'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : s.status === 'completed'
                          ? 'bg-gray-800 text-gray-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {s.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => openCorrectionModal(s)}
                      className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-amber-300 border border-white/10 transition-colors inline-flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      <span>{s.status === 'checked_in' ? 'Check Out' : 'Correct'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Administrative Correction & Audit Trail */}
      {isModalOpen && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-6 sm:p-7 max-w-md w-full space-y-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Correct Attendance Session</h3>
                <p className="text-xs text-gray-400">
                  {selectedSession.memberName} • {selectedSession.localDate}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCorrectSession} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Set New Session Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as 'completed' | 'corrected')}
                  className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="completed">Completed (Close Active Session)</option>
                  <option value="corrected">Corrected (Adjustment with Reason)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-400 mb-1">
                  Correction Reason (Mandatory Audit Requirement) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Member forgot to scan QR when leaving gym / Phone battery died"
                  className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-gray-900 border border-white/5 text-[11px] text-gray-400">
                Logged under administrator identity: <strong className="text-white">{currentAdmin?.email || 'admin@fitfiber.com'}</strong>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-xs font-semibold text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !reason}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-gray-950 text-xs font-bold hover:bg-emerald-400 disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording...' : 'Save & Log Audit Trail'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Manual Staff Check-In Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-6 sm:p-7 max-w-md w-full space-y-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Manual Staff Check-In</h3>
                <p className="text-xs text-gray-400">Record attendance for a member with administrative reason</p>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualCheckIn} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Select Gym Member *
                </label>
                <select
                  required
                  value={manualMemberId}
                  onChange={(e) => setManualMemberId(e.target.value)}
                  className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Choose Member --</option>
                  {members.map((m) => (
                    <option key={m.uid} value={m.uid}>
                      {m.displayName} ({m.email}) — Streak: {m.currentStreak}d
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-400 mb-1">
                  Mandatory Administrative Reason *
                </label>
                <textarea
                  required
                  rows={3}
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  placeholder="e.g. Phone battery died / GPS permission disabled on device / Camera cracked"
                  className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-gray-900 border border-white/5 text-[11px] text-gray-400">
                Staff Actor: <strong className="text-white">{currentAdmin?.email || 'admin@fitfiber.com'}</strong>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-xs font-semibold text-gray-300 hover:bg-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={manualLoading || !manualMemberId || !manualReason}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-gray-950 text-xs font-bold hover:bg-emerald-400 disabled:opacity-50 cursor-pointer"
                >
                  {manualLoading ? 'Recording...' : 'Record Check-In & Update Streak'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
