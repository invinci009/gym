'use client';

import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check, Printer, ShieldCheck, MapPin, AlertCircle } from 'lucide-react';

interface PermanentQrCardProps {
  gymId?: string;
  gymName?: string;
  address?: string;
}

export default function PermanentQrCard({
  gymId = 'fit-fiber-gym',
  gymName = 'FIT FIBER GYM',
  address = '1st Floor, Alam Market, Phulwari Sharif, Patna, Bihar 801505',
}: PermanentQrCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [appUrl, setAppUrl] = useState<string>('http://localhost:3000');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAppUrl(window.location.origin);
    }
  }, []);

  const permanentUrl = `${appUrl}/check-in/${gymId}`;

  useEffect(() => {
    QRCode.toDataURL(permanentUrl, {
      width: 600,
      margin: 2,
      color: {
        dark: '#0b0f17',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code:', err));
  }, [permanentUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(permanentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPng = () => {
    const link = document.createElement('a');
    link.download = `fit-fiber-gym-permanent-qr.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Interactive Admin Preview Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Printable Wall Poster Frame */}
          <div
            ref={printRef}
            className="w-full max-w-sm bg-white rounded-2xl p-6 text-gray-900 shadow-2xl border-4 border-emerald-500 flex flex-col items-center text-center relative"
          >
            <div className="text-[11px] font-black tracking-widest text-emerald-700 uppercase mb-1">
              Official Wall Check-In QR
            </div>
            <h3 className="text-2xl font-black text-gray-950 tracking-tight">{gymName}</h3>
            <p className="text-xs text-gray-600 mt-0.5 flex items-center justify-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Phulwari Sharif, Patna</span>
            </p>

            {/* QR Image */}
            <div className="my-5 p-3 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 shadow-inner">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrDataUrl} alt={`${gymName} Permanent QR`} className="w-64 h-64 object-contain" />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center text-gray-400">Generating QR...</div>
              )}
            </div>

            <div className="w-full space-y-1">
              <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                1. Open Phone Camera or QR App
              </p>
              <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                2. Tap Link to Check In & Save Streak
              </p>
              <p className="text-[10px] text-gray-500 mt-2 italic">
                *Self-service check-in requires gym location verification.
              </p>
            </div>
          </div>

          {/* Details & Action Controls */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Permanent Wall QR Code (Static & Forever Stable)
              </div>
              <h2 className="text-2xl font-black text-white">Permanent Gym QR Code</h2>
              <p className="text-sm text-gray-300 mt-1 leading-relaxed">
                Print and frame this QR code on the walls of <strong>{gymName}</strong>. This QR code never changes,
                never expires, and requires no electronic rotating screens.
              </p>
            </div>

            {/* Public URL Box */}
            <div className="p-3.5 rounded-xl bg-gray-900/80 border border-white/10 space-y-1.5">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Permanent Public Check-in URL
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={permanentUrl}
                  className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-emerald-400 focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Security Safeguards Callout */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Anti-Fraud & Security Architecture
              </div>
              <p className="leading-relaxed">
                If someone photographs this QR code to take home, self-service check-in will be rejected because the
                server calculates distance against FIT FIBER GYM coordinates (Patna) and enforces a 75m boundary.
                Location verification is computed server-side, not trusted from the client.
              </p>
            </div>

            {/* Download & Print Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={`/api/gym/qr?gymId=${gymId}&format=png&download=true`}
                download="fit-fiber-gym-wall-qr.png"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download High-Res PNG (1024px)</span>
              </a>

              <a
                href={`/api/gym/qr?gymId=${gymId}&format=svg&download=true`}
                download="fit-fiber-gym-wall-qr.svg"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 font-semibold text-xs border border-emerald-500/30 transition-colors active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download Vector SVG</span>
              </a>

              <a
                href="/admin/qr/poster"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold text-xs border border-white/10 transition-colors active:scale-95"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>Print Official Wall Poster (A4 / A3)</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
