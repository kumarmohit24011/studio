
'use server';

import admin from 'firebase-admin';

const getAdminApp = (): admin.app.App => {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  try {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_REDBOW_24723 || process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (!serviceAccountString) {
      throw new Error('Firebase service account credentials are not set. Please set GOOGLE_APPLICATION_CREDENTIALS_JSON or FIREBASE_SERVICE_ACCOUNT.');
    }

    const serviceAccount = JSON.parse(serviceAccountString);

    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
    // In case of error, we must not proceed.
    // Re-throwing the error to make it visible during development.
    throw new Error(`Firebase admin initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const adminApp = getAdminApp();
const adminAuth = admin.auth(adminApp);
const adminDb = admin.firestore(adminApp);
const adminStorage = admin.storage(adminApp);

export { adminApp, adminAuth, adminDb, adminStorage };
