# FIT FIBER GYM — System Architecture

## 1. High-Level Architecture Overview

The system is organized into three tiers:
1. **Member Application (Client Tier):** Mobile-first Next.js App Router frontend for QR scanning, check-in, streak monitoring, and reward redemptions.
2. **Admin Command Center (Staff Tier):** Separate administrative portal (`/admin`) for member lifecycle, live attendance monitoring, audited corrections, loyalty settings, and wall QR poster generation.
3. **Serverless Firebase Backend (Privileged Tier):** Firebase Admin SDK API routes and Cloud Functions executing atomic transactions, verifying location proximity, preventing duplicate sessions, and enforcing business logic.

```
                           +-------------------------------------+
                           |      Permanent Wall QR Code         |
                           |  https://.../check-in/fit-fiber-gym |
                           +------------------+------------------+
                                              |
                                     (Member Scans Code)
                                              v
+------------------------+        +--------------------------+        +--------------------------+
|  Browser QR Scanner    | -----> |  Geofence Check (Device) | -----> |  Server API Route        |
|  & Camera Interface    |        |  Lat: 25.5772, Lon: 85.0687|      |  /api/attendance/check-in|
+------------------------+        +--------------------------+        +------------+-------------+
                                                                                   |
                                                                       (Atomic Server Transaction)
                                                                                   v
                                                                      +--------------------------+
                                                                      | 1. Active Member Check   |
                                                                      | 2. Haversine Distance    |
                                                                      | 3. 30-Day Streak Engine  |
                                                                      | 4. Idempotent Points     |
                                                                      | 5. Create Session & Log  |
                                                                      +--------------------------+
```

---

## 2. Permanent Static QR Code Model

The business constraint mandates a permanent, static QR code printed on gym walls.
- **URL Format:** `https://fitfibergym.com/check-in/fit-fiber-gym`
- **Identifier:** `fit-fiber-gym` (public, non-secret).
- **Properties:** Never rotates; contains no secrets, tokens, or Admin SDK keys.
- **Verification:** The QR code identifies the venue; attendance validity is evaluated dynamically on the server at time of scan.

---

## 3. Location Verification Engine

- **Coordinates:** FIT FIBER GYM, 1st Floor, Alam Market, Phulwari Sharif, Patna (`25.577244522059356, 85.0687193399421`).
- **Permitted Radius:** Configurable (default 75 meters).
- **Formula:** Haversine formula implemented in `src/lib/engine/location.ts` calculating great-circle distance $d = 2R \cdot \text{atan2}(\sqrt{a}, \sqrt{1-a})$.
- **Server Authority:** The backend calculates distance. Client-supplied flags like `isInsideGym: true` are completely ignored.

---

## 4. Attendance Streak Engine (30-Day Inactivity Window)

Unlike strict daily streaks, FIT FIBER GYM operates on a consecutive-day inactivity window:
- **Inactivity Threshold:** 30 complete days ($30 \times 24 \times 60 \times 60 \times 1000$ ms).
- **Deduplication:** A member's streak increments at most once per local calendar day in `Asia/Kolkata` timezone.
- **Absence < 30 Days:** If a member visits on Oct 1 and returns on Oct 30 (29 days elapsed), the streak continues.
- **Absence >= 30 Days:** If 30 complete days pass without attendance, the previous streak expires and the new visit begins a new streak at 1.
- **Longest Streak:** Stored permanently and never decremented due to inactivity resets.
- **Milestones:** Configurable bonuses at 7 days (+50 pts), 14 days (+100 pts), 30 days (+250 pts), 60 days (+500 pts), and 100 days (+1000 pts).

---

## 5. Points Ledger & Rewards Lifecycle

- **Idempotency:** Daily attendance award key `award_{gymId}_{memberId}_{YYYY-MM-DD}` prevents duplicate points.
- **Immutable Ledger:** Every points change corresponds to an auditable `PointTransaction` record with `balanceAfter`. Direct balance mutations by clients are forbidden by Firestore Security Rules.
- **Redemption Atomicity:** Reward redemption verifies stock, verifies `balance >= pointsCost`, subtracts points, creates pending redemption claim, and appends a negative ledger entry atomically.
