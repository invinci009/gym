# FIT FIBER GYM — Deployment Guide

## 1. Firebase Project Setup

1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com) named `fitfiber-gym`.
2. Enable **Authentication** (Email/Password provider).
3. Create a **Cloud Firestore** database (Production mode) in region `asia-south1` (Mumbai) or nearest to Patna.
4. Generate a Firebase Admin Service Account key:
   - Navigate to **Project Settings** > **Service accounts**.
   - Click **Generate new private key** and save the JSON file securely.

---

## 2. Deploying Firestore Security Rules & Indexes

Using the Firebase CLI:
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Set active project
firebase use fitfiber-gym

# Deploy security rules and composite indexes
firebase deploy --only firestore:rules,firestore:indexes
```

---

## 3. Deploying Cloud Functions (Optional)

If running the standalone Firebase Cloud Functions package:
```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

---

## 4. Deploying Next.js Application on Vercel

1. Import the repository into your Vercel team dashboard.
2. Configure the following environment variables in Vercel Project Settings:

```env
# Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=fitfiber-gym.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=fitfiber-gym
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=fitfiber-gym.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_APP_URL=https://fitfibergym.com
NEXT_PUBLIC_DEFAULT_GYM_ID=fit-fiber-gym

# Server-Only Configuration
FIREBASE_ADMIN_PROJECT_ID=fitfiber-gym
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@fitfiber-gym.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GYM_DEFAULT_TIMEZONE=Asia/Kolkata
```

3. Deploy! Vercel will build the Next.js App Router application and serve API routes as edge/serverless functions using the Firebase Admin SDK.

---

## 5. Administrator Provisioning

To assign administrator privileges to staff:
1. Register or invite the administrator email (e.g., `admin@fitfiber.com`).
2. Set custom user claims via Firebase Admin SDK or add their UID to `/gyms/fit-fiber-gym/admins/{adminUid}`.
3. The user can now access all administrative routes under `/admin`.
