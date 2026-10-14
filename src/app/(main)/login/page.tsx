'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import {
  Dumbbell,
  ShieldCheck,
  User,
  ArrowRight,
  Loader2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
  HelpCircle,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<'member' | 'admin'>('member');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCredentialsHelper, setShowCredentialsHelper] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setError(null);

    const res = await login(email.trim(), password);
    setIsLoading(false);
    if (res.success) {
      if (email.toLowerCase().includes('admin') || activeTab === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } else {
      setError(res.message || 'Invalid email or password. Please try again.');
    }
  };

  const fillQuickCredentials = (userEmail: string, userPass: string, role: 'member' | 'admin') => {
    setEmail(userEmail);
    setPassword(userPass);
    setActiveTab(role);
    setShowCredentialsHelper(false);
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-gray-950 font-black shadow-xl shadow-emerald-500/25 mx-auto">
          <Dumbbell className="w-7 h-7 stroke-[2.5]" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">FIT FIBER GYM</h1>
        <p className="text-xs text-slate-400">
          1st Floor, Alam Market, Phulwari Sharif, Patna • Official Portal
        </p>
      </div>

      {/* Main Login Card */}
      <div className="border border-slate-800 bg-slate-900/90 backdrop-blur-2xl shadow-2xl rounded-3xl p-6 sm:p-8 space-y-6">
        {/* Role Segment Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setActiveTab('member');
              setError(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'member'
                ? 'bg-emerald-500 text-gray-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Member Login</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setError(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-amber-500 text-gray-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Staff Admin</span>
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {activeTab === 'admin' ? 'Staff Email / Username' : 'Member Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={activeTab === 'admin' ? 'admin@fitgym.com' : 'rahul@gmail.com'}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">Password</label>
              <button
                type="button"
                onClick={() => alert('Please contact gym front desk staff at Alam Market to reset your password.')}
                className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500/20 bg-slate-950"
              />
              <span>Remember this device</span>
            </label>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 animate-in fade-in duration-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99] ${
              activeTab === 'admin'
                ? 'bg-amber-500 hover:bg-amber-400 text-gray-950 shadow-amber-500/20'
                : 'bg-emerald-500 hover:bg-emerald-400 text-gray-950 shadow-emerald-500/20'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{activeTab === 'admin' ? 'Sign In to Admin Command' : 'Sign In to Member Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Member Registration Prompt */}
        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          New to FIT FIBER GYM?{' '}
          <Link href="/register" className="text-emerald-400 hover:underline font-bold">
            Register new membership
          </Link>
        </div>

        {/* Elegant Discreet Staff Credentials Drawer */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => setShowCredentialsHelper(!showCredentialsHelper)}
            className="text-[11px] text-slate-500 hover:text-slate-300 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Staff &amp; Quick Access Credentials</span>
          </button>

          {showCredentialsHelper && (
            <div className="mt-3 p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 text-left space-y-2.5 animate-in fade-in duration-200">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Select Account Credentials:</span>
                <span className="text-emerald-400 text-[10px]">1-Tap Fill</span>
              </div>

              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => fillQuickCredentials('admin@fitgym.com', 'admin123', 'admin')}
                  className="w-full text-left p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-xs flex items-center justify-between text-amber-200 transition-colors"
                >
                  <span className="font-semibold">Coach Aman (Gym Admin)</span>
                  <span className="text-[10px] font-mono text-amber-400">admin@fitgym.com</span>
                </button>

                <button
                  type="button"
                  onClick={() => fillQuickCredentials('rahul@gmail.com', 'pass123', 'member')}
                  className="w-full text-left p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs flex items-center justify-between text-slate-200 transition-colors"
                >
                  <span className="font-semibold">Rahul Sharma (Active Member)</span>
                  <span className="text-[10px] font-mono text-emerald-400">8d streak</span>
                </button>

                <button
                  type="button"
                  onClick={() => fillQuickCredentials('priya@gmail.com', 'pass123', 'member')}
                  className="w-full text-left p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs flex items-center justify-between text-slate-200 transition-colors"
                >
                  <span className="font-semibold">Priya Singh (Streak Veteran)</span>
                  <span className="text-[10px] font-mono text-emerald-400">29d streak</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
