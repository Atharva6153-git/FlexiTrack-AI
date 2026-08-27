import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, browserSessionPersistence, setPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBqRsXxeuYNeNpxWe3pJrDL5_ZqPZpVPGY",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "flexitrack-ai.firebaseapp.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID || "flexitrack-ai",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "flexitrack-ai.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "673246563897",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID || "1:673246563897:web:6126b612ed5d61bc73c7e8",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Keep the user logged in for the browser session.
// Firebase tokens expire after 1 hour but are auto-refreshed while the tab
// is open. We use LOCAL persistence (the default) so the session survives
// page refreshes and browser restarts — the user stays logged in until they
// explicitly sign out or the refresh token expires (~24h of inactivity is
// enforced by setting a custom session expiry in AuthContext).
// No extra call needed here — LOCAL is already the default.
