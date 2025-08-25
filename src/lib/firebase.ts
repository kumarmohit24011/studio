import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    "projectId": "redbow-52rrw",
    "appId": "1:1045614935651:web:0b02a19b42446f3e990256",
    "storageBucket": "redbow-52rrw.appspot.com",
    "apiKey": "AIzaSyB-MIuClST05XaYywlc-Gr5e2KRrIcyLlg",
    "authDomain": "redbow-52rrw.firebaseapp.com",
    "messagingSenderId": "1045614935651"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);

export { app, auth };
