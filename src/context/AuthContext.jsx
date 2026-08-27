import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import axios from 'axios';
import { auth, googleProvider } from '../config/firebase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const DEFAULT_THERAPIST_ID = 'therapist_default';

/**
 * Ensures a Patient record exists in the backend for this Firebase user.
 * Called after every successful sign-in. Safe to call multiple times —
 * the backend returns 400 on duplicate patientId, which we silently ignore.
 */
const ensurePatientRecord = async (firebaseUser, selectedRole = 'patient') => {
  const requestBody = {
    patientId: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
    role: selectedRole,
    therapistId: DEFAULT_THERAPIST_ID,
  };

  console.log('[AuthContext] POST /api/patients request body:', requestBody);
  try {
    const response = await axios.post(`${API_URL}/api/patients`, requestBody);
    return response.data;
  } catch (err) {
    console.error('[AuthContext] POST /api/patients error response:', err.response?.data);
    // 400 = patient already exists — that's fine, nothing to do
    if (err?.response?.status !== 400) {
      console.error('[AuthContext] ensurePatientRecord failed:', err.message);
    }
    return null;
  }
};

const fetchPatientProfile = async (firebaseUser) => {
  try {
    const response = await axios.get(`${API_URL}/api/patients/${firebaseUser.uid}`);
    return response.data;
  } catch (err) {
    console.error('[AuthContext] fetchPatientProfile failed:', err.message);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [role, setRole]       = useState('patient');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const loginTime = localStorage.getItem('ft_login_time');
        const now = Date.now();
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

        if (loginTime && now - parseInt(loginTime, 10) > TWENTY_FOUR_HOURS) {
          signOut(auth);
          localStorage.removeItem('ft_login_time');
          setUser(false);
        } else {
          // Ensure the backend Patient record exists (no-op if already created)
          const createdPatient = await ensurePatientRecord(firebaseUser);
          const patient = createdPatient || await fetchPatientProfile(firebaseUser);
          setRole(patient?.role || 'patient');
          setUser(firebaseUser);
        }
      } else {
        setUser(false);
        setRole('patient');
      }
      setLoading(false);
    }, (error) => {
      console.error('[AuthContext] onAuthStateChanged error:', error.code, error.message);
      setUser(false);
      setRole('patient');
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithEmail = (email, password) => {
    localStorage.setItem('ft_login_time', Date.now().toString());
    return signInWithEmailAndPassword(auth, email, password);
  };

  const registerWithEmail = async (name, email, password, selectedRole) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });
    localStorage.setItem('ft_login_time', Date.now().toString());
    // Pass the updated user object (with displayName) to ensurePatientRecord
    const patient = await ensurePatientRecord({
      uid: credential.user.uid,
      email: credential.user.email,
      displayName: name,
    }, selectedRole);
    setRole(patient?.role || 'patient');
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
    role,
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
