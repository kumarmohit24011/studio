
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

let app;
let auth;
let db;
let storage;

try {
    // Check if all required environment variables are set.
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      throw new Error("Missing Firebase configuration. Please make sure all required environment variables (especially NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID) are set in your .env file.");
    }
    
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

} catch (error) {
    console.warn("FIREBASE INITIALIZATION ERROR:", error);
    // Assign null or mock objects if initialization fails
    // This allows the app to run without crashing, but Firebase features will be disabled.
    app = null;
    auth = null;
    db = null;
    storage = null;
}


export { app, auth, db, storage };
