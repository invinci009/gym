'use client';

import React from 'react';
import PermanentQrCard from '@/components/qr/PermanentQrCard';
import { QrCode, MapPin, ShieldCheck, Printer, AlertTriangle } from 'lucide-react';

export default function AdminQrPage() {
  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div className="pb-2 border-b border-white/5">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
          <QrCode className="w-4 h-4" />
          <span>Gym Walls Infrastructure</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Permanent Wall QR Code</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Generate, download, and print the official attendance QR code for FIT FIBER GYM
        </p>
      </div>

      {/* Permanent QR Component */}
      <PermanentQrCard
        gymId="fit-fiber-gym"
        gymName="FIT FIBER GYM"
        address="1st Floor, Alam Market, Phulwari Sharif, Patna, Bihar 801505"
      />

      {/* Architectural Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Printing & Wall Placement Guide</span>
          </div>
          <ul className="text-xs text-gray-400 space-y-2 list-disc pl-4 leading-relaxed">
            <li>
              Print on minimum A4 or A3 size paper/acrylic board for optimal optical scanning distance (1–2 meters).
            </li>
            <li>
              Place at eye level (approx. 5 feet / 1.5m from floor) near entrance turns, locker areas, and reception counter.
            </li>
            <li>
              Use matte lamination to prevent harsh overhead lighting reflections from interfering with phone cameras.
            </li>
            <li>
              The printed code is permanent and never needs reprinting when rules or streaks change.
            </li>
          </ul>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Anti-Fraud Model</span>
          </div>
          <ul className="text-xs text-gray-400 space-y-2 list-disc pl-4 leading-relaxed">
            <li>
              <strong>Threat:</strong> A member photographs the wall QR code and shares it with a friend who is at home.
            </li>
            <li>
              <strong>Defense:</strong> The URL only identifies the gym. The browser must submit device coordinates to the backend Cloud Function, which calculates great-circle distance against Patna coordinates.
            </li>
            <li>
              <strong>Enforcement:</strong> If outside the 75m boundary or permission is denied, self-service check-in is rejected server-side.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
