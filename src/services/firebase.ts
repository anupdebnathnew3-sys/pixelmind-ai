import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const apiKey     = import.meta.env.VITE_FIREBASE_API_KEY;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const projectId  = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const appId      = import.meta.env.VITE_FIREBASE_APP_ID;

export const firebaseReady = !!(apiKey && authDomain && projectId && appId);

// Only initialize Firebase when all config values are present.
// Without this guard, initializeApp throws at module load time and
// crashes the entire app with a blank page.
export const auth = firebaseReady
  ? getAuth(initializeApp({ apiKey, authDomain, projectId, appId }))
  : null;

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
