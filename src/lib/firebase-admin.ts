
import admin from 'firebase-admin';

let adminApp: admin.app.App;

// This function initializes the Firebase Admin SDK.
// It's designed to be run only in a server-side environment.
function initializeAdminApp() {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }
  
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_REDBOW_24723;
  
  if (!serviceAccountString) {
    // Gracefully fail in environments where the secret is not set.
    // This allows the app to build and run locally without crashing.
    console.warn("Firebase Admin SDK not initialized: FIREBASE_SERVICE_ACCOUNT_REDBOW_24723 is not set.");
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

// Initialize and export immediately. This code will only run on the server.
adminApp = initializeAdminApp()!;

const adminAuth = adminApp ? adminApp.auth() : null;
const adminDb = adminApp ? adminApp.firestore() : null;
const adminStorage = adminApp ? adminApp.storage() : null;


export { adminApp, adminAuth, adminDb, adminStorage };
