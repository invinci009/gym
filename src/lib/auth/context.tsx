'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { GymMember, UserRole } from '../types';
import { auth, isFirebaseConfigured } from '../firebase/client';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { INITIAL_MEMBERS } from '../mock/data';

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
  logout: () => Promise<void>;
  switchDemoUser: (uidOrEmail: string) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<GymMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync with Firebase Authentication & local state
  useEffect(() => {
    let unsubscribe = () => {};

    if (auth && isFirebaseConfigured) {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            // Fetch member details from backend
            const res = await fetch(`/api/attendance/scan`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ gymId: 'fit-fiber-gym', memberId: firebaseUser.uid }),
            });
            const data = await res.json();

            const role: UserRole =
              firebaseUser.email?.toLowerCase().includes('admin') ||
              firebaseUser.email === 'admin@fitgym.com'
                ? 'admin'
                : 'member';

            if (data.member) {
              setUser({
                ...data.member,
                displayName: firebaseUser.displayName || data.member.displayName || 'Gym Member',
                email: firebaseUser.email || data.member.email,
                role,
              });
            } else {
              // Create member representation
              const newMember: GymMember = {
                uid: firebaseUser.uid,
                gymId: 'fit-fiber-gym',
                displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Member',
                email: firebaseUser.email || '',
                role,
                membershipStatus: 'active',
                currentStreak: 0,
                longestStreak: 0,
                totalQualifyingDays: 0,
                totalVisits: 0,
                pointsBalance: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              setUser(newMember);
            }
          } catch {
            // Fallback
            setUser({
              uid: firebaseUser.uid,
              gymId: 'fit-fiber-gym',
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Member',
              email: firebaseUser.email || '',
              role: firebaseUser.email?.includes('admin') ? 'admin' : 'member',
              membershipStatus: 'active',
              currentStreak: 0,
              longestStreak: 0,
              totalQualifyingDays: 0,
              totalVisits: 0,
              pointsBalance: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        } else {
          // Check local stored session for seamless sandbox usage
          const storedUid = typeof window !== 'undefined' ? localStorage.getItem('fitfiber_active_user') : null;
          if (storedUid) {
            const found = INITIAL_MEMBERS.find((m) => m.uid === storedUid || m.email === storedUid);
            if (found) {
              setUser(found);
              setIsLoading(false);
              return;
            }
          }
          // Default to Rahul Sharma (Active Member)
          setUser(INITIAL_MEMBERS[0]);
        }
        setIsLoading(false);
      });
    } else {
      const storedUid = typeof window !== 'undefined' ? localStorage.getItem('fitfiber_active_user') : null;
      if (storedUid) {
        const found = INITIAL_MEMBERS.find((m) => m.uid === storedUid || m.email === storedUid);
        if (found) {
          setUser(found);
          setIsLoading(false);
          return;
        }
      }
      setUser(INITIAL_MEMBERS[0]);
      setIsLoading(false);
    }

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      // 1. Attempt real Firebase Auth if configured and password provided
      if (auth && password && isFirebaseConfigured) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const fbUser = userCredential.user;
          const role: UserRole =
            email.toLowerCase().includes('admin') || email === 'admin@fitgym.com' ? 'admin' : 'member';

          setUser({
            uid: fbUser.uid,
            gymId: 'fit-fiber-gym',
            displayName: fbUser.displayName || email.split('@')[0],
            email: fbUser.email || email,
            role,
            membershipStatus: 'active',
            currentStreak: 0,
            longestStreak: 0,
            totalQualifyingDays: 0,
            totalVisits: 0,
            pointsBalance: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          localStorage.setItem('fitfiber_active_user', fbUser.uid);
          setIsLoading(false);
          return { success: true };
        } catch (firebaseErr: unknown) {
          const fbMsg = firebaseErr instanceof Error ? firebaseErr.message : 'Firebase Auth error';
          console.warn('Real Firebase sign-in notice:', fbMsg);
          // If user exists locally or fallback demo, continue to fallback
        }
      }

      // 2. Fallback to mock / seeded members
      const targetUser = INITIAL_MEMBERS.find((m) => m.email.toLowerCase() === email.toLowerCase());
      if (targetUser) {
        setUser(targetUser);
        localStorage.setItem('fitfiber_active_user', targetUser.uid);
        setIsLoading(false);
        return { success: true };
      }

      // 3. Create fresh member profile
      const newMember: GymMember = {
        uid: `mem-${Date.now().toString(36)}`,
        gymId: 'fit-fiber-gym',
        displayName: email.split('@')[0],
        email,
        role: email.toLowerCase().includes('admin') || email === 'admin@fitgym.com' ? 'admin' : 'member',
        membershipStatus: 'active',
        currentStreak: 0,
        longestStreak: 0,
        totalQualifyingDays: 0,
        totalVisits: 0,
        pointsBalance: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUser(newMember);
      localStorage.setItem('fitfiber_active_user', newMember.uid);
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
    password?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      // 1. Try creating real Firebase Auth user if configured
      if (auth && data.password && isFirebaseConfigured) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
          if (auth.currentUser) {
            await updateProfile(auth.currentUser, { displayName: data.displayName });
          }
          const fbUser = userCredential.user;
          const role: UserRole =
            data.email.toLowerCase().includes('admin') || data.email === 'admin@fitgym.com' ? 'admin' : 'member';

          const newMember: GymMember = {
            uid: fbUser.uid,
            gymId: 'fit-fiber-gym',
            displayName: data.displayName,
            email: data.email,
            phone: data.phone,
            role,
            membershipStatus: 'active',
            currentStreak: 0,
            longestStreak: 0,
            totalQualifyingDays: 0,
            totalVisits: 0,
            pointsBalance: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          setUser(newMember);
          localStorage.setItem('fitfiber_active_user', fbUser.uid);
          setIsLoading(false);
          return { success: true };
        } catch (fbErr: unknown) {
          const fbMsg = fbErr instanceof Error ? fbErr.message : 'Registration error';
          console.warn('Real Firebase sign-up notice:', fbMsg);
        }
      }

      // 2. Server API registration
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

  const logout = async () => {
    if (auth) {
      try {
        await firebaseSignOut(auth);
      } catch {
        // ignore
      }
    }
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
