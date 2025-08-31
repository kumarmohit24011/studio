
import * as admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    // This fallback is for environments where the service account key isn't set.
    // It's better to ensure the environment variable is always available.
    console.warn("Firebase Admin SDK not initialized. Missing FIREBASE_SERVICE_ACCOUNT_KEY. Server-side Firebase operations will fail.");
  }
}

// Check if the app was initialized before exporting db
const adminDb = admin.apps.length ? admin.firestore() : null;

export { adminDb };
