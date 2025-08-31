
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
    // This is for local development with emulators
    // and for environments where GOOGLE_APPLICATION_CREDENTIALS is set.
    admin.initializeApp();
    console.log("Initialized Firebase Admin with default credentials.");
  }
}

export const adminDb = admin.firestore();
