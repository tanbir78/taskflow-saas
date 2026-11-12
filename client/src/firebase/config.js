import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Required Firebase environment variables
const required = [
  'API_KEY',
  'AUTH_DOMAIN',
  'PROJECT_ID',
  'APP_ID',
];

// Check for missing or placeholder Firebase configuration
export const missingFirebaseConfig = required.filter((key) => {
  const value = import.meta.env[`VITE_FIREBASE_${key}`];

  return (
    !value ||
    String(value).startsWith('YOUR_')
  );
});

// Initialize Firebase
const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

// Firebase Authentication
export const auth = getAuth(app);

// Google Authentication Provider
export const googleProvider = new GoogleAuthProvider();
