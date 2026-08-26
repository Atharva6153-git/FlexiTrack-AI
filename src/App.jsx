import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layouts
import RootLayout from './layouts/RootLayout';

// Auth
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TrackSession from './pages/TrackSession';
import History from './pages/History';
import NotFound from './pages/NotFound';
import TherapistPortal from './pages/TherapistPortal';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public routes ─────────────────────────────────────────────── */}
        {/* Landing page — visible to everyone, has its own public navbar   */}
        <Route path="/" element={<Home />} />

        {/* Login / sign-up page                                            */}
        <Route path="/login" element={<Login />} />

        {/* ── Protected app routes ──────────────────────────────────────── */}
        {/* All share RootLayout (sticky nav + user menu + footer).         */}
        {/* Unauthenticated users are redirected to /login.                 */}
        <Route
          element={
            <ProtectedRoute>
              <RootLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="track"     element={<TrackSession />} />
          <Route path="history"   element={<History />} />
          <Route
            path="therapist"
            element={
              <RoleProtectedRoute allowedRole="therapist">
                <TherapistPortal />
              </RoleProtectedRoute>
            }
          />
        </Route>

        {/* 404 catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
