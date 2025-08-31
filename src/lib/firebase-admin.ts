
import * as admin from 'firebase-admin';

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!admin.apps.length) {
  if (serviceAccountKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccountKey)),
      });
    } catch (e: any) {
      console.error('Firebase Admin SDK initialization error', e.stack);
    }
  } else {
    console.warn('Firebase Admin SDK not initialized. FIREBASE_SERVICE_ACCOUNT_KEY is not set.');
  }
}

const adminDb = admin.firestore();
export { adminDb };
