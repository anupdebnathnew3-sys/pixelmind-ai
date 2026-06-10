import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const apiKey     = import.meta.env.VITE_FIREBASE_API_KEY;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const projectId  = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const appId      = import.meta.env.VITE_FIREBASE_APP_ID;

export const firebaseReady = !!(apiKey && authDomain && projectId && appId);

// Single app instance shared by Auth, Firestore, and Storage
const app: FirebaseApp | null = firebaseReady
  ? initializeApp({ apiKey, authDomain, projectId, appId })
  : null;

export const auth = app ? getAuth(app) : null;
export const db   = app ? getFirestore(app) : null;

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
