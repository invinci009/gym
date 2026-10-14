'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, MapPin, Award, Flame, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { GymSettings } from '@/lib/types';
import { useAuth } from '@/lib/auth/context';

export default function AdminLoyaltySettingsPage() {
  const { user: currentAdmin } = useAuth();
  const [settings, setSettings] = useState<GymSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states
  const [name, setName] = useState('FIT FIBER GYM');
  const [address, setAddress] = useState('1st Floor, Alam Market, Phulwari Sharif, Patna, Bihar 801505');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [latitude, setLatitude] = useState('25.577244522059356');
  const [longitude, setLongitude] = useState('85.0687193399421');
  const [radiusMeters, setRadiusMeters] = useState('75');
  const [pointsPerDay, setPointsPerDay] = useState('10');
  const [dailyPointsLimit, setDailyPointsLimit] = useState('10');
  const [streakInactivityDays, setStreakInactivityDays] = useState('30');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          const s = data.settings;
          setSettings(s);
          setName(s.name);
          setAddress(s.address || '');
          setPhone(s.phone || '');
          setLocationEnabled(s.attendance.locationVerificationEnabled);
          setLatitude(s.attendance.latitude.toString());
          setLongitude(s.attendance.longitude.toString());
          setRadiusMeters(s.attendance.allowedRadiusMeters.toString());
          setPointsPerDay(s.loyalty.pointsPerQualifyingDay.toString());
          setDailyPointsLimit(s.loyalty.dailyPointsLimit.toString());
          setStreakInactivityDays(s.loyalty.streakInactivityDays.toString());
        }
      } catch {
        // ignore
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          address,
          phone,
          attendance: {
            locationVerificationEnabled: locationEnabled,
            latitude: Number(latitude),
            longitude: Number(longitude),
            allowedRadiusMeters: Number(radiusMeters),
          },
          loyalty: {
            pointsPerQualifyingDay: Number(pointsPerDay),
            dailyPointsLimit: Number(dailyPointsLimit),
            streakInactivityDays: Number(streakInactivityDays),
          },
          adminId: currentAdmin?.uid,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert(data.message || 'Failed to save settings');
      }
    } catch {
      alert('Error updating gym settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Rules & Geofence Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Gym Configuration & Security Rules</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Configure attendance location coordinates, 30-day streak window, and points ledger policies
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold animate-pulse">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved & Audited!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Location & Coordinates */}
        <div className="glass-card rounded-2xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-white/10 pb-3">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Physical Gym Geolocation & Permitted Radius</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-900 border border-white/5">
            <div>
              <div className="text-xs font-bold text-white">Require Location Verification for Self-Service Check-In</div>
              <div className="text-[11px] text-gray-400">
                Calculates distance on server against gym coordinates. Rejects requests beyond radius.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={locationEnabled}
                onChange={(e) => setLocationEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Patna Latitude *</label>
              <input
                type="text"
                required
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Patna Longitude *</label>
              <input
                type="text"
                required
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Allowed Radius (Meters) *</label>
              <input
                type="number"
                required
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(e.target.value)}
                className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Streak Policy & 30-Day Window */}
        <div className="glass-card rounded-2xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-white/10 pb-3">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Attendance Streak Engine & Inactivity Window</span>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed space-y-1">
            <div className="font-bold text-amber-300">Authoritative Consecutive-Day Inactivity Window</div>
            <p>
              Per confirmed business rules: A member&apos;s streak increments at most once per local calendar day
              and continues across absences up to 30 days. If 30 complete consecutive days pass without a qualifying
              visit, the streak resets to zero (next visit begins a new streak at 1).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Inactivity Window (Days) *
              </label>
              <input
                type="number"
                required
                value={streakInactivityDays}
                onChange={(e) => setStreakInactivityDays(e.target.value)}
                className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Daily Points Awarded *
              </label>
              <input
                type="number"
                required
                value={pointsPerDay}
                onChange={(e) => setPointsPerDay(e.target.value)}
                className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Max Daily Points Limit *
              </label>
              <input
                type="number"
                required
                value={dailyPointsLimit}
                onChange={(e) => setDailyPointsLimit(e.target.value)}
                className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Gym Details */}
        <div className="glass-card rounded-2xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-white/10 pb-3">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Gym Profile & Address Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Gym Commercial Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Physical Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Configuration...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Configuration & Log Audit</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
