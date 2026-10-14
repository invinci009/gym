import { NextRequest, NextResponse } from 'next/server';
import { gymStore } from '@/lib/mock/store';

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({ success: true, settings: gymStore.settings });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, address, phone, attendance, loyalty, operatingDays, adminId } = body;

    const current = gymStore.settings;

    if (name) current.name = name;
    if (address) current.address = address;
    if (phone) current.phone = phone;

    if (attendance) {
      if (attendance.locationVerificationEnabled !== undefined) {
        current.attendance.locationVerificationEnabled = Boolean(attendance.locationVerificationEnabled);
      }
      if (attendance.latitude !== undefined) current.attendance.latitude = Number(attendance.latitude);
      if (attendance.longitude !== undefined) current.attendance.longitude = Number(attendance.longitude);
      if (attendance.allowedRadiusMeters !== undefined) {
        current.attendance.allowedRadiusMeters = Number(attendance.allowedRadiusMeters);
      }
    }

    if (loyalty) {
      if (loyalty.pointsPerQualifyingDay !== undefined) {
        current.loyalty.pointsPerQualifyingDay = Number(loyalty.pointsPerQualifyingDay);
      }
      if (loyalty.dailyPointsLimit !== undefined) {
        current.loyalty.dailyPointsLimit = Number(loyalty.dailyPointsLimit);
      }
      if (loyalty.streakInactivityDays !== undefined) {
        current.loyalty.streakInactivityDays = Number(loyalty.streakInactivityDays);
      }
    }

    if (Array.isArray(operatingDays)) {
      current.operatingDays = operatingDays;
    }

    current.updatedAt = new Date().toISOString();

    // Audit log
    gymStore.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      gymId: current.publicGymId,
      actorId: adminId || 'admin',
      actorEmail: 'admin@fitfiber.com',
      actorRole: 'admin',
      action: 'settings_updated',
      targetType: 'settings',
      targetId: current.publicGymId,
      details: { attendance: current.attendance, loyalty: current.loyalty },
      timestamp: new Date().toISOString(),
    });

    gymStore.persist();

    return NextResponse.json({ success: true, settings: current });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
