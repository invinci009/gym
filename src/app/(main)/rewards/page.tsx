'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import RewardCard from '@/components/rewards/RewardCard';
import { Award, Gift, History, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { Reward, RewardRedemption, PointTransaction } from '@/lib/types';
import Link from 'next/link';

export default function RewardsPage() {
  const { user, refreshUser } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<'catalog' | 'redemptions' | 'ledger'>('catalog');
  const [isLoading, setIsLoading] = useState(true);

  const fetchRewardsData = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/rewards?gymId=fit-fiber-gym&memberId=${user.uid}`);
      const data = await res.json();
      if (data.success) {
        setRewards(data.rewards || []);
        setRedemptions(data.redemptions || []);
        setTransactions(data.transactions || []);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRewardsData();
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-white">Please sign in to view rewards</h2>
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
      {/* Wallet Balance Hero Banner */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <Award className="w-4 h-4 stroke-[2.5]" />
            <span>FIT FIBER Loyalty Rewards</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Points Wallet & Rewards</h1>
          <p className="text-xs text-gray-400 max-w-lg leading-relaxed">
            Earn 10 points on your first attendance visit each day and unlock up to 1000 bonus points on streak milestones.
          </p>
        </div>

        {/* Balance Display */}
        <div className="bg-gray-900/90 border border-white/10 rounded-2xl p-4 sm:p-5 text-right min-w-[200px]">
          <div className="text-[10px] text-gray-400 uppercase font-semibold">Available Balance</div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-400 mt-0.5">
            {user.pointsBalance} <span className="text-sm font-bold text-white">pts</span>
          </div>
          <div className="text-[11px] text-gray-400 mt-1 flex items-center justify-end gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Redeemable at Front Desk</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'catalog'
              ? 'bg-emerald-500 text-gray-950 shadow-md shadow-emerald-500/20'
              : 'bg-gray-900 text-gray-400 hover:text-white'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Rewards Catalogue ({rewards.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('redemptions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'redemptions'
              ? 'bg-emerald-500 text-gray-950 shadow-md shadow-emerald-500/20'
              : 'bg-gray-900 text-gray-400 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>My Redemptions ({redemptions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'ledger'
              ? 'bg-emerald-500 text-gray-950 shadow-md shadow-emerald-500/20'
              : 'bg-gray-900 text-gray-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Points Transaction Ledger ({transactions.length})</span>
        </button>
      </div>

      {/* Tab 1: Catalogue */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                userPoints={user.pointsBalance}
                onRedeemed={() => {
                  fetchRewardsData();
                  refreshUser();
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: My Redemptions */}
      {activeTab === 'redemptions' && (
        <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-sm font-bold text-white">Redemption Claims</h3>
            <p className="text-xs text-gray-400">Show pending claims to gym staff at the counter to claim</p>
          </div>

          {redemptions.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              You haven&apos;t redeemed any rewards yet. Browse the catalogue above!
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {redemptions.map((red) => (
                <div key={red.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-white">{red.rewardName}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Claimed on {new Date(red.createdAt).toLocaleDateString()} • {red.pointsSpent} points spent
                    </div>
                    {red.notes && <div className="text-[11px] text-gray-400 italic mt-0.5">{red.notes}</div>}
                  </div>

                  <div className="text-right">
                    {red.status === 'fulfilled' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Fulfilled</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending Handover</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Points Ledger */}
      {activeTab === 'ledger' && (
        <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-sm font-bold text-white">Immutable Points Ledger</h3>
            <p className="text-xs text-gray-400">Full auditable transaction history with idempotency keys</p>
          </div>

          {transactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">No transactions recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-950/60 text-gray-400 uppercase tracking-wider font-semibold border-b border-white/5">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Event Type</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Points</th>
                    <th className="py-3 px-4">Balance After</th>
                    <th className="py-3 px-4 font-mono">Idempotency Key</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-gray-400">
                        {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="capitalize font-semibold text-white">{tx.type.replace('_', ' ')}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{tx.reason}</td>
                      <td className="py-3 px-4 whitespace-nowrap font-bold">
                        {tx.points > 0 ? (
                          <span className="text-emerald-400">+{tx.points}</span>
                        ) : (
                          <span className="text-amber-400">{tx.points}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-semibold text-white">
                        {tx.balanceAfter} pts
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[10px] text-gray-500">
                        {tx.idempotencyKey}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
