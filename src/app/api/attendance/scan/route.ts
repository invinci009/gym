import { NextRequest, NextResponse } from 'next/server';
import { AttendanceService } from '@/lib/server/attendance-service';
import { gymStore } from '@/lib/mock/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gymId, memberId } = body;

    if (!gymId) {
      return NextResponse.json({ success: false, message: 'Gym ID is required.' }, { status: 400 });
    }

    const settings = await AttendanceService.getSettings(gymId);
    if (!settings) {
      return NextResponse.json(
        { success: false, message: `Gym with ID "${gymId}" not recognized.` },
        { status: 404 }
      );
    }

    let activeSession = null;
    let member = null;
    if (memberId) {
      member = gymStore.getMember(memberId);
      activeSession = gymStore.getActiveSession(memberId) || null;
    }

    return NextResponse.json({
      success: true,
      gym: {
        id: settings.publicGymId,
        name: settings.name,
        address: settings.address,
        timezone: settings.timezone,
        locationVerificationEnabled: settings.attendance.locationVerificationEnabled,
        allowedRadiusMeters: settings.attendance.allowedRadiusMeters,
      },
      member: member
        ? {
            uid: member.uid,
            displayName: member.displayName,
            membershipStatus: member.membershipStatus,
            currentStreak: member.currentStreak,
            longestStreak: member.longestStreak,
            pointsBalance: member.pointsBalance,
          }
        : null,
      activeSession,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
