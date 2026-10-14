'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Flame,
  Award,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Edit,
  X,
  Loader2,
  Download,
} from 'lucide-react';
import { GymMember, MembershipStatus } from '@/lib/types';
import { useAuth } from '@/lib/auth/context';

export default function AdminMembersPage() {
  const { user: currentAdmin } = useAuth();
  const [members, setMembers] = useState<GymMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<GymMember | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);

  // Form states
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newExpiry, setNewExpiry] = useState('');

  // Status edit states
  const [editStatus, setEditStatus] = useState<MembershipStatus>('active');
  const [editReason, setEditReason] = useState('');
  const [editExpiryDate, setEditExpiryDate] = useState('');

  // Points adjustment states
  const [pointsDelta, setPointsDelta] = useState('50');
  const [pointsReason, setPointsReason] = useState('');

  const [actionLoading, setActionLoading] = useState(false);

  const fetchMembers = async () => {
    try {
      const query = new URLSearchParams();
      if (searchTerm) query.set('search', searchTerm);
      if (statusFilter !== 'all') query.set('status', statusFilter);

      const res = await fetch(`/api/admin/members?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setMembers(data.members || []);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [searchTerm, statusFilter]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDisplayName || !newEmail) return;
    setActionLoading(true);

    try {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: newDisplayName,
          email: newEmail,
          phone: newPhone,
          membershipExpiresAt: newExpiry ? new Date(newExpiry).toISOString() : undefined,
          adminId: currentAdmin?.uid,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        setNewDisplayName('');
        setNewEmail('');
        setNewPhone('');
        fetchMembers();
      } else {
        alert(data.message || 'Failed to add member');
      }
    } catch {
      alert('Error creating member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !editReason) return;
    setActionLoading(true);

    try {
      const res = await fetch('/api/admin/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: selectedMember.uid,
          status: editStatus,
          membershipExpiresAt: editExpiryDate ? new Date(editExpiryDate).toISOString() : selectedMember.membershipExpiresAt,
          reason: editReason,
          adminId: currentAdmin?.uid,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsEditModalOpen(false);
        setSelectedMember(null);
        setEditReason('');
        fetchMembers();
      } else {
        alert(data.message || 'Update failed');
      }
    } catch {
      alert('Error modifying status');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (m: GymMember) => {
    setSelectedMember(m);
    setEditStatus(m.membershipStatus);
    setEditExpiryDate(m.membershipExpiresAt ? m.membershipExpiresAt.split('T')[0] : '');
    setEditReason('');
    setIsEditModalOpen(true);
  };

  const openPointsModal = (m: GymMember) => {
    setSelectedMember(m);
    setPointsDelta('50');
    setPointsReason('');
    setIsPointsModalOpen(true);
  };

  const handleAdjustPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !pointsReason || !pointsDelta) return;
    setActionLoading(true);

    try {
      const res = await fetch('/api/admin/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: selectedMember.uid,
          pointsDelta: Number(pointsDelta),
          reason: pointsReason,
          adminId: currentAdmin?.uid,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsPointsModalOpen(false);
        setSelectedMember(null);
        setPointsReason('');
        fetchMembers();
      } else {
        alert(data.message || 'Points adjustment failed');
      }
    } catch {
      alert('Error adjusting points');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (members.length === 0) return;
    const headers = ['UID', 'Name', 'Email', 'Phone', 'Status', 'Current Streak', 'Longest Streak', 'Points', 'Expires At', 'Joined At'];
    const rows = members.map((m) => [
      m.uid,
      `"${m.displayName.replace(/"/g, '""')}"`,
      m.email,
      m.phone || '',
      m.membershipStatus,
      m.currentStreak,
      m.longestStreak,
      m.pointsBalance,
      m.membershipExpiresAt || 'Lifetime',
      m.createdAt,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fit-fiber-gym-members-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Member Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Gym Members Directory</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage member statuses, expiry dates, streaks, and attendance records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-xs border border-white/10 transition-colors cursor-pointer"
            title="Download CSV spreadsheet"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full bg-gray-900 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Members ({members.length})</option>
            <option value="active">Active Memberships</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950/60 text-gray-400 uppercase tracking-wider font-semibold border-b border-white/5">
              <tr>
                <th className="py-3.5 px-4">Member Name</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Current Streak</th>
                <th className="py-3.5 px-4">Longest Streak</th>
                <th className="py-3.5 px-4">Points</th>
                <th className="py-3.5 px-4">Expires</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {members.map((member) => (
                <tr key={member.uid} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white">{member.displayName}</div>
                    <div className="text-[10px] text-gray-500 font-mono">{member.uid}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div>{member.email}</div>
                    <div className="text-[11px] text-gray-500">{member.phone || 'No phone'}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                        member.membershipStatus === 'active'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : member.membershipStatus === 'suspended'
                          ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {member.membershipStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="flex items-center gap-1 font-bold text-white">
                      <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>{member.currentStreak} Days</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-medium text-gray-300">
                    {member.longestStreak} Days
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-bold text-emerald-400">
                    {member.pointsBalance} pts
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-gray-400">
                    {member.membershipExpiresAt
                      ? new Date(member.membershipExpiresAt).toLocaleDateString()
                      : 'Lifetime'}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      <button
                        onClick={() => openPointsModal(member)}
                        className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-amber-400 border border-white/10 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title="Add bonus points or deduct points"
                      >
                        <Award className="w-3 h-3 text-amber-400" />
                        <span>Points</span>
                      </button>
                      <button
                        onClick={() => openEditModal(member)}
                        className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-emerald-400 border border-white/10 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title="Modify status and membership expiry"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Status</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Add New Member */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-6 sm:p-7 max-w-md w-full space-y-4 border border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Register Gym Member</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="e.g. Ankit Verma"
                  className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="ankit@example.com"
                  className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={newExpiry}
                  onChange={(e) => setNewExpiry(e.target.value)}
                  className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-xs font-semibold text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-gray-950 text-xs font-bold hover:bg-emerald-400"
                >
                  {actionLoading ? 'Creating...' : 'Create Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Status & Audit Log */}
      {isEditModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-6 sm:p-7 max-w-md w-full space-y-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Modify Membership</h3>
                <p className="text-xs text-gray-400">{selectedMember.displayName}</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Membership Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as MembershipStatus)}
                  className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="active">Active (Permits Attendance)</option>
                  <option value="suspended">Suspended (Rejects Check-In)</option>
                  <option value="expired">Expired (Rejects Check-In)</option>
                  <option value="pending">Pending Approval</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Membership Expiry Date</label>
                <input
                  type="date"
                  value={editExpiryDate}
                  onChange={(e) => setEditExpiryDate(e.target.value)}
                  className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-400 mb-1">
                  Administrative Reason (Required for Audit Log) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="e.g. Paid 3-month renewal fee at counter / Temporary medical freeze"
                  className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-xs font-semibold text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !editReason}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-gray-950 text-xs font-bold hover:bg-emerald-400 disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Save & Log Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Adjust Points & Audit Log */}
      {isPointsModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-6 sm:p-7 max-w-md w-full space-y-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Adjust Loyalty Points</h3>
                <p className="text-xs text-gray-400">
                  {selectedMember.displayName} • Current: <span className="text-emerald-400 font-bold">{selectedMember.pointsBalance} pts</span>
                </p>
              </div>
              <button
                onClick={() => setIsPointsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustPoints} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Points Adjustment (+ to grant bonus, - to deduct)
                </label>
                <input
                  type="number"
                  required
                  value={pointsDelta}
                  onChange={(e) => setPointsDelta(e.target.value)}
                  placeholder="e.g. 50 or -20"
                  className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  New Balance will be:{' '}
                  <strong className="text-white">
                    {Math.max(0, selectedMember.pointsBalance + (Number(pointsDelta) || 0))} pts
                  </strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-400 mb-1">
                  Administrative Reason (Required for Immutable Ledger) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={pointsReason}
                  onChange={(e) => setPointsReason(e.target.value)}
                  placeholder="e.g. Referral reward for onboarding family member / Challenge winner bonus"
                  className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPointsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-xs font-semibold text-gray-300 hover:bg-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !pointsReason || !pointsDelta}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-gray-950 text-xs font-bold hover:bg-emerald-400 disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? 'Saving...' : 'Apply Points & Log Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
