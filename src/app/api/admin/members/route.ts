import { NextRequest, NextResponse } from 'next/server';
import { gymStore } from '@/lib/mock/store';
import { GymMember } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const status = searchParams.get('status');

    let members = gymStore.members.filter((m) => m.role === 'member');

    if (status && status !== 'all') {
      members = members.filter((m) => m.membershipStatus === status);
    }

    if (search) {
      members = members.filter(
        (m) =>
          m.displayName.toLowerCase().includes(search) ||
          m.email.toLowerCase().includes(search) ||
          (m.phone && m.phone.includes(search))
      );
    }

    return NextResponse.json({ success: true, members });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { displayName, email, phone, membershipExpiresAt, notes, adminId } = body;

    if (!displayName || !email) {
      return NextResponse.json(
        { success: false, message: 'Display name and email are required.' },
        { status: 400 }
      );
    }

    const existing = gymStore.getMember(email);
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'A member with this email already exists.' },
        { status: 400 }
      );
    }

    const newMemberId = `mem-${Date.now().toString(36)}`;
    const nowIso = new Date().toISOString();

    const newMember: GymMember = {
      uid: newMemberId,
      gymId: 'fit-fiber-gym',
      displayName,
      email,
      phone,
      role: 'member',
      membershipStatus: 'active',
      membershipStartAt: nowIso,
      membershipExpiresAt:
        membershipExpiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      currentStreak: 0,
      longestStreak: 0,
      totalQualifyingDays: 0,
      totalVisits: 0,
      pointsBalance: 0,
      notes,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    gymStore.members.unshift(newMember);

    // Audit log
    gymStore.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      gymId: 'fit-fiber-gym',
      actorId: adminId || 'admin',
      actorEmail: 'admin@fitfiber.com',
      actorRole: 'admin',
      action: 'member_created',
      targetType: 'member',
      targetId: newMemberId,
      details: { displayName, email, phone },
      timestamp: nowIso,
    });

    gymStore.persist();

    return NextResponse.json({ success: true, member: newMember });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { memberId, status, membershipExpiresAt, notes, adminId, reason } = body;

    if (!memberId) {
      return NextResponse.json({ success: false, message: 'memberId is required.' }, { status: 400 });
    }

    const member = gymStore.getMember(memberId);
    if (!member) {
      return NextResponse.json({ success: false, message: 'Member not found.' }, { status: 404 });
    }

    const previousStatus = member.membershipStatus;
    if (status) member.membershipStatus = status;
    if (membershipExpiresAt !== undefined) member.membershipExpiresAt = membershipExpiresAt;
    if (notes !== undefined) member.notes = notes;

    const { pointsDelta } = body;
    let pointsAdjustmentDetails: Record<string, unknown> | null = null;

    if (typeof pointsDelta === 'number' && pointsDelta !== 0) {
      const prevPoints = member.pointsBalance;
      member.pointsBalance = Math.max(0, member.pointsBalance + pointsDelta);
      const nowIso = new Date().toISOString();

      gymStore.transactions.unshift({
        id: `ptx_adj_${Date.now()}`,
        gymId: 'fit-fiber-gym',
        memberId: member.uid,
        type: 'adjustment',
        points: pointsDelta,
        balanceAfter: member.pointsBalance,
        reason: reason || (pointsDelta > 0 ? 'Administrative bonus points grant' : 'Administrative points deduction'),
        idempotencyKey: `adj_${member.uid}_${Date.now()}`,
        ruleVersion: 1,
        createdAt: nowIso,
      });

      pointsAdjustmentDetails = {
        previousPoints: prevPoints,
        newPoints: member.pointsBalance,
        pointsDelta,
      };
    }

    member.updatedAt = new Date().toISOString();

    // Audit log
    gymStore.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      gymId: 'fit-fiber-gym',
      actorId: adminId || 'admin',
      actorEmail: 'admin@fitfiber.com',
      actorRole: 'admin',
      action: typeof pointsDelta === 'number' ? 'points_manually_adjusted' : 'member_updated',
      targetType: 'member',
      targetId: memberId,
      details: {
        previousStatus,
        newStatus: member.membershipStatus,
        reason: reason || 'Administrative profile modification',
        ...(pointsAdjustmentDetails || {}),
      },
      timestamp: new Date().toISOString(),
    });

    gymStore.persist();

    return NextResponse.json({ success: true, member });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
