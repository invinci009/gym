'use client';

import React, { useEffect, useState } from 'react';
import {
  Gift,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  X,
  Check,
  Loader2,
  Search,
  Filter,
} from 'lucide-react';
import { Reward, RewardRedemption } from '@/lib/types';
import { useAuth } from '@/lib/auth/context';

export default function AdminRewardsPage() {
  const { user: currentAdmin } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'claims' | 'rewards'>('claims');
  const [claimSearch, setClaimSearch] = useState('');
  const [claimStatusFilter, setClaimStatusFilter] = useState<'all' | 'pending' | 'fulfilled'>('all');

  // New reward form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'merch' | 'beverage' | 'training' | 'pass'>('merch');
  const [pointsCost, setPointsCost] = useState('200');
  const [stockLimit, setStockLimit] = useState('20');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRewards = async () => {
    try {
      const res = await fetch('/api/admin/rewards');
      const data = await res.json();
      if (data.success) {
        setRewards(data.rewards || []);
        setRedemptions(data.redemptions || []);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const handleCreateReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !pointsCost) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          category,
          pointsCost: Number(pointsCost),
          stockLimit: stockLimit ? Number(stockLimit) : undefined,
          imageUrl: imageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
          adminId: currentAdmin?.uid,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsCreateModalOpen(false);
        setName('');
        setDescription('');
        fetchRewards();
      } else {
        alert(data.message || 'Creation failed');
      }
    } catch {
      alert('Error creating reward');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFulfillRedemption = async (redemptionId: string) => {
    try {
      const res = await fetch('/api/admin/rewards', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'fulfill',
          redemptionId,
          notes: 'Handed over at front desk counter',
          adminId: currentAdmin?.uid,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchRewards();
      } else {
        alert(data.message || 'Fulfillment error');
      }
    } catch {
      alert('Error fulfilling claim');
    }
  };

  const pendingClaims = redemptions.filter((r) => r.status === 'pending');
  const fulfilledClaims = redemptions.filter((r) => r.status === 'fulfilled');

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <Gift className="w-4 h-4" />
            <span>Loyalty Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Rewards & Fulfillment Queue</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Process member reward redemptions and manage loyalty reward inventory
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Reward</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('claims')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'claims'
              ? 'bg-emerald-500 text-gray-950 shadow-md shadow-emerald-500/20'
              : 'bg-gray-900 text-gray-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Fulfillment Queue ({pendingClaims.length} pending)</span>
        </button>

        <button
          onClick={() => setActiveTab('rewards')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'rewards'
              ? 'bg-emerald-500 text-gray-950 shadow-md shadow-emerald-500/20'
              : 'bg-gray-900 text-gray-400 hover:text-white'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Manage Rewards Inventory ({rewards.length})</span>
        </button>
      </div>

      {/* Tab 1: Claims Queue */}
      {activeTab === 'claims' && (
        <div className="glass-card rounded-2xl overflow-hidden border border-white/10 space-y-4">
          <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">Member Redemption Claims</h3>
              <p className="text-xs text-gray-400">Verify member identity or voucher code before marking as fulfilled</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={claimSearch}
                  onChange={(e) => setClaimSearch(e.target.value)}
                  placeholder="Search member, reward or code..."
                  className="bg-gray-950 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 w-52"
                />
              </div>

              <div className="flex items-center gap-1 bg-gray-950 p-1 rounded-xl border border-white/10 text-xs">
                {(['all', 'pending', 'fulfilled'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setClaimStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-colors ${
                      claimStatusFilter === st
                        ? 'bg-emerald-500 text-gray-950 shadow-sm'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {(() => {
            const filtered = redemptions.filter((red) => {
              if (claimStatusFilter !== 'all' && red.status !== claimStatusFilter) return false;
              if (claimSearch) {
                const q = claimSearch.toLowerCase();
                const vCode = `FFG-${red.id.toUpperCase()}`.toLowerCase();
                return (
                  red.memberName.toLowerCase().includes(q) ||
                  red.memberEmail.toLowerCase().includes(q) ||
                  red.rewardName.toLowerCase().includes(q) ||
                  vCode.includes(q)
                );
              }
              return true;
            });

            if (filtered.length === 0) {
              return (
                <div className="p-8 text-center text-xs text-gray-400">
                  No redemptions matching filter.
                </div>
              );
            }

            return (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-950/60 text-gray-400 uppercase tracking-wider font-semibold border-b border-white/5">
                    <tr>
                      <th className="py-3 px-4">Claim Date</th>
                      <th className="py-3 px-4">Voucher Code</th>
                      <th className="py-3 px-4">Member</th>
                      <th className="py-3 px-4">Reward Item</th>
                      <th className="py-3 px-4">Points Spent</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Fulfillment Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {filtered.map((red) => (
                      <tr key={red.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap text-gray-400">
                          {new Date(red.createdAt).toLocaleDateString()}{' '}
                          {new Date(red.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-emerald-400">
                          FFG-{red.id.toUpperCase()}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-white">{red.memberName}</div>
                          <div className="text-[10px] text-gray-500">{red.memberEmail}</div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-white">{red.rewardName}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-bold text-amber-400">
                          -{red.pointsSpent} pts
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {red.status === 'fulfilled' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Fulfilled
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Pending Handover
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {red.status === 'pending' ? (
                            <button
                              onClick={() => handleFulfillRedemption(red.id)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs transition-colors inline-flex items-center gap-1 shadow-sm cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Mark Fulfilled</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-gray-500">Fulfilled by {red.fulfilledBy}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* Tab 2: Inventory List */}
      {activeTab === 'rewards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => (
            <div key={reward.id} className="glass-card rounded-2xl overflow-hidden border border-white/10">
              <div className="h-40 w-full relative bg-gray-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={reward.imageUrl} alt={reward.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500 text-gray-950">
                  {reward.pointsCost} pts
                </div>
              </div>
              <div className="p-4 space-y-2">
                <div className="text-sm font-bold text-white">{reward.name}</div>
                <div className="text-xs text-gray-400 line-clamp-2">{reward.description}</div>
                <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-white/5">
                  <span className="capitalize">{reward.category}</span>
                  <span>{reward.redeemedCount} claimed</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Reward */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-6 sm:p-7 max-w-md w-full space-y-4 border border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Add Loyalty Reward</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReward} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Reward Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Whey Protein Isolate Shake"
                  className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description of perk or item"
                  className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Points Cost</label>
                  <input
                    type="number"
                    required
                    value={pointsCost}
                    onChange={(e) => setPointsCost(e.target.value)}
                    className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Stock Limit</label>
                  <input
                    type="number"
                    value={stockLimit}
                    onChange={(e) => setStockLimit(e.target.value)}
                    className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="merch">Merchandise / Gear</option>
                  <option value="beverage">Beverage / Nutrition</option>
                  <option value="training">Personal Training</option>
                  <option value="pass">Membership Discount</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-xs font-semibold text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-gray-950 text-xs font-bold hover:bg-emerald-400"
                >
                  {isSubmitting ? 'Creating...' : 'Create Reward'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
