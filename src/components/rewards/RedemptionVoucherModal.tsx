'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Check, Copy, Sparkles, Award, MapPin, Clock } from 'lucide-react';
import { Reward, RewardRedemption } from '@/lib/types';

interface RedemptionVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward: Reward;
  voucherCode: string;
  memberName: string;
}

export default function RedemptionVoucherModal({
  isOpen,
  onClose,
  reward,
  voucherCode,
  memberName,
}: RedemptionVoucherModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !voucherCode) return;
    QRCode.toDataURL(voucherCode, {
      width: 320,
      margin: 2,
      color: {
        dark: '#020617',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate voucher QR:', err));
  }, [isOpen, voucherCode]);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(voucherCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm bg-gradient-to-b from-gray-900 via-gray-900 to-black border-2 border-emerald-500/40 rounded-3xl p-6 shadow-[0_25px_60px_-15px_rgba(16,185,129,0.35)] text-white relative space-y-5 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="w-3 h-3" />
            <span>Redemption Pass Active</span>
          </div>
          <h3 className="text-xl font-black text-white tracking-tight">{reward.name}</h3>
          <p className="text-xs text-gray-400">
            FIT FIBER GYM • Front Desk Verification
          </p>
        </div>

        {/* Voucher Pass Card */}
        <div className="bg-white rounded-2xl p-4 text-gray-950 flex flex-col items-center shadow-inner relative">
          <div className="text-[10px] font-black uppercase tracking-widest text-emerald-800 mb-1">
            Scan at Reception Counter
          </div>

          <div className="p-2 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="Voucher QR Code" className="w-48 h-48 object-contain" />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-gray-400 text-xs">
                Generating Pass...
              </div>
            )}
          </div>

          <div className="mt-3 text-center space-y-0.5">
            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
              Voucher Code
            </div>
            <div className="text-lg font-mono font-black tracking-wider text-emerald-700">
              {voucherCode}
            </div>
          </div>
        </div>

        {/* Member and Instruction Details */}
        <div className="p-3.5 rounded-xl bg-gray-950/80 border border-white/10 space-y-2 text-xs">
          <div className="flex items-center justify-between text-gray-300">
            <span className="text-gray-500">Issued To:</span>
            <span className="font-bold text-white">{memberName}</span>
          </div>
          <div className="flex items-center justify-between text-gray-300">
            <span className="text-gray-500">Points Cost:</span>
            <span className="font-bold text-emerald-400">-{reward.pointsCost} pts</span>
          </div>
          <div className="flex items-center justify-between text-gray-300">
            <span className="text-gray-500">Status:</span>
            <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
              <Clock className="w-3 h-3" />
              <span>Pending Handover</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleCopyCode}
            className="w-full py-2.5 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-white/10"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Code Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-gray-400" />
                <span>Copy Voucher Code</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black text-xs transition-colors cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            Done &amp; Close Pass
          </button>
        </div>
      </div>
    </div>
  );
}
