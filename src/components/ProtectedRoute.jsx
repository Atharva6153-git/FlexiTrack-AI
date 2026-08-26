import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps any route that requires authentication.
 * - While Firebase is still resolving the auth state, renders a full-screen
 *   spinner so the page doesn't flash to /login incorrectly.
 * - Once resolved: authenticated → renders children; unauthenticated → /login.
 *   The current location is passed as state so Login can redirect back after
 *   a successful sign-in.
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D9488]" />
          <p className="text-slate-500 font-medium">Loading FlexiTrack AI…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
