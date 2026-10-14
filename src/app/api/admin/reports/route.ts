import { NextRequest, NextResponse } from 'next/server';
import { gymStore } from '@/lib/mock/store';

export async function GET(req: NextRequest) {
  try {
    const totalMembers = gymStore.members.filter((m) => m.role === 'member').length;
    const activeMembers = gymStore.members.filter((m) => m.role === 'member' && m.membershipStatus === 'active').length;
    const suspendedMembers = gymStore.members.filter((m) => m.role === 'member' && m.membershipStatus === 'suspended').length;
    const expiredMembers = gymStore.members.filter((m) => m.role === 'member' && m.membershipStatus === 'expired').length;

    const todayLocalDate = new Date().toISOString().split('T')[0];
    const todaySessions = gymStore.attendance.filter((a) => a.localDate === todayLocalDate);
    const todayQualifyingCount = todaySessions.filter((a) => a.qualifyingVisit).length;
    const openSessionsCount = gymStore.attendance.filter((a) => a.status === 'checked_in').length;

    const totalPointsIssued = gymStore.transactions
      .filter((t) => t.points > 0)
      .reduce((sum, t) => sum + t.points, 0);

    const totalPointsRedeemed = Math.abs(
      gymStore.transactions
        .filter((t) => t.points < 0)
        .reduce((sum, t) => sum + t.points, 0)
    );

    const pendingRedemptionsCount = gymStore.redemptions.filter((r) => r.status === 'pending').length;

    // Inactive members (> 30 days without visit)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const inactiveMembers = gymStore.members
      .filter((m) => m.role === 'member')
      .filter((m) => {
        if (!m.lastQualifyingVisitAt) return true;
        return new Date(m.lastQualifyingVisitAt).getTime() < thirtyDaysAgo;
      })
      .map((m) => ({
        uid: m.uid,
        displayName: m.displayName,
        email: m.email,
        phone: m.phone,
        lastQualifyingVisitAt: m.lastQualifyingVisitAt,
        currentStreak: m.currentStreak,
      }));

    // Recent 7 days attendance trend
    const recentDaysTrend: { date: string; visits: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      const count = gymStore.attendance.filter((a) => a.localDate === dateStr).length;
      recentDaysTrend.push({ date: dateStr, visits: count });
    }

    return NextResponse.json({
      success: true,
      metrics: {
        totalMembers,
        activeMembers,
        suspendedMembers,
        expiredMembers,
        todayQualifyingCount,
        openSessionsCount,
        totalPointsIssued,
        totalPointsRedeemed,
        pendingRedemptionsCount,
      },
      recentDaysTrend,
      inactiveMembers,
      recentAuditLogs: gymStore.auditLogs.slice(0, 10),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
