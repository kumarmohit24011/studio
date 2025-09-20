
import admin from 'firebase-admin';

// A flag to ensure we only initialize once
let adminApp: admin.app.App | null = null;

const getAdminApp = (): admin.app.App | null => {
  // If we're clearly in a browser environment, don't even try.
  if (typeof window !== 'undefined') {
    return null;
  }
  
  // If the app is already initialized, return it
  if (adminApp) {
    return adminApp;
  }

  // Check if we're in a server-side environment with credentials.
  const isProductionEnvironment = !!process.env.CI || !!process.env.VERCEL || !!process.env.FIREBASE_CONFIG;
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_REDBOW_24723;
  
  if (!isProductionEnvironment) {
    console.warn("[Firebase Admin] Not in a known production/CI environment. Skipping Admin SDK initialization.");
    return null;
  }

  if (admin.apps.length > 0) {
    adminApp = admin.apps[0]!;
    return adminApp;
  }
  
  try {
    if (!serviceAccountString) {
      throw new Error('Firebase service account credentials are not set in the environment variable FIREBASE_SERVICE_ACCOUNT_REDBOW_24723.');
    }

    const serviceAccount = JSON.parse(serviceAccountString);

    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
    
    return adminApp;

  } catch (error) {
    console.error(`Firebase admin initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw new Error(`Firebase admin initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Initialize and export immediately
const app = getAdminApp();
const adminAuth = app ? app.auth() : null;
const adminDb = app ? app.firestore() : null;
const adminStorage = app ? app.storage() : null;

export { app as adminApp, adminAuth, adminDb, adminStorage };
