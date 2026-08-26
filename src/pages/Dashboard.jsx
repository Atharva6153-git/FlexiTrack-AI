import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, CheckCircle2, TrendingUp, Calendar, ArrowRight, ShieldCheck, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedExercise, setSelectedExercise] = useState('BICEP_CURL');

  // Use Firebase UID as patientId
  const patientId = user?.uid;
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [recentSessions, setRecentSessions] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [allSessions, setAllSessions] = useState([]);

  const displayName = user?.displayName ?? user?.email?.split('@')[0] ?? 'there';

  useEffect(() => {
    if (!patientId) return;
    const fetchData = async () => {
      try {
        const patientRes = await axios.get(`${API_URL}/api/patients/${patientId}`);
        setPrescriptions(patientRes.data.prescriptions || []);
        if (patientRes.data.prescriptions?.length > 0) {
          setSelectedExercise(patientRes.data.prescriptions[0].exerciseType);
        }

        const sessionRes = await axios.get(`${API_URL}/api/sessions/patient/${patientId}`);
        const sessions = sessionRes.data;
        setAllSessions(sessions);
        setRecentSessions(sessions.slice(0, 3));
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      }
    };
    fetchData();
  }, [patientId, API_URL]);

  // Compute live stats from real sessions
  const totalSessions = allSessions.length;
  const peakAngle = allSessions.length > 0
    ? Math.max(...allSessions.map(s => s.maxFlexionAngle || 0))
    : 0;
  const sessionsWithScore = allSessions.filter(s => s.formAccuracyScore != null);
  const avgFormScore = sessionsWithScore.length > 0
    ? Math.round(sessionsWithScore.reduce((acc, s) => acc + s.formAccuracyScore, 0) / sessionsWithScore.length)
    : 0;

  const handleLaunchCamera = () => {
    navigate('/track', { state: { defaultExercise: selectedExercise } });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* 1. Header & Patient Greeting */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Welcome back, {displayName} 👋
            </h1>
            <span className="badge-teal flex items-center gap-1.5 border border-teal-200">
              <ShieldCheck size={14} />
              Therapist Sync Active
            </span>
          </div>
          <p className="text-slate-500 text-lg">Here is your rehabilitation overview for this week.</p>
        </div>
      </section>

      {/* 2. Top Metric Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="clinical-card p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-teal-50 rounded-xl text-[#0D9488]">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Sessions</p>
            <p className="text-3xl font-bold text-[#0F172A]">{totalSessions} <span className="text-sm font-medium text-slate-400 normal-case tracking-normal">Sessions</span></p>
          </div>
        </div>

        <div className="clinical-card p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-orange-50 rounded-xl text-orange-500">
            <Flame size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Current Streak</p>
            <p className="text-3xl font-bold text-[#0F172A]">5 <span className="text-sm font-medium text-slate-400 normal-case tracking-normal">Days</span></p>
          </div>
        </div>

        <div className="clinical-card p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-emerald-50 rounded-xl text-[#10B981]">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Avg Form Accuracy</p>
            <p className="text-3xl font-bold text-[#0F172A]">{avgFormScore}<span className="text-2xl text-slate-400">%</span></p>
          </div>
        </div>

        <div className="clinical-card p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-500">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Peak Range of Motion</p>
            <p className="text-3xl font-bold text-[#0F172A]">{peakAngle}<span className="text-2xl text-slate-400 font-normal">°</span> <span className="text-sm font-medium text-slate-400 normal-case tracking-normal">Flexion</span></p>
          </div>
        </div>
      </section>

      {/* 3. Quick Exercise Launch Panel */}
      <section className="clinical-card p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">Start Daily Prescription</h2>
            <p className="text-slate-500 text-sm mt-1">
              Click a prescription card to launch the live tracker for that exercise.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {prescriptions.map((presc) => (
            <button 
              key={presc.exerciseType}
              onClick={() => handleLaunchCamera()}
              onMouseEnter={() => setSelectedExercise(presc.exerciseType)}
              className={`p-5 rounded-xl border-2 text-left transition-all ${selectedExercise === presc.exerciseType ? 'border-[#0D9488] bg-teal-50 shadow-sm transform -translate-y-0.5' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className={`font-bold ${selectedExercise === presc.exerciseType ? 'text-[#0D9488]' : 'text-slate-700'}`}>
                  {presc.exerciseType.replace('_', ' ')}
                </h3>
                {selectedExercise === presc.exerciseType && (
                  <span className="flex items-center gap-1 text-xs font-bold text-[#0D9488]">
                    <ArrowRight size={14} /> Start
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-sm">Assigned Exercise</p>
              <div className="mt-4 inline-flex px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600">
                Target: {presc.targetSets} sets × {presc.targetReps} reps
              </div>
            </button>
          ))}
          {prescriptions.length === 0 && (
            <p className="text-slate-500 text-sm col-span-3">No prescriptions assigned yet.</p>
          )}
        </div>
      </section>

      {/* 4. Progress Snapshot & Recent Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: 7-Day Angle Progression SVG Mock */}
        <div className="clinical-card p-8 lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#0F172A]">7-Day Range of Motion</h2>
            <select className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 outline-none bg-slate-50">
              <option>Elbow Flexion</option>
              <option>Knee Flexion</option>
            </select>
          </div>
          
          <div className="flex-grow flex items-center justify-center min-h-[250px] relative">
            {/* Embedded SVG Line Graph for Clinical Look */}
            <svg viewBox="0 0 500 200" className="w-full h-full drop-shadow-sm" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="50" x2="500" y2="50" stroke="#F1F5F9" strokeWidth="2" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#F1F5F9" strokeWidth="2" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="#F1F5F9" strokeWidth="2" />
              
              {/* Data Line */}
              <path d="M 0 150 C 50 140, 100 130, 150 110 S 250 80, 300 70 S 400 40, 500 30" 
                    fill="none" stroke="#0D9488" strokeWidth="4" strokeLinecap="round" />
              
              {/* Data Points */}
              <circle cx="2" cy="150" r="5" fill="#FFFFFF" stroke="#0D9488" strokeWidth="3" />
              <circle cx="150" cy="110" r="5" fill="#FFFFFF" stroke="#0D9488" strokeWidth="3" />
              <circle cx="300" cy="70" r="5" fill="#FFFFFF" stroke="#0D9488" strokeWidth="3" />
              <circle cx="498" cy="30" r="6" fill="#0D9488" stroke="#FFFFFF" strokeWidth="2" />
              
              {/* Trend Indicator Bubble */}
              <rect x="435" y="0" width="60" height="26" rx="13" fill="#D1FAE5" />
              <text x="465" y="17" fontSize="12" fontWeight="bold" fill="#047857" textAnchor="middle">+14°</text>
            </svg>
            
            {/* Y-Axis Mock Labels */}
            <div className="absolute left-0 top-0 h-[200px] flex flex-col justify-between py-0 text-xs font-semibold text-slate-400">
              <span className="-mt-2">150°</span>
              <span className="mt-5">100°</span>
              <span className="mt-6">50°</span>
              <span className="mb-[-5px]">0°</span>
            </div>
            
            {/* X-Axis Mock Labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs font-semibold text-slate-400 -mb-6 ml-8">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* Right Side: Recent Workout History */}
        <div className="clinical-card p-0 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="text-lg font-bold text-[#0F172A]">Recent Sessions</h2>
            <Link to="/history" className="text-sm font-semibold text-[#0D9488] hover:underline">View All</Link>
          </div>
          
          <div className="divide-y divide-slate-100 flex-grow bg-white">
            {recentSessions.map(session => (
              <div key={session._id} className="p-6 hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-800">{session.exerciseType.replace('_', ' ')}</h4>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${session.formAccuracyScore >= 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {session.formAccuracyScore}% Form
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400" /> {new Date(session.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1.5"><Activity size={14} className="text-slate-400" /> {session.totalReps} Reps</span>
                </div>
              </div>
            ))}
            {recentSessions.length === 0 && <div className="p-6 text-center text-slate-500">No recent sessions.</div>}
          </div>
        </div>
        
      </section>
    </div>
  );
};

export default Dashboard;
