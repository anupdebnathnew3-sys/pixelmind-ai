/**
 * Real-time CMS sync via Firebase Firestore.
 *
 * How it works:
 *  - Admin makes any change in the Admin Panel
 *  - Change is written to Firestore document `pixelmind/settings`
 *  - All connected browsers receive the update via onSnapshot in < 1 second
 *  - No page reload, no redeploy, no cache clearing needed
 *
 * Security note: systemApiKeys are excluded from Firestore (kept in env vars).
 */

import {
  doc, setDoc, onSnapshot, Unsubscribe, Firestore
} from 'firebase/firestore';
import { db, firebaseReady } from './firebase';

const COLLECTION = 'pixelmind';
const DOCUMENT   = 'settings';

// Prevent write-back loops when we receive a Firestore update
let receivingFromFirestore = false;

// Debounce timer for writes (avoid hitting Firestore on every keystroke)
let writeTimer: ReturnType<typeof setTimeout> | null = null;

// Fields excluded from Firestore (sensitive or internal)
const EXCLUDED_FIELDS = new Set([
  'systemApiKeys',
  'adminUsers',
  'adminSubscriptions',
  '_hasHydrated',
  'version',
]);

// ─── Write ────────────────────────────────────────────────────────────────────

export function pushSettingsToFirestore(state: Record<string, unknown>): void {
  if (!firebaseReady || !db || receivingFromFirestore) return;

  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = setTimeout(async () => {
    try {
      const payload: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(state)) {
        if (!EXCLUDED_FIELDS.has(key)) payload[key] = value;
      }
      await setDoc(
        doc(db as Firestore, COLLECTION, DOCUMENT),
        payload,
        { merge: true }
      );
    } catch (err) {
      // Silently fail — local state is still intact
      console.warn('[CMS] Firestore write failed:', err);
    }
  }, 800); // 800ms debounce — batches rapid changes
}

// ─── Listen ───────────────────────────────────────────────────────────────────

export function initFirestoreSync(
  onUpdate: (data: Record<string, unknown>) => void
): Unsubscribe {
  if (!firebaseReady || !db) return () => {};

  return onSnapshot(
    doc(db as Firestore, COLLECTION, DOCUMENT),
    (snap) => {
      if (!snap.exists()) return;
      receivingFromFirestore = true;
      onUpdate(snap.data() as Record<string, unknown>);
      // Reset flag after the store has processed the update
      setTimeout(() => { receivingFromFirestore = false; }, 50);
    },
    (err) => {
      console.warn('[CMS] Firestore listener error:', err);
    }
  );
}

export { receivingFromFirestore };
