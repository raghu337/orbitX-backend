import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

// Fallback Firebase configuration for OrbitX
const firebaseConfig = {
  apiKey: "AIzaSyFakeKeyOrbitX123456789",
  authDomain: "orbit-x-43dc3.firebaseapp.com",
  databaseURL: "https://orbit-x-43dc3-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "orbit-x-43dc3",
  storageBucket: "orbit-x-43dc3.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, onValue };
