import { NextRequest, NextResponse } from 'next/server';
import { AttendanceService } from '@/lib/server/attendance-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gymId, memberId } = body;

    if (!gymId || !memberId) {
      return NextResponse.json(
        { success: false, message: 'Both gymId and memberId are required.' },
        { status: 400 }
      );
    }

    const result = await AttendanceService.checkOut({ gymId, memberId });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
