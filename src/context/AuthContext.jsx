import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  // null  = still checking Firebase (show splash / nothing)
  // false = checked, not logged in
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Enforce 24-hour session: check when they logged in
        const loginTime = localStorage.getItem('ft_login_time');
        const now = Date.now();
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

        if (loginTime && now - parseInt(loginTime, 10) > TWENTY_FOUR_HOURS) {
          // Session expired — sign out silently
          signOut(auth);
          localStorage.removeItem('ft_login_time');
          setUser(false);
        } else {
          setUser(firebaseUser);
        }
      } else {
        setUser(false);
      }
      setLoading(false);
    }, (error) => {
      console.error('[AuthContext] onAuthStateChanged error:', error.code, error.message);
      setUser(false);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithEmail = (email, password) => {
    localStorage.setItem('ft_login_time', Date.now().toString());
    return signInWithEmailAndPassword(auth, email, password);
  };

  const registerWithEmail = async (name, email, password) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });
    localStorage.setItem('ft_login_time', Date.now().toString());
    setUser({ ...credential.user, displayName: name });
    return credential;
  };

  const loginWithGoogle = () => {
    localStorage.setItem('ft_login_time', Date.now().toString());
    return signInWithPopup(auth, googleProvider);
  };

  const logout = () => {
    localStorage.removeItem('ft_login_time');
    return signOut(auth);
  };

  const value = {
    user,
    loading,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
