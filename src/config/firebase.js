import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, browserSessionPersistence, setPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            "AIzaSyBqRsXxeuYNeNpxWe3pJrDL5_ZqPZpVPGY",
  authDomain:        "flexitrack-ai.firebaseapp.com",
  projectId:         "flexitrack-ai",
  storageBucket:     "flexitrack-ai.firebasestorage.app",
  messagingSenderId: "673246563897",
  appId:             "1:673246563897:web:6126b612ed5d61bc73c7e8",
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
