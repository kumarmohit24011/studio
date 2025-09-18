

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage, connectStorageEmulator } from 'firebase/storage';
import { firebase } from 'firebase/app';
import 'firebase/auth';
import 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDmt1LTc3f_CBB8pd3viCJLHlQtKVhMEU8",
  authDomain: "redbow-24723.firebaseapp.com",
  projectId: "redbow-24723",
  storageBucket: "redbow-24723.appspot.com",
  messagingSenderId: "322692287326",
  appId: "1:322692287326:web:cda79367be903bd6bb5dcf",
};

// Initialize Firebase
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

// Auth-gated storage instance
const storage: FirebaseStorage = getStorage(app, `gs://${firebaseConfig.storageBucket}`);

// For local development, you might want to connect to the emulator
// if (process.env.NODE_ENV === 'development') {
//   connectStorageEmulator(storage, "localhost", 9199);
// }


export { app, auth, db, storage };
