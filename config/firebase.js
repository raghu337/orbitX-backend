import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

// Fallback Firebase configuration for OrbitX
const firebaseConfig = {
  apiKey: "AIzaSyFakeKeyOrbitX123456789",
  authDomain: "orbitx-firebase.firebaseapp.com",
  databaseURL: "https://orbitx-firebase-default-rtdb.firebaseio.com",
  projectId: "orbitx-firebase",
  storageBucket: "orbitx-firebase.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, onValue };
