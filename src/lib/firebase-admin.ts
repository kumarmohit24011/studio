
import admin from 'firebase-admin';

// This function initializes the Firebase Admin SDK.
// It's designed to be run only in a server-side environment.
function initializeAdminApp() {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }
  
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_REDBOW_24723;
  
  if (!serviceAccountString) {
    // This will cause an error in environments that need it, which is the correct behavior.
    // We log a warning for easier debugging during development if the env var is missing.
    console.warn("Firebase Admin SDK service account not found in environment variables. Server-side features requiring admin privileges will fail.");
    return null;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountString);

    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch (error) {
    console.error(`Firebase admin initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

// Initialize and export. This code will only run on the server.
const adminApp = initializeAdminApp();
const adminAuth = adminApp ? admin.auth() : null;
const adminDb = adminApp ? admin.firestore() : null;
const adminStorage = adminApp ? admin.storage() : null;


export { adminApp, adminAuth, adminDb, adminStorage };
