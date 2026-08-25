import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration loaded from environment variables with fallback
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCJ0hHEnPkZikvAXzlB57Q_okiLaw_RwAo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "vrindatours-ddd79.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "vrindatours-ddd79",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "vrindatours-ddd79.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "879482400301",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:879482400301:web:e8cb501bf3fef00b0e52a4",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-31BY4PWQHN"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);

// Initialize Analytics conditionally where supported
export let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

export { firebaseConfig };
export default app;
