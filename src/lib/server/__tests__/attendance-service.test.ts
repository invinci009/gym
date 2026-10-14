import { describe, it, expect, beforeEach } from 'vitest';
import { AttendanceService } from '../attendance-service';
import { gymStore, INITIAL_MEMBERS, INITIAL_GYM_SETTINGS, INITIAL_REWARDS } from '../../mock/store';

describe('AttendanceService Business Logic & Security', () => {
  const GYM_ID = 'fit-fiber-gym';
  const VALID_COORDS = {
    latitude: INITIAL_GYM_SETTINGS.attendance.latitude,
    longitude: INITIAL_GYM_SETTINGS.attendance.longitude,
  };
  const OUTSIDE_COORDS = {
    latitude: 28.6139, // Delhi (hundreds of km away from Patna)
    longitude: 77.2090,
  };

  beforeEach(() => {
    // Reset store state for testing isolation
    gymStore.settings = JSON.parse(JSON.stringify(INITIAL_GYM_SETTINGS));
    gymStore.members = JSON.parse(JSON.stringify(INITIAL_MEMBERS));
    gymStore.attendance = [];
    gymStore.transactions = [];
    gymStore.rewards = JSON.parse(JSON.stringify(INITIAL_REWARDS));
    gymStore.redemptions = [];
  });

  it('allows an active member inside the permitted radius to check in', async () => {
    const result = await AttendanceService.checkIn({
      gymId: GYM_ID,
      memberId: 'mem-rahul-01',
      coordinates: VALID_COORDS,
    });

    expect(result.success).toBe(true);
    expect(result.session).toBeDefined();
    expect(result.session?.status).toBe('checked_in');
    expect(result.pointsAwarded).toBe(10);
  });

  it('rejects a member attempting self-service check-in from outside permitted radius', async () => {
    const result = await AttendanceService.checkIn({
      gymId: GYM_ID,
      memberId: 'mem-rahul-01',
      coordinates: OUTSIDE_COORDS,
    });

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('LOCATION_VERIFICATION_FAILED');
    expect(result.message).toContain('away from the gym');
  });

  it('rejects self-service check-in when coordinates are missing or null', async () => {
    const result = await AttendanceService.checkIn({
      gymId: GYM_ID,
      memberId: 'mem-rahul-01',
      coordinates: null,
    });

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('LOCATION_VERIFICATION_FAILED');
  });

  it('rejects suspended or expired members', async () => {
    const result = await AttendanceService.checkIn({
      gymId: GYM_ID,
      memberId: 'mem-vikram-03', // Suspended member
      coordinates: VALID_COORDS,
    });

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('MEMBERSHIP_SUSPENDED');
  });

  it('prevents duplicate check-in if member already has an open session', async () => {
    // First check in
    await AttendanceService.checkIn({
      gymId: GYM_ID,
      memberId: 'mem-rahul-01',
      coordinates: VALID_COORDS,
    });

    // Second check in attempt
    const secondResult = await AttendanceService.checkIn({
      gymId: GYM_ID,
      memberId: 'mem-rahul-01',
      coordinates: VALID_COORDS,
    });

    expect(secondResult.success).toBe(false);
    expect(secondResult.errorCode).toBe('ALREADY_CHECKED_IN');
  });

  it('successfully checks out an open session and sets completed status', async () => {
    await AttendanceService.checkIn({
      gymId: GYM_ID,
      memberId: 'mem-rahul-01',
      coordinates: VALID_COORDS,
    });

    const checkOutResult = await AttendanceService.checkOut({
      gymId: GYM_ID,
      memberId: 'mem-rahul-01',
    });

    expect(checkOutResult.success).toBe(true);
    expect(checkOutResult.session?.status).toBe('completed');
    expect(checkOutResult.session?.checkOutAt).toBeDefined();
  });

  it('rejects check-out if no active session exists', async () => {
    const result = await AttendanceService.checkOut({
      gymId: GYM_ID,
      memberId: 'mem-rahul-01',
    });

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('NO_ACTIVE_SESSION');
  });

  it('redeems a reward atomically deducting points from balance', async () => {
    const member = gymStore.getMember('mem-rahul-01')!;
    member.pointsBalance = 300;

    const result = await AttendanceService.redeemReward({
      gymId: GYM_ID,
      memberId: 'mem-rahul-01',
      rewardId: 'rew-01', // Cost: 150
    });

    expect(result.success).toBe(true);
    expect(result.newBalance).toBe(150);
    expect(member.pointsBalance).toBe(150);
    expect(gymStore.redemptions.length).toBe(1);
    expect(gymStore.redemptions[0].status).toBe('pending');
  });

  it('rejects reward redemption if points balance is insufficient', async () => {
    const member = gymStore.getMember('mem-rahul-01')!;
    member.pointsBalance = 50;

    const result = await AttendanceService.redeemReward({
      gymId: GYM_ID,
      memberId: 'mem-rahul-01',
      rewardId: 'rew-01', // Cost: 150
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('Insufficient points');
    expect(member.pointsBalance).toBe(50);
  });
});
