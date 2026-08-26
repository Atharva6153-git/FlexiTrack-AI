import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { TrendingUp, BarChart3, Calendar, Filter, Clock, Award, Activity, Play } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const EXERCISE_LABELS = {
  BICEP_CURL: 'Bicep Curl',
  SQUAT: 'Squat',
  KNEE_EXTENSION: 'Knee Extension'
};

const History = () => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'BICEP_CURL', 'SQUAT', 'KNEE_EXTENSION'
  const patientId = localStorage.getItem('patientId') || 'patient_123';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/sessions/patient/${patientId}`);
        setSessions(res.data);
      } catch (err) {
        console.error('Failed to load history from backend.', err);
        setSessions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [patientId, API_URL]);

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    if (filter === 'ALL') return sessions;
    return sessions.filter(s => s.exerciseType === filter);
  }, [sessions, filter]);

  // Aggregate Metrics
  const totalSessions = filteredSessions.length;
  const peakAngle = totalSessions > 0 ? Math.max(...filteredSessions.map(s => s.maxFlexionAngle || 0)) : 0;
  const avgFormScore = totalSessions > 0 
    ? Math.round(filteredSessions.reduce((acc, s) => acc + (s.formAccuracyScore || 0), 0) / totalSessions) 
    : 0;

  // Chart Data Preparation
  const chartData = useMemo(() => {
    // Sort chronologically for charts (oldest to newest)
    const sorted = [...filteredSessions].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return sorted.map(s => ({
      date: new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      maxAngle: s.maxFlexionAngle,
      reps: s.totalReps,
      score: s.formAccuracyScore
    }));
  }, [filteredSessions]);

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D9488]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* 1. Header & Filter Controls */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Rehabilitation Analytics</h1>
          <p className="text-slate-500 text-lg mt-1">Track long-term range-of-motion recovery and exercise volume.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Filter size={18} className="text-slate-400" />
          {['ALL', 'BICEP_CURL', 'SQUAT', 'KNEE_EXTENSION'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${
                filter === type 
                  ? 'bg-[#0F172A] text-white' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {type === 'ALL' ? 'All Exercises' : EXERCISE_LABELS[type]}
            </button>
          ))}
        </div>
      </section>

      {/* 2. Metric Summary Header Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="clinical-card p-6 flex flex-col justify-center items-center text-center space-y-2 border-t-4 border-t-[#0F172A]">
          <Activity size={24} className="text-slate-400 mb-1" />
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Sessions</h3>
          <div className="text-4xl font-black text-[#0F172A]">{totalSessions}</div>
        </div>

        <div className="clinical-card p-6 flex flex-col justify-center items-center text-center space-y-2 border-t-4 border-t-[#0D9488]">
          <TrendingUp size={24} className="text-[#0D9488] mb-1" />
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Peak Angle Achieved</h3>
          <div className="text-4xl font-black text-[#0F172A]">{peakAngle}<span className="text-2xl text-slate-400 font-normal">°</span></div>
        </div>

        <div className="clinical-card p-6 flex flex-col justify-center items-center text-center space-y-2 border-t-4 border-t-[#10B981]">
          <Award size={24} className="text-emerald-500 mb-1" />
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Avg Form Accuracy</h3>
          <div className="text-4xl font-black text-[#0F172A]">{avgFormScore}<span className="text-2xl text-slate-400 font-normal">%</span></div>
        </div>
      </section>

      {/* 3. Data Visualizations */}
      {filteredSessions.length > 0 && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Max Angle Line Chart */}
          <div className="clinical-card p-6">
            <h2 className="text-lg font-bold text-[#0F172A] mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-[#0D9488]" />
              Max Angle Progression
            </h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAngle" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#0F172A', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="maxAngle" name="Max Angle (°)" stroke="#0D9488" strokeWidth={3} fillOpacity={1} fill="url(#colorAngle)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Repetition Volume Bar Chart */}
          <div className="clinical-card p-6">
            <h2 className="text-lg font-bold text-[#0F172A] mb-6 flex items-center gap-2">
              <BarChart3 size={20} className="text-[#0F172A]" />
              Repetition Consistency
            </h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#F1F5F9'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#0F172A', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="reps" name="Reps Completed" fill="#0F172A" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}

      {/* 4. Historical Session Logs Table */}
      <section className="clinical-card overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
            <Calendar size={20} className="text-slate-500" />
            Session Logs
          </h2>
        </div>
        
        {filteredSessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Exercise</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Volume</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Peak Angle</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Form Quality</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {/* Sort desc for table view (newest first) */}
                {[...filteredSessions].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map((session) => (
                  <tr key={session._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {new Date(session.createdAt).toLocaleString(undefined, { 
                        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#0D9488]">
                      {EXERCISE_LABELS[session.exerciseType] || session.exerciseType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                      {session.totalReps} / {session.targetReps || '-'} Reps
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-bold">
                      {session.maxFlexionAngle}°
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        session.formAccuracyScore >= 90 ? 'bg-emerald-100 text-emerald-800' : 
                        session.formAccuracyScore >= 75 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {session.formAccuracyScore}% Score
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 flex items-center gap-1.5">
                      <Clock size={14} />
                      {formatDuration(session.durationSeconds)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="bg-slate-100 p-4 rounded-full mb-4">
              <Calendar size={40} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-[#0F172A] mb-2">No Sessions Found</h3>
            <p className="text-slate-500 max-w-md mb-6">
              You haven't recorded any sessions for this exercise yet. Start a new workout to begin tracking your progress.
            </p>
            <Link 
              to="/track" 
              className="bg-[#0D9488] hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <Play size={18} fill="currentColor" /> Start First Workout
            </Link>
          </div>
        )}
      </section>

    </div>
  );
};

export default History;
