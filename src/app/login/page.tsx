'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { Dumbbell, ShieldCheck, User, ArrowRight, Loader2, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, switchDemoUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setError(null);

    const res = await login(email, password);
    setIsLoading(false);
    if (res.success) {
      if (email.includes('admin')) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } else {
      setError(res.message || 'Login failed');
    }
  };

  const handleQuickLogin = (targetEmail: string, role: string) => {
    switchDemoUser(targetEmail);
    if (role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-black font-extrabold shadow-lg shadow-emerald-500/20 mx-auto">
          <Dumbbell className="w-6 h-6 text-gray-950 stroke-[2.5]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Sign In to FIT FIBER</h1>
        <p className="text-xs text-gray-400">
          Phulwari Sharif, Patna • Member & Administrator Portal
        </p>
      </div>

      {/* Main Login Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-7 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rahul@gmail.com"
              className="w-full bg-gray-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">{error}</div>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In</span>}
          </button>
        </form>

        <div className="text-center text-xs text-gray-400">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-emerald-400 hover:underline font-semibold">
            Register new membership
          </Link>
        </div>

        {/* 1-Click Fast Preview Personas */}
        <div className="pt-4 border-t border-white/10 space-y-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>1-Click Test Personas (Sandbox Preview)</span>
          </div>

          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@fitgym.com', 'admin')}
              className="w-full text-left p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-xs flex items-center justify-between text-amber-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="font-bold">Coach Aman (admin@fitgym.com)</span>
              </div>
              <span className="text-[10px] bg-amber-500/30 px-2 py-0.5 rounded text-amber-300 font-semibold">
                Admin Panel →
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('rahul@gmail.com', 'member')}
              className="w-full text-left p-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-white/10 text-xs flex items-center justify-between text-gray-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold">Rahul Sharma (Active Member)</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">8-Day Streak</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('priya@gmail.com', 'member')}
              className="w-full text-left p-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-white/10 text-xs flex items-center justify-between text-gray-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold">Priya Singh (Streak Veteran)</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">29-Day Streak</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('vikram@gmail.com', 'member')}
              className="w-full text-left p-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-white/10 text-xs flex items-center justify-between text-gray-400 transition-colors"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-red-400" />
                <span className="font-semibold">Vikram Kumar (Suspended Account)</span>
              </div>
              <span className="text-[10px] text-red-400">Tests rejection rule</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
