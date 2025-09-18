
import * as admin from 'firebase-admin';

let adminApp: admin.app.App | null = null;

export async function initAdmin() {
  if (adminApp) {
    return adminApp;
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : null;

  if (!serviceAccount) {
    throw new Error('Firebase service account credentials are not set in the environment variables.');
  }
  
  try {
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    }, 'adminApp' + Date.now()); // Unique name to avoid re-initialization errors
  } catch (error: any) {
    if (error.code === 'app/duplicate-app') {
       console.warn('Firebase admin app already initialized.');
       adminApp = admin.app('adminApp');
    } else {
        console.error('Firebase admin initialization error:', error);
        throw error;
    }
  }

  return adminApp;
}
