
import admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors
if (!admin.apps.length) {
  try {
    console.log('Initializing Firebase Admin SDK...');
    const serviceAccountString = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (!serviceAccountString) {
      throw new Error('Firebase service account credentials are not set. Please set GOOGLE_APPLICATION_CREDENTIALS_JSON or FIREBASE_SERVICE_ACCOUNT.');
    }

    const serviceAccount = JSON.parse(serviceAccountString);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
     console.log('Firebase Admin SDK initialized successfully.');
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
    // You might want to throw the error in a real app to fail fast
  }
}

const adminApp = admin.app();
const adminAuth = admin.auth();
const adminDb = admin.firestore();
const adminStorage = admin.storage();

export { adminApp, adminAuth, adminDb, adminStorage };
