import { NextRequest, NextResponse } from 'next/server';
import { gymStore } from '@/lib/mock/store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('memberId');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    if (!memberId) {
      return NextResponse.json({ success: false, message: 'memberId is required.' }, { status: 400 });
    }

    const history = gymStore.getMemberHistory(memberId).slice(0, limit);
    const member = gymStore.getMember(memberId);
    const activeSession = gymStore.getActiveSession(memberId) || null;

    return NextResponse.json({
      success: true,
      history,
      activeSession,
      stats: member
        ? {
            currentStreak: member.currentStreak,
            longestStreak: member.longestStreak,
            totalQualifyingDays: member.totalQualifyingDays,
            totalVisits: member.totalVisits,
            pointsBalance: member.pointsBalance,
          }
        : null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
