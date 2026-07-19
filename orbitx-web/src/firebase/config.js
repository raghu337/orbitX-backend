import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase, ref, onValue, set } from 'firebase/database';

// Firebase configuration placeholder for OrbitX Web Application
// Replace these parameters with your active academic credentials
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY_PLACEHOLDER",
  authDomain: "orbit-x-43dc3.firebaseapp.com",
  databaseURL: "https://orbit-x-43dc3-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "orbit-x-43dc3",
  storageBucket: "orbit-x-43dc3.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
const db = getFirestore(app);             // Cloud Firestore Database
const rtdb = getDatabase(app);            // Realtime Database for active telemetry

export { app, db, rtdb, ref, onValue, set };
