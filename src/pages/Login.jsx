import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Mail, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';

// Friendly messages for Firebase error codes
const FIREBASE_ERRORS = {
  'auth/user-not-found':       'No account found with that email.',
  'auth/wrong-password':       'Incorrect password. Please try again.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password':        'Password must be at least 6 characters.',
  'auth/invalid-email':        'Please enter a valid email address.',
  'auth/too-many-requests':    'Too many attempts. Please wait a moment.',
  'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
  'auth/invalid-credential':   'Incorrect email or password.',
};

const errorMessage = (err) =>
  FIREBASE_ERRORS[err?.code] ?? err?.message ?? 'Something went wrong. Please try again.';

const Login = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth();

  // Redirect back to where the user was trying to go, or /dashboard
  const from = location.state?.from?.pathname ?? '/dashboard';

  const [tab, setTab]             = useState(location.state?.tab === 'signup' ? 'signup' : 'login');
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => { setError(''); setName(''); setEmail(''); setPassword(''); };

  const switchTab = (t) => { setTab(t); reset(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (tab === 'login') {
        await loginWithEmail(email, password);
      } else {
        if (!name.trim()) { setError('Please enter your full name.'); setIsSubmitting(false); return; }
        await registerWithEmail(name.trim(), email, password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* Minimal header — brand only, no nav links */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link to="/" className="text-2xl font-extrabold text-blue-700 tracking-tight hover:text-blue-800 transition-colors">
            FlexiTrack AI
          </Link>
        </div>
      </header>

      {/* Page body */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

            {/* Brand hero strip */}
            <div className="bg-gradient-to-br from-[#0F172A] to-[#1E3A5F] px-8 py-8 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 mb-4">
                <Activity size={28} className="text-white" />
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">FlexiTrack AI</h1>
              <p className="text-slate-300 text-sm mt-1 font-medium">AI-Powered Physical Rehabilitation</p>
            </div>

            {/* Tab switcher */}
            <div className="flex border-b border-slate-100">
              {['login', 'signup'].map((t) => (
                <button
                  key={t}
                  onClick={() => switchTab(t)}
                  className={`flex-1 py-3.5 text-sm font-bold transition-colors ${
                    tab === t
                      ? 'text-[#0D9488] border-b-2 border-[#0D9488] bg-teal-50/40'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {t === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            <div className="p-8 space-y-5">

              {/* Error banner */}
              {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Google button */}
              <button
                onClick={handleGoogle}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {/* Google SVG logo */}
                <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {/* Email / Password form */}
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Name — sign-up only */}
                {tab === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jane Smith"
                        required
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] bg-slate-50 transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] bg-slate-50 transition-colors"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={tab === 'signup' ? 'At least 6 characters' : '••••••••'}
                      required
                      autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
                      className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] bg-slate-50 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#0D9488] hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    tab === 'login' ? 'Sign In' : 'Create Account'
                  )}
                </button>
              </form>

              {/* Footer hint */}
              <p className="text-center text-xs text-slate-400 pt-2">
                {tab === 'login' ? (
                  <>Don't have an account?{' '}
                    <button onClick={() => switchTab('signup')} className="text-[#0D9488] font-bold hover:underline">
                      Sign up free
                    </button>
                  </>
                ) : (
                  <>Already have an account?{' '}
                    <button onClick={() => switchTab('login')} className="text-[#0D9488] font-bold hover:underline">
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            &copy; {new Date().getFullYear()} FlexiTrack AI. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
