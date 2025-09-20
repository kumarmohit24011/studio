
import admin from 'firebase-admin';

let adminApp: admin.app.App;
let adminAuth: admin.auth.Auth;
let adminDb: admin.firestore.Firestore;
let adminStorage: admin.storage.Storage;

try {
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_REDBOW_24723;
  if (serviceAccountString) {
    if (admin.apps.length === 0) {
        const serviceAccount = JSON.parse(serviceAccountString);
        adminApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
    } else {
        adminApp = admin.apps[0]!;
    }
    
    adminAuth = admin.auth();
    adminDb = admin.firestore();
    adminStorage = admin.storage();
  } else {
      console.warn("Firebase Admin SDK service account not found in environment variables. Server-side admin features will be disabled in local development.");
  }
} catch (error) {
  console.error("Firebase Admin SDK initialization error:", error);
}

// @ts-ignore
export { adminApp, adminAuth, adminDb, adminStorage };
