# FIT FIBER GYM — Attendance, Streak Tracking & Loyalty Rewards Platform

**Official Production-Minded Web Application for FIT FIBER GYM**  
📍 *1st Floor, Alam Market, Phulwari Sharif, Patna, Bihar 801505*  
🛰 *Coordinates: 25.577244522059356, 85.0687193399421*  

---

## 1. Product Overview

FIT FIBER GYM is a static-QR-based gym attendance, streak tracking, and loyalty rewards application designed for single-gym operations. 

Members record attendance by scanning a **permanent printed QR code** affixed to the gym walls. The server validates attendance dynamically using geographic proximity (Haversine formula on Patna coordinates), server-side active membership validation, duplicate-session prevention, and an authoritative 30-day streak inactivity engine.

### Key Capabilities
- **Permanent Static Wall QR Code:** Printed once on gym walls. Does not rotate or expire. URL format: `https://YOUR_DOMAIN.com/check-in/fit-fiber-gym`.
- **Mandatory Location Verification:** Calculates distance on the server against gym coordinates (`25.577244522059356, 85.0687193399421`) with a configurable 75-meter boundary.
- **30-Day Inactivity Window Streak Engine:** A member's streak increments with each qualifying day and only resets to 1 if 30 complete consecutive days pass without a visit. Taking rest days does not break the streak.
- **Atomic Points Ledger:** 10 points awarded for the first qualifying visit per calendar day (`Asia/Kolkata` timezone). Milestone bonuses unlocked at 7, 14, 30, 60, and 100 days.
- **Rewards Catalogue:** Direct redemption for protein shakes, shaker bottles, gym towels, personal training sessions, and membership discounts.
- **Administrative Command Center (`/admin`):** Live attendance monitor, audited attendance corrections with mandatory reasons, member management (activation/suspension/expiry), Wall QR poster generator & high-res print layout, and operational compliance reports.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js 16 (App Router) & React 19 |
| **Language** | TypeScript (Strict Mode) |
| **Styling** | Tailwind CSS v4 & Athletic Dark UI with Glassmorphism |
| **Authentication** | Firebase Authentication |
| **Database** | Cloud Firestore |
| **Backend & Privileged Logic** | Firebase Cloud Functions & Next.js API Routes (Firebase Admin SDK) |
| **QR Generation & Scanning** | `qrcode` & `html5-qrcode` |
| **Icons & Micro-animations** | `lucide-react` & `canvas-confetti` |
| **Testing** | Vitest (26 unit and integration tests) |

---

## 3. Quick Start & Local Development

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x

### Installation
```bash
git clone <repo-url>
cd gym
npm install
```

### Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
The application comes preconfigured for **FIT FIBER GYM** with local sandbox fallback enabled (`ENABLE_DEMO_MOCK_FALLBACK=true`), allowing full offline preview and testing.

### Running Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Test Suite
```bash
npm test
```
Executes all 26 unit and integration test suites covering Haversine distance calculations, 30-day inactivity streak policies, points ledger atomicity, and attendance security constraints.

### Production Build
```bash
npm run build
```

---

## 4. Test Personas & Quick Switcher

For evaluation and demonstration, the top navigation includes a **1-Click Test Persona Switcher**:
1. **Coach Aman (Gym Owner / Admin):** `admin@fitfiber.com` → Accesses `/admin` overview, member approvals, attendance correction audit, and rules configuration.
2. **Rahul Sharma (Active Member):** `rahul@gmail.com` → 8-Day streak, 240 loyalty points, active membership.
3. **Priya Singh (Streak Veteran):** `priya@gmail.com` → 29-Day streak, 650 loyalty points.
4. **Vikram Kumar (Suspended Account):** `vikram@gmail.com` → Tests server rejection of suspended memberships.

---

## 5. Documentation Links
- [Architecture Specifications](docs/ARCHITECTURE.md)
- [Security Model & Anti-Fraud Policy](docs/SECURITY.md)
- [Deployment Guide (Vercel & Firebase)](docs/DEPLOYMENT.md)
- [Testing & Acceptance Matrix](docs/TESTING.md)
