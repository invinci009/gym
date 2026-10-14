import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let adminApp: App | null = null;
let adminDb: Firestore | null = null;
let adminAuth: Auth | null = null;
let isConfigured = false;

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

const apps = getApps();

if (apps.length > 0) {
  adminApp = apps[0];
  adminDb = getFirestore(adminApp);
  adminAuth = getAuth(adminApp);
  isConfigured = true;
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
