# FIT FIBER GYM — Security & Threat Model

## 1. Static QR Threat Analysis

### The Threat
Because the wall QR code is permanent, public, and static:
1. Anyone can photograph the QR code with their phone.
2. The image can be shared via WhatsApp, Telegram, or social media.
3. A user can open `https://.../check-in/fit-fiber-gym` from their bedroom to simulate attendance.

### Safeguards Implemented
- **Mandatory Location Verification:** When opening self-service check-in, the browser must query the device's GPS coordinates and submit them to the server. The backend computes the Haversine distance against FIT FIBER GYM (Patna). Coordinates outside the 75-meter geofence reject attendance immediately.
- **Authentication Requirement:** The check-in URL does not grant attendance. The user must be authenticated with an active membership.
- **Active Membership Validation:** Suspended, pending, or expired memberships are rejected.
- **Duplicate Session Rejection:** A member who is currently checked in cannot check in again until they check out.
- **Idempotent Daily Points:** Points are credited at most once per local calendar day.
- **Administrative Correction Audit:** Staff can correct or manually check in a member whose GPS failed, but must log a mandatory reason.

### Acknowledged Residual Risks
- Public static QR codes cannot cryptographically prove physical presence on their own.
- Geolocation can be spoofed on rooted/jailbroken devices using mock location providers.
- Indoor GPS attenuation can cause false negatives; in such cases, self-service is rejected and staff assisted check-in is required.

---

## 2. Firestore Security Rules Posture

The Firestore security rules in `firestore.rules` adhere to a strict **deny-by-default** stance:
- **Attendance Records:** Direct client `create`, `update`, and `delete` operations are completely forbidden (`allow write: if false;`). Sessions can only be created by the server using Firebase Admin SDK.
- **Point Transactions & Balances:** Clients cannot modify `pointsBalance` or write `pointTransactions`.
- **Member Access:** Members can only read their own profile (`resource.data.memberId == request.auth.uid`).
- **Role Elevation:** Members cannot grant themselves admin access or modify their own status.

---

## 3. Secret Management

- **Client Environment:** Only public Firebase variables (`NEXT_PUBLIC_FIREBASE_*`, `NEXT_PUBLIC_APP_URL`) are bundled in the client code.
- **Server Environment:** `FIREBASE_ADMIN_PRIVATE_KEY` and service account credentials remain exclusively on the server and are never exposed to client bundles.
