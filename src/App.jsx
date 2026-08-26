import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import PoseEngine from './components/PoseEngine';
// Mock/Placeholder for ProgressChart if it doesn't exist yet
import ProgressChart from './components/ProgressChart';
import { evaluateRepetition, EXERCISE_CONFIGS } from './utils/exerciseRules';

const App = () => {
  // 1. State Management
  const [selectedExercise, setSelectedExercise] = useState('BICEP_CURL');
  const [patientId, setPatientId] = useState('patient_123');
  
  const [sessionMetrics, setSessionMetrics] = useState({
    angle: 0,
    repCount: 0,
    feedback: 'Ready to start!',
    formScore: 100,
    sessionDuration: 0,
    maxFlexionAngle: 0,
    repState: 'DOWN', // Used internally by the state machine
  });
  
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [historicalSessions, setHistoricalSessions] = useState([]);

  const API_URL = 'http://localhost:5000/api/sessions';

  // 3. API Operations: Fetch History
  const fetchSessionHistory = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/patient/${patientId}`);
      setHistoricalSessions(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  }, [patientId]);

  // Fetch history on load and when patientId changes
  useEffect(() => {
    fetchSessionHistory();
  }, [fetchSessionHistory]);

  // Session Timer
  useEffect(() => {
    let timer;
    if (isSessionActive) {
      timer = setInterval(() => {
        setSessionMetrics(prev => ({ 
          ...prev, 
          sessionDuration: prev.sessionDuration + 1 
        }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSessionActive]);

  // 2. Live Tracking: Handle data emitted by PoseEngine
  const handlePoseUpdate = useCallback(({ angle, confidence, landmarks }) => {
    if (!isSessionActive) return;

    setSessionMetrics(prev => {
      // Feed angle metrics into exerciseRules state machine
      const { newState, isRepComplete, feedback } = evaluateRepetition(
        selectedExercise, 
        angle, 
        prev.repState
      );

      return {
        ...prev,
        angle: angle,
        maxFlexionAngle: Math.max(prev.maxFlexionAngle, angle),
        repState: newState,
        // Increment rep count if state machine says it's complete
        repCount: isRepComplete ? prev.repCount + 1 : prev.repCount,
        // Only update feedback string if the state machine provided a new one
        feedback: feedback || prev.feedback,
      };
    });
  }, [isSessionActive, selectedExercise]);

  const handleStartSession = () => {
    setSessionMetrics({
      angle: 0,
      repCount: 0,
      feedback: 'Tracking started. Let\'s go!',
      formScore: 100,
      sessionDuration: 0,
      maxFlexionAngle: 0,
      repState: 'DOWN',
    });
    setIsSessionActive(true);
  };

  // 3. API Operations: Save Session
  const handleFinishSession = async () => {
    setIsSessionActive(false);
    
    try {
      await axios.post(API_URL, {
        patientId,
        exerciseType: selectedExercise,
        totalReps: sessionMetrics.repCount,
        targetReps: 10,
        avgAngle: sessionMetrics.maxFlexionAngle / 2, // Approximated average for demo
        maxFlexionAngle: sessionMetrics.maxFlexionAngle,
        formAccuracyScore: sessionMetrics.formScore,
        durationSeconds: sessionMetrics.sessionDuration
      });
      
      // Trigger a re-fetch of history after submission
      fetchSessionHistory();
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Failed to save session. Check if backend is running.');
    }
  };

  // Automatically pass the required landmarks to PoseEngine based on selected exercise
  const activeLandmarks = EXERCISE_CONFIGS[selectedExercise]?.landmarks || { a: 12, b: 14, c: 16 };

  // 4. Modern dashboard layout styled with standard Tailwind CSS classes
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans">
      
      {/* Header */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-blue-700 tracking-tight">FlexiTrack AI</h1>
          <p className="text-slate-500 font-medium">Real-time Rehabilitation Tracking</p>
        </div>
        
        <div className="flex gap-4">
          <input 
            type="text" 
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="border border-slate-300 rounded-lg px-4 py-2 bg-white shadow-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Patient ID"
          />
          <select 
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            disabled={isSessionActive}
            className="border border-slate-300 rounded-lg px-4 py-2 bg-white shadow-sm font-semibold text-slate-700 cursor-pointer disabled:opacity-50 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="BICEP_CURL">Bicep Curl</option>
            <option value="SQUAT">Squat</option>
            <option value="KNEE_EXTENSION">Knee Extension</option>
          </select>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Live Tracking & Camera */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col">
          
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="text-xl font-bold text-slate-800">Live Camera Feed</h2>
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${isSessionActive ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-600 border border-slate-300'}`}>
              {isSessionActive ? '● Recording' : 'Paused'}
            </span>
          </div>
          
          {/* Pose Engine Container */}
          <div className="relative aspect-video bg-slate-900 flex-grow">
            <PoseEngine 
              isActive={isSessionActive} 
              onPoseResults={handlePoseUpdate}
              targetLandmarks={activeLandmarks}
            />
          </div>

          {/* Action Buttons */}
          <div className="p-6 bg-slate-50 flex gap-4">
            {!isSessionActive ? (
              <button 
                onClick={handleStartSession}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                Start Workout
              </button>
            ) : (
              <button 
                onClick={handleFinishSession}
                className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                Finish & Save Session
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Real-time Stats & History */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Live Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 border-t-4 border-t-blue-500">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Rep Count</p>
              <p className="text-4xl font-black text-slate-800">{sessionMetrics.repCount}</p>
            </div>
            
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 border-t-4 border-t-indigo-500">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Current Angle</p>
              <p className="text-4xl font-black text-slate-800">{Math.round(sessionMetrics.angle)}°</p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 border-t-4 border-t-emerald-500">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Form Score</p>
              <p className="text-4xl font-black text-slate-800">{sessionMetrics.formScore}%</p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 border-t-4 border-t-amber-500">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Time Elapsed</p>
              <p className="text-4xl font-black text-slate-800">{sessionMetrics.sessionDuration}s</p>
            </div>
          </div>

          {/* Real-time AI Feedback Banner */}
          <div className="bg-indigo-50 p-6 rounded-2xl shadow-sm border border-indigo-100">
            <p className="text-indigo-800 font-semibold text-sm uppercase tracking-wide">AI Feedback Coach:</p>
            <p className="text-2xl font-bold text-indigo-600 mt-2">{sessionMetrics.feedback}</p>
          </div>

          {/* Progress Chart Module */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex-grow">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Session History</h3>
            <div className="min-h-[200px] flex items-center justify-center">
               <ProgressChart history={historicalSessions} />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
