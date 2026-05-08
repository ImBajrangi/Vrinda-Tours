import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDIoifW3DWVeuAHCSZ7sKTNOQYNqIWnznc",
  authDomain: "vihaarvrinda.firebaseapp.com",
  projectId: "vihaarvrinda",
  storageBucket: "vihaarvrinda.firebasestorage.app",
  messagingSenderId: "442553663042",
  appId: "1:442553663042:web:59d884de9738687d1337db",
  measurementId: "G-HBEYR5MSP7"
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
