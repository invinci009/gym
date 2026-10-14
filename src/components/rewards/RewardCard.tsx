'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Award, Check, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Reward } from '@/lib/types';
import { useAuth } from '@/lib/auth/context';
import { sound } from '@/lib/client/audio';
import RedemptionVoucherModal from './RedemptionVoucherModal';

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
  onRedeemed?: () => void;
}

export default function RewardCard({ reward, userPoints, onRedeemed }: RewardCardProps) {
  const { user, refreshUser } = useAuth();
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');

  const canAfford = userPoints >= reward.pointsCost;
  const isOutOfStock = reward.stockLimit !== undefined && reward.redeemedCount >= reward.stockLimit;

  const handleRedeem = async () => {
    if (!user || !canAfford || isOutOfStock) return;
    setIsRedeeming(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gymId: reward.gymId,
          memberId: user.uid,
          rewardId: reward.id,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Redemption failed.');
        setIsRedeeming(false);
        return;
      }

      setSuccessMessage(data.message);
      const code = data.redemption?.id
        ? `FFG-${data.redemption.id.toUpperCase()}`
        : `FFG-${reward.name.split(' ')[0].toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setVoucherCode(code);
      setVoucherModalOpen(true);
      sound.playRewardChime();

      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10b981', '#fbbf24', '#ffffff'],
        });
      } catch {
        // ignore
      }

      await refreshUser();
      if (onRedeemed) onRedeemed();
    } catch {
      setErrorMessage('Network error while redeeming reward.');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col justify-between">
      {/* Image Banner */}
      <div className="h-44 w-full relative bg-gray-900 overflow-hidden">
        {reward.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={reward.imageUrl}
            alt={reward.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
            <Award className="w-12 h-12 stroke-[1.5]" />
          </div>
        )}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-emerald-400 border border-white/10">
          {reward.category}
        </div>
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-gray-950 shadow-md">
          {reward.pointsCost} pts
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h4 className="text-base font-bold text-white tracking-tight">{reward.name}</h4>
          <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{reward.description}</p>
        </div>

        {/* Stock / Availability */}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-white/5">
          <span>
            {reward.stockLimit !== undefined ? (
              <span className={isOutOfStock ? 'text-red-400 font-semibold' : 'text-gray-400'}>
                {isOutOfStock ? 'Out of stock' : `${reward.stockLimit - reward.redeemedCount} available`}
              </span>
            ) : (
              <span className="text-emerald-400 font-medium">In Stock</span>
            )}
          </span>
          <span className="text-[11px] text-gray-500">{reward.redeemedCount} claimed</span>
        </div>

        {/* Feedback messages */}
        {successMessage && (
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="leading-snug">{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {/* Action Button */}
        <div>
          {canAfford ? (
            <button
              onClick={handleRedeem}
              disabled={isRedeeming || isOutOfStock}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isRedeeming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Redemption...</span>
                </>
              ) : isOutOfStock ? (
                <span>Out of Stock</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Redeem For {reward.pointsCost} Points</span>
                </>
              )}
            </button>
          ) : (
            <button
              disabled
              className="w-full py-2.5 px-4 rounded-xl bg-gray-800/80 text-gray-400 font-medium text-xs border border-white/5 cursor-not-allowed text-center"
            >
              Need {reward.pointsCost - userPoints} More Points
            </button>
          )}
        </div>
      </div>

      <RedemptionVoucherModal
        isOpen={voucherModalOpen}
        onClose={() => setVoucherModalOpen(false)}
        reward={reward}
        voucherCode={voucherCode}
        memberName={user?.displayName || 'Gym Member'}
      />
    </div>
  );
}
