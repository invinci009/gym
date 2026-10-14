# FIT FIBER GYM — Testing & Acceptance Matrix

## 1. Automated Test Suite

The automated test suite runs via Vitest and covers all core business rules, calculation engines, and security validations.

### Running Tests
```bash
npm test
```

### Test Coverage Summary (26 Tests Passing)
- **`src/lib/engine/__tests__/location.test.ts`**
  - Haversine distance accuracy (zero distance for identical coordinates).
  - Valid coordinates within 75-meter boundary approved.
  - Coordinates outside 75-meter boundary rejected.
  - Missing, invalid, or NaN coordinates safely rejected without crashing.
- **`src/lib/engine/__tests__/streak.test.ts`**
  - First qualifying attendance initializes streak to 1.
  - **Example A:** 29 days elapsed (Oct 1 to Oct 30) continues streak.
  - **Example B:** 30 complete days elapsed (Oct 1 to Oct 31) resets streak to 1.
  - **Example C:** Multiple attendance sessions on the same local calendar day count once and do not increment streak.
  - Longest streak monotonically increases and is never decremented on reset.
  - Milestone unlock detection (7, 14, 30, 60, 100 days).
  - Streak status evaluation on read (active vs expired days remaining).
- **`src/lib/engine/__tests__/points.test.ts`**
  - 10 points awarded for first qualifying visit of the day.
  - 0 additional points for repeat visits on the same local day.
  - Daily points limit adherence.
  - Immutable ledger entry creation with `balanceAfter`.
  - Atomic redemption point deduction and insufficient balance overdraw prevention.
  - Deterministic idempotency key consistency.
- **`src/lib/server/__tests__/attendance-service.test.ts`**
  - Active member inside radius checks in successfully.
  - Member outside radius (500m away) rejected.
  - Missing/denied location coordinates rejected.
  - Suspended member rejected.
  - Duplicate check-in rejected while session is already active.
  - Active session check-out records elapsed duration in minutes.
  - Check-out rejected when no active session exists.
  - Reward redemption atomically deducts points.
  - Reward redemption rejected when balance is insufficient.

---

## 2. Acceptance Criteria Verification Matrix

| Requirement | Implementation Component | Status |
|---|---|---|
| Permanent static QR URL format | `/check-in/[gymId]` + `PermanentQrCard` | Verified |
| GPS distance calculated server-side | `verifyGymLocation` (Haversine formula) | Verified |
| 75m configurable boundary | `INITIAL_GYM_SETTINGS` / `/api/admin/settings` | Verified |
| 30-day inactivity streak window | `processAttendanceStreak` & `evaluateStreakStatus` | Verified |
| Idempotent daily points award | `getDailyAttendanceAwardKey` & `createLedgerEntry` | Verified |
| Multiple sessions in 1 day handled | 1 qualifying day increment, multiple visits logged | Verified |
| Longest streak preserved permanently | `Math.max(longestStreak, newStreak)` | Verified |
| Rewards atomic balance deduction | `redeemReward` with ledger entry | Verified |
| Admin member management | `/admin/members` (status, dates, search) | Verified |
| Audited attendance corrections | `/admin/attendance` (mandatory reason) | Verified |
| Print-ready wall poster layout | `PermanentQrCard` print CSS & download PNG | Verified |
| Deny-by-default Firestore rules | `firestore.rules` | Verified |
| Production build success | Next.js 16 App Router build clean (26 routes) | Verified |
