import { NextRequest, NextResponse } from 'next/server';
import { AttendanceService } from '@/lib/server/attendance-service';
import { gymStore } from '@/lib/mock/store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gymId = searchParams.get('gymId') || 'fit-fiber-gym';
    const memberId = searchParams.get('memberId');

    const rewards = gymStore.rewards.filter((r) => r.gymId === gymId && r.active);
    const redemptions = memberId ? gymStore.getMemberRedemptions(memberId) : [];
    const transactions = memberId ? gymStore.getMemberTransactions(memberId) : [];

    return NextResponse.json({
      success: true,
      rewards,
      redemptions,
      transactions,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gymId, memberId, rewardId, notes } = body;

    if (!gymId || !memberId || !rewardId) {
      return NextResponse.json(
        { success: false, message: 'gymId, memberId, and rewardId are required.' },
        { status: 400 }
      );
    }

    const result = await AttendanceService.redeemReward({ gymId, memberId, rewardId, notes });
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
