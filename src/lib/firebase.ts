
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// This function initializes and returns the client-side Firebase app instance.
// It ensures that we don't try to re-initialize the app on the client.
function initializeClientApp(): FirebaseApp {
    if (getApps().length) {
        return getApp();
    }
    return initializeApp(firebaseConfig);
}

// These are EXCLUSIVELY for client-side use.
// They will throw an error if used in a server-only environment without a browser context.
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

// We only initialize these if we are in a browser environment.
if (typeof window !== 'undefined') {
    app = initializeClientApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app, `gs://${firebaseConfig.storageBucket}`);
}

// We export the initialized services for client-side usage.
// @ts-ignore - These will be initialized on the client, this silences the build-time error.
export { app, auth, db, storage };
