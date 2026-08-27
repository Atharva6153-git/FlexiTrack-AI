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

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
const DEFAULT_THERAPIST_ID = 'therapist_default';

/**
 * Ensures a Patient record exists in the backend for this Firebase user.
 * Called after every successful sign-in. Safe to call multiple times because
 * the backend upsert returns the existing record when patientId already exists.
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
    console.error('[AuthContext] POST /api/patients failed:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message,
    });
    throw new Error(`Unable to create your patient profile: ${err.response?.data?.error || err.message}`);
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
          // Prevent race condition: if a sign-up is in progress, skip ensuring record here
          if (localStorage.getItem('is_registering') === 'true') {
            setUser(firebaseUser);
            setLoading(false);
            return;
          }

          let patient = await fetchPatientProfile(firebaseUser);
          if (!patient) {
            patient = await ensurePatientRecord(firebaseUser, 'patient');
          }
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
    localStorage.setItem('is_registering', 'true');
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: name });

      const patient = await ensurePatientRecord({
        uid: credential.user.uid,
        email: credential.user.email,
        displayName: name,
      }, selectedRole);

      localStorage.setItem('ft_login_time', Date.now().toString());
      setRole(patient.role);
      setUser({ ...credential.user, displayName: name });
      return credential;
    } finally {
      localStorage.removeItem('is_registering');
    }
  };

  const loginWithGoogle = async (selectedRole) => {
    localStorage.setItem('is_registering', 'true');
    try {
      const credential = await signInWithPopup(auth, googleProvider);

      let patient = await fetchPatientProfile(credential.user);
      if (!patient) {
        patient = await ensurePatientRecord(credential.user, selectedRole || 'patient');
      }

      localStorage.setItem('ft_login_time', Date.now().toString());
      setRole(patient.role);
      setUser(credential.user);
      return credential;
    } finally {
      localStorage.removeItem('is_registering');
    }
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
