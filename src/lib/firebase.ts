
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// Your web app's Firebase configuration from your new project.
const firebaseConfig = {
  apiKey: "AIzaSyDmt1LTc3f_CBB8pd3viCJLHlQtKVhMEU8",
  authDomain: "redbow-24723.firebaseapp.com",
  projectId: "redbow-24723",
  storageBucket: "redbow-24723.appspot.com",
  messagingSenderId: "322692287326",
  appId: "1:322692287326:web:cda79367be903bd6bb5dcf",
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

// Initialize Firebase
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

auth = getAuth(app);
db = getFirestore(app);
storage = getStorage(app);

export { app, auth, db, storage };
