
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDmt1LTc3f_CBB8pd3viCJLHlQtKVhMEU8",
  authDomain: "redbow-24723.firebaseapp.com",
  projectId: "redbow-24723",
  storageBucket: "redbow-24723.appspot.com",
  messagingSenderId: "322692287326",
  appId: "1:322692287326:web:cda79367be903bd6bb5dcf",
};

interface FirebaseServices {
    app: FirebaseApp;
    auth: Auth;
    db: Firestore;
    storage: FirebaseStorage;
}

let services: FirebaseServices | null = null;

export const getFirebaseServices = (): FirebaseServices => {
    if (services) {
        return services;
    }

    let app: FirebaseApp;
    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApp();
    }

    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);
    
    services = { app, auth, db, storage };
    
    return services;
};
