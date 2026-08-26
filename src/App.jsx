import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layouts
import RootLayout from './layouts/RootLayout';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import TrackSession from './pages/TrackSession';
import History from './pages/History';
import NotFound from './pages/NotFound';
import TherapistPortal from './pages/TherapistPortal';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Wrap all main routes inside RootLayout */}
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="track" element={<TrackSession />} />
          <Route path="history" element={<History />} />
          <Route path="therapist" element={<TherapistPortal />} />
          
          {/* 404 Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
