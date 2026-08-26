import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Camera, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">

      {/* ── Public Navbar ───────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Brand */}
            <Link
              to="/"
              className="text-2xl font-extrabold text-blue-700 tracking-tight hover:text-blue-800 transition-colors"
            >
              FlexiTrack AI
            </Link>

            {/* Auth CTAs */}
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                state={{ tab: 'login' }}
                className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                state={{ tab: 'signup' }}
                className="px-5 py-2 rounded-lg text-sm font-bold bg-[#0D9488] hover:bg-teal-700 text-white shadow-sm transition-all transform hover:-translate-y-0.5"
              >
                Sign Up Free
              </Link>
            </div>

          </div>
        </div>
      </header>

      {/* ── Page content ────────────────────────────────────────────────── */}
      <main className="flex-grow">
        <div className="flex flex-col space-y-24 py-12 animate-fade-in">

          {/* 1. Hero Section */}
          <section className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto px-4">
            <span className="badge-teal inline-flex items-center gap-2 px-4 py-1.5 text-sm">
              <Activity size={16} />
              AI-Powered Physical Therapy
            </span>

            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Precision Rehabilitation from the{' '}
              <span className="text-[#0F766E]">Comfort of Home</span>
            </h1>

            <p className="text-xl text-slate-500 max-w-2xl leading-relaxed">
              FlexiTrack AI uses your standard device webcam and advanced computer vision
              to track your joint angles in real-time. Perfect your form without expensive
              hardware or wearables.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              {/* Primary CTA → sign-up tab */}
              <Link
                to="/login"
                state={{ tab: 'signup' }}
                className="flex items-center justify-center gap-2 bg-[#0F766E] hover:bg-[#115E59] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Get Started Free
                <ArrowRight size={20} />
              </Link>
              {/* Secondary CTA → sign-in tab */}
              <Link
                to="/login"
                state={{ tab: 'login' }}
                className="flex items-center justify-center gap-2 bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-sm"
              >
                Sign In
                <TrendingUp size={20} />
              </Link>
            </div>
          </section>

          {/* 2. Key Feature Grid */}
          <section className="max-w-6xl mx-auto px-4 w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="clinical-card p-8 flex flex-col items-start text-left space-y-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-teal-50 rounded-xl text-[#0F766E]">
                  <Camera size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Real-Time Pose Estimation</h3>
                <p className="text-slate-500 leading-relaxed">
                  Our computer vision engine tracks your skeletal joint angles live directly
                  in your browser, ensuring your movements are captured instantly.
                </p>
              </div>

              <div className="clinical-card p-8 flex flex-col items-start text-left space-y-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-teal-50 rounded-xl text-[#0F766E]">
                  <Activity size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Form &amp; Angle Feedback</h3>
                <p className="text-slate-500 leading-relaxed">
                  Receive immediate, granular audio and visual guidance correcting your
                  posture mid-rep to maximize gains and prevent re-injury.
                </p>
              </div>

              <div className="clinical-card p-8 flex flex-col items-start text-left space-y-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-teal-50 rounded-xl text-[#0F766E]">
                  <TrendingUp size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Progress Telemetry</h3>
                <p className="text-slate-500 leading-relaxed">
                  Automatic session logging captures your range of motion trends over time,
                  providing undeniable data of your rehabilitation progress.
                </p>
              </div>
            </div>
          </section>

          {/* 3. How It Works */}
          <section className="max-w-5xl mx-auto px-4 w-full text-center space-y-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              How It Works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              <div
                className="hidden md:block absolute top-12 h-0.5 bg-slate-200 z-0"
                style={{ left: '16.6%', right: '16.6%' }}
              />

              <div className="relative z-10 flex flex-col items-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-slate-100 shadow-sm flex items-center justify-center text-3xl font-black text-[#0F766E]">
                  1
                </div>
                <h4 className="text-xl font-bold text-slate-800">Create Account</h4>
                <p className="text-slate-500 max-w-xs">
                  Sign up free with your email or Google account — no credit card required.
                </p>
              </div>

              <div className="relative z-10 flex flex-col items-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-slate-100 shadow-sm flex items-center justify-center text-3xl font-black text-[#0F766E]">
                  2
                </div>
                <h4 className="text-xl font-bold text-slate-800">Position &amp; Track</h4>
                <p className="text-slate-500 max-w-xs">
                  Enable your webcam and stand back. The AI tracks your joints live,
                  counting reps and grading form in real-time.
                </p>
              </div>

              <div className="relative z-10 flex flex-col items-center space-y-4">
                <div className="w-24 h-24 rounded-full border-4 border-[#0F766E] shadow-md flex items-center justify-center text-white bg-[#0F766E]">
                  <CheckCircle2 size={40} />
                </div>
                <h4 className="text-xl font-bold text-slate-800">See Your Progress</h4>
                <p className="text-slate-500 max-w-xs">
                  Sessions are saved automatically. View angle trends and compliance
                  reports on your personal dashboard.
                </p>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="pt-4">
              <Link
                to="/login"
                state={{ tab: 'signup' }}
                className="inline-flex items-center gap-2 bg-[#0F172A] hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Start Your Rehabilitation Today
                <ArrowRight size={20} />
              </Link>
            </div>
          </section>

        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center space-x-6 md:order-2">
              <Link to="/login" state={{ tab: 'login' }}  className="text-sm text-slate-500 hover:text-slate-900">Sign In</Link>
              <Link to="/login" state={{ tab: 'signup' }} className="text-sm text-slate-500 hover:text-slate-900">Sign Up</Link>
            </div>
            <p className="mt-8 md:mt-0 md:order-1 text-center text-sm text-slate-500">
              &copy; {new Date().getFullYear()} FlexiTrack AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;
