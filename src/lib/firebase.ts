// firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyB-McRG2QbzY3Wxw7kUM952H36ySz93-do",
    authDomain: "white-watch-432307-a2.firebaseapp.com",
    databaseURL: "https://white-watch-432307-a2-default-rtdb.firebaseio.com",
    projectId: "white-watch-432307-a2",
    storageBucket: "white-watch-432307-a2.appspot.com",
    messagingSenderId: "556799467654",
    appId: "1:556799467654:web:1d9e0baad766f7788ab107"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const storage = getStorage(app);
export const database = getDatabase(app);

// Initialize provider
export const googleProvider = new GoogleAuthProvider();

export default app;