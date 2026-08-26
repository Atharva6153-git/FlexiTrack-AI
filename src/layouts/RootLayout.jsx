import React from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';

const RootLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      {/* Navigation Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Brand Title */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-extrabold text-blue-700 tracking-tight hover:text-blue-800 transition-colors">
                FlexiTrack AI
              </Link>
            </div>

            {/* Main Navigation */}
            <nav className="hidden md:flex space-x-8">
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'}`}
              >
                Dashboard
              </NavLink>
              <NavLink 
                to="/track" 
                className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'}`}
              >
                Live Workout
              </NavLink>
              <NavLink 
                to="/history" 
                className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'}`}
              >
                Progress History
              </NavLink>
              <NavLink 
                to="/therapist" 
                className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'text-teal-700 bg-teal-50' : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'}`}
              >
                Therapist Portal
              </NavLink>
            </nav>

            {/* Quick Action CTA */}
            <div className="flex items-center">
              <Link 
                to="/track" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold text-sm shadow-md transition-all transform hover:-translate-y-0.5"
              >
                Start Workout
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area via Outlet */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center space-x-6 md:order-2">
              <Link to="/dashboard" className="text-sm text-slate-500 hover:text-slate-900">Dashboard</Link>
              <Link to="/track" className="text-sm text-slate-500 hover:text-slate-900">Live Workout</Link>
              <Link to="/history" className="text-sm text-slate-500 hover:text-slate-900">History</Link>
            </div>
            <div className="mt-8 md:mt-0 md:order-1">
              <p className="text-center text-sm text-slate-500">
                &copy; {new Date().getFullYear()} FlexiTrack AI. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RootLayout;
