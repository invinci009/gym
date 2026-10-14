'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { GymMember, UserRole } from '../types';
import { INITIAL_MEMBERS } from '../mock/store';

interface AuthContextType {
  user: GymMember | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: {
    displayName: string;
    email: string;
    phone?: string;
    password?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchDemoUser: (uidOrEmail: string) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<GymMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize with persisted session or default active member
  useEffect(() => {
    try {
      const storedUid = typeof window !== 'undefined' ? localStorage.getItem('fitfiber_active_user') : null;
      if (storedUid) {
        const found = INITIAL_MEMBERS.find((m) => m.uid === storedUid || m.email === storedUid);
        if (found) {
          setUser(found);
          setIsLoading(false);
          return;
        }
      }
      // Default to Rahul Sharma (Active Member) for easy preview
      setUser(INITIAL_MEMBERS[0]);
    } catch {
      setUser(INITIAL_MEMBERS[0]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      // Find matching user from mock store / server
      const res = await fetch(`/api/attendance/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gymId: 'fit-fiber-gym', memberId: email }),
      });
      const data = await res.json();

      let targetUser = INITIAL_MEMBERS.find((m) => m.email.toLowerCase() === email.toLowerCase());
      if (!targetUser && data.member) {
        targetUser = data.member;
      }

      if (targetUser) {
        setUser(targetUser);
        localStorage.setItem('fitfiber_active_user', targetUser.uid);
        setIsLoading(false);
        return { success: true };
      }

      // If user doesn't exist yet in demo mode, create an active member profile on the fly
      const fallbackMember: GymMember = {
        uid: `mem-${Date.now().toString(36)}`,
        gymId: 'fit-fiber-gym',
        displayName: email.split('@')[0],
        email,
        role: email.includes('admin') ? 'admin' : 'member',
        membershipStatus: 'active',
        currentStreak: 1,
        longestStreak: 1,
        totalQualifyingDays: 1,
        totalVisits: 1,
        pointsBalance: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUser(fallbackMember);
      localStorage.setItem('fitfiber_active_user', fallbackMember.uid);
      setIsLoading(false);
      return { success: true };
    } catch {
      setIsLoading(false);
      return { success: false, message: 'Authentication error' };
    }
  };

  const register = async (data: {
    displayName: string;
    email: string;
    phone?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success && result.member) {
        setUser(result.member);
        localStorage.setItem('fitfiber_active_user', result.member.uid);
        setIsLoading(false);
        return { success: true };
      }
      setIsLoading(false);
      return { success: false, message: result.message || 'Registration failed' };
    } catch {
      setIsLoading(false);
      return { success: false, message: 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fitfiber_active_user');
    }
  };

  const switchDemoUser = (uidOrEmail: string) => {
    const found = INITIAL_MEMBERS.find((m) => m.uid === uidOrEmail || m.email === uidOrEmail);
    if (found) {
      setUser(found);
      localStorage.setItem('fitfiber_active_user', found.uid);
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/attendance/history?memberId=${user.uid}`);
      const data = await res.json();
      if (data.success && data.stats) {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                currentStreak: data.stats.currentStreak,
                longestStreak: data.stats.longestStreak,
                pointsBalance: data.stats.pointsBalance,
                totalVisits: data.stats.totalVisits,
                totalQualifyingDays: data.stats.totalQualifyingDays,
              }
            : null
        );
      }
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        register,
        logout,
        switchDemoUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
