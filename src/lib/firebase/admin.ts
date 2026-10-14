import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';

let adminApp: App | null = null;
let adminDb: Firestore | null = null;
let adminAuth: Auth | null = null;
let isConfigured = false;

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

const apps = getApps();

// Check for service-account.json file
const serviceAccountPath = path.join(process.cwd(), 'service-account.json');
let serviceAccount: any = null;
if (fs.existsSync(serviceAccountPath)) {
  try {
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  } catch {
    // ignore
  }
}

if (apps.length > 0) {
  adminApp = apps[0];
  adminDb = getFirestore(adminApp);
  adminAuth = getAuth(adminApp);
  isConfigured = true;
} else if (serviceAccount) {
  try {
    adminApp = initializeApp({
      credential: cert(serviceAccount),
    });
    adminDb = getFirestore(adminApp);
    adminAuth = getAuth(adminApp);
    isConfigured = true;
  } catch (e) {
    console.warn('Firebase Admin SDK service-account.json initialization warning:', e);
  }
} else if (projectId && clientEmail && privateKey) {
  try {
    adminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    adminDb = getFirestore(adminApp);
    adminAuth = getAuth(adminApp);
    isConfigured = true;
  } catch (e) {
    console.warn('Firebase Admin SDK manual credential initialization warning:', e);
  }
} else {
  try {
    adminApp = initializeApp();
    adminDb = getFirestore(adminApp);
    adminAuth = getAuth(adminApp);
    isConfigured = true;
  } catch {
    isConfigured = false;
  }
}

export const isAdminConfigured = isConfigured;
export { adminApp, adminDb, adminAuth };
