import { NextRequest, NextResponse } from 'next/server';
import { gymStore } from '@/lib/mock/store';
import { Reward } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      rewards: gymStore.rewards,
      redemptions: gymStore.redemptions,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, category, pointsCost, stockLimit, imageUrl, adminId } = body;

    if (!name || !pointsCost) {
      return NextResponse.json(
        { success: false, message: 'Reward name and pointsCost are required.' },
        { status: 400 }
      );
    }

    const newRewardId = `rew-${Date.now().toString(36)}`;
    const nowIso = new Date().toISOString();

    const newReward: Reward = {
      id: newRewardId,
      gymId: 'fit-fiber-gym',
      name,
      description: description || '',
      category: category || 'merch',
      pointsCost: Number(pointsCost),
      active: true,
      stockLimit: stockLimit ? Number(stockLimit) : undefined,
      redeemedCount: 0,
      imageUrl,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    gymStore.rewards.unshift(newReward);

    // Audit log
    gymStore.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      gymId: 'fit-fiber-gym',
      actorId: adminId || 'admin',
      actorEmail: 'admin@fitfiber.com',
      actorRole: 'admin',
      action: 'reward_created',
      targetType: 'reward',
      targetId: newRewardId,
      details: { name, pointsCost },
      timestamp: nowIso,
    });

    gymStore.persist();

    return NextResponse.json({ success: true, reward: newReward });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, redemptionId, rewardId, active, pointsCost, stockLimit, notes, adminId } = body;

    const nowIso = new Date().toISOString();

    // Action 1: Fulfill a pending redemption
    if (action === 'fulfill' && redemptionId) {
      const redemption = gymStore.redemptions.find((r) => r.id === redemptionId);
      if (!redemption) {
        return NextResponse.json({ success: false, message: 'Redemption record not found.' }, { status: 404 });
      }
      if (redemption.status === 'fulfilled') {
        return NextResponse.json(
          { success: false, message: 'This redemption has already been marked as fulfilled.' },
          { status: 400 }
        );
      }

      redemption.status = 'fulfilled';
      redemption.fulfilledAt = nowIso;
      redemption.fulfilledBy = adminId || 'admin';
      if (notes) redemption.notes = notes;

      // Audit log
      gymStore.auditLogs.unshift({
        id: `aud_${Date.now()}`,
        gymId: redemption.gymId,
        actorId: adminId || 'admin',
        actorEmail: 'admin@fitfiber.com',
        actorRole: 'admin',
        action: 'redemption_fulfilled',
        targetType: 'redemption',
        targetId: redemptionId,
        details: { rewardName: redemption.rewardName, memberId: redemption.memberId },
        timestamp: nowIso,
      });

      gymStore.persist();

      return NextResponse.json({ success: true, redemption });
    }

    // Action 2: Update reward status or details
    if (rewardId) {
      const reward = gymStore.rewards.find((r) => r.id === rewardId);
      if (!reward) {
        return NextResponse.json({ success: false, message: 'Reward not found.' }, { status: 404 });
      }

      if (active !== undefined) reward.active = active;
      if (pointsCost !== undefined) reward.pointsCost = Number(pointsCost);
      if (stockLimit !== undefined) reward.stockLimit = Number(stockLimit);
      reward.updatedAt = nowIso;

      gymStore.persist();

      return NextResponse.json({ success: true, reward });
    }

    return NextResponse.json({ success: false, message: 'Invalid action or parameters.' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
