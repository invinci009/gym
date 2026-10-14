import { NextRequest, NextResponse } from 'next/server';
import { gymStore } from '@/lib/mock/store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    const memberId = searchParams.get('memberId');

    let list = [...gymStore.attendance];

    if (date) {
      list = list.filter((a) => a.localDate === date);
    }
    if (status && status !== 'all') {
      list = list.filter((a) => a.status === status);
    }
    if (memberId) {
      list = list.filter((a) => a.memberId === memberId);
    }

    return NextResponse.json({ success: true, attendance: list });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, status, checkOutAt, reason, adminId } = body;

    if (!sessionId) {
      return NextResponse.json({ success: false, message: 'sessionId is required.' }, { status: 400 });
    }
    if (!reason) {
      return NextResponse.json(
        { success: false, message: 'An administrative reason is strictly required to correct attendance.' },
        { status: 400 }
      );
    }

    const session = gymStore.attendance.find((a) => a.id === sessionId);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Attendance record not found.' }, { status: 404 });
    }

    const previousStatus = session.status;
    const nowIso = new Date().toISOString();

    session.status = status || 'corrected';
    if (checkOutAt !== undefined) {
      session.checkOutAt = checkOutAt;
    } else if (!session.checkOutAt && (status === 'completed' || status === 'corrected')) {
      session.checkOutAt = nowIso;
    }
    session.correctionReason = reason;
    session.correctedBy = adminId || 'admin';
    session.correctedAt = nowIso;
    session.updatedAt = nowIso;

    // Record audit trail
    gymStore.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      gymId: session.gymId,
      actorId: adminId || 'admin',
      actorEmail: 'admin@fitfiber.com',
      actorRole: 'admin',
      action: 'attendance_corrected',
      targetType: 'attendance',
      targetId: sessionId,
      details: {
        memberId: session.memberId,
        previousStatus,
        newStatus: session.status,
        reason,
        checkInAt: session.checkInAt,
        checkOutAt: session.checkOutAt,
      },
      timestamp: nowIso,
    });

    return NextResponse.json({ success: true, session });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
