import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    "projectId": "redbow-52rrw",
    "appId": "1:1045614935651:web:0b02a19b42446f3e990256",
    "storageBucket": "redbow-52rrw.firebasestorage.app",
    "apiKey": "AIzaSyB-MIuClST05XaYywlc-Gr5e2KRrIcyLlg",
    "authDomain": "redbow-52rrw.firebaseapp.com",
    "messagingSenderId": "1045614935651"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
