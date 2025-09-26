// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration object
// Bu bilgileri Firebase Console'dan alacaksınız
const firebaseConfig = {
  apiKey: "AIzaSyApVaWvKLRFxZvgWSjlvSN9edE0fC2Wryo",
  authDomain: "weeklylesson-7272c.firebaseapp.com",
  projectId: "weeklylesson-7272c",
  storageBucket: "weeklylesson-7272c.firebasestorage.app",
  messagingSenderId: "159028069855",
  appId: "1:159028069855:web:a0509e7ebba01fde45b06a",
  measurementId: "G-P7N3MXN19M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
