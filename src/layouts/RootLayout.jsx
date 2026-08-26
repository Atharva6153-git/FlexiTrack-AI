import React, { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RootLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  // User initials for the avatar fallback
  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">

      {/* Navigation Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Brand — links to landing page */}
            <div className="flex-shrink-0 flex items-center">
              <Link
                to="/"
                className="text-2xl font-extrabold text-blue-700 tracking-tight hover:text-blue-800 transition-colors"
              >
                FlexiTrack AI
              </Link>
            </div>

            {/* Main Navigation */}
            <nav className="hidden md:flex space-x-1">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/track"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`
                }
              >
                Live Workout
              </NavLink>
              <NavLink
                to="/history"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`
                }
              >
                Progress History
              </NavLink>
              <NavLink
                to="/therapist"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'text-teal-700 bg-teal-50' : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'
                  }`
                }
              >
                Therapist Portal
              </NavLink>
            </nav>

            {/* User menu */}
            <div className="relative flex items-center">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                aria-label="User menu"
                aria-expanded={menuOpen}
              >
                {/* Avatar: photo if available, else coloured initials */}
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName ?? 'User'}
                    className="w-8 h-8 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-[#0D9488] text-white text-xs font-extrabold flex items-center justify-center">
                    {initials}
                  </span>
                )}
                <span className="hidden sm:block text-sm font-semibold text-slate-700 max-w-[120px] truncate">
                  {user?.displayName ?? user?.email?.split('@')[0]}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <>
                  {/* Click-away backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-slate-200 shadow-lg z-50 overflow-hidden">
                    {/* Identity summary */}
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {user?.displayName ?? 'User'}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center space-x-6 md:order-2">
              <Link to="/dashboard" className="text-sm text-slate-500 hover:text-slate-900">Dashboard</Link>
              <Link to="/history"   className="text-sm text-slate-500 hover:text-slate-900">History</Link>
              <Link to="/therapist" className="text-sm text-slate-500 hover:text-slate-900">Therapist Portal</Link>
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
