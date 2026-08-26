import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Note: Ensure you have these components built or use placeholders for now
import PoseEngine from './components/PoseEngine';
import Dashboard from './components/Dashboard';
import ProgressChart from './components/ProgressChart';
import { evaluateExercise } from './utils/exerciseRules';

const App = () => {
  // 1. State Management
  const [selectedExercise, setSelectedExercise] = useState('BICEP_CURL'); // 'BICEP_CURL', 'SQUAT', 'KNEE_EXTENSION'
  const [sessionMetrics, setSessionMetrics] = useState({
    angle: 0,
    repCount: 0,
    formFeedback: 'Ready to start!',
    sessionDuration: 0,
    maxFlexionAngle: 0,
    formAccuracyScore: 100, // starting at 100%
  });
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [historicalSessions, setHistoricalSessions] = useState([]);
  const [isSessionActive, setIsSessionActive] = useState(false);

  // Hardcoded patientId for demonstration, in a real app this comes from auth state
  const patientId = '64f1b2c3d4e5f60012345678'; 
  const API_BASE_URL = 'http://localhost:5000/api/sessions';

  // Fetch historical data
  const fetchHistoricalSessions = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/patient/${patientId}`);
      setHistoricalSessions(response.data);
    } catch (error) {
      console.error('Error fetching historical sessions:', error);
    }
  }, [patientId]);

  // Load historical data on mount
  useEffect(() => {
    fetchHistoricalSessions();
  }, [fetchHistoricalSessions]);

  // Timer for session duration
  useEffect(() => {
    let timer;
    if (isSessionActive) {
      timer = setInterval(() => {
        setSessionMetrics((prev) => ({
          ...prev,
          sessionDuration: prev.sessionDuration + 1,
        }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSessionActive]);

  // 2. Real-Time Tracking Flow: Callback from PoseEngine
  const handlePoseUpdate = useCallback((poseData) => {
    if (!isSessionActive) return;

    // Evaluate exercise based on rules
    const evaluation = evaluateExercise(selectedExercise, poseData);
    
    setSessionMetrics((prev) => {
      const newMaxFlexion = Math.max(prev.maxFlexionAngle, evaluation.angle || 0);
      
      // Basic voice feedback trigger if audio is enabled
      if (isAudioEnabled && evaluation.feedback && evaluation.feedback !== prev.formFeedback) {
        speak(evaluation.feedback);
      }

      return {
        ...prev,
        angle: evaluation.angle || prev.angle,
        repCount: evaluation.repCount !== undefined ? evaluation.repCount : prev.repCount,
        formFeedback: evaluation.feedback || prev.formFeedback,
        maxFlexionAngle: newMaxFlexion,
        // Simple form accuracy penalty for demonstration
        formAccuracyScore: evaluation.isProperForm ? prev.formAccuracyScore : Math.max(0, prev.formAccuracyScore - 1),
      };
    });
  }, [selectedExercise, isSessionActive, isAudioEnabled]);

  // Text-to-Speech function for voice guidance
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStartSession = () => {
    setSessionMetrics({
      angle: 0,
      repCount: 0,
      formFeedback: 'Ready to start!',
      sessionDuration: 0,
      maxFlexionAngle: 0,
      formAccuracyScore: 100,
    });
    setIsSessionActive(true);
  };

  // 3. Backend API Persistence
  const handleFinishSession = async () => {
    setIsSessionActive(false);
    
    const payload = {
      patientId,
      exerciseType: selectedExercise,
      totalReps: sessionMetrics.repCount,
      targetReps: 10, // Example target reps
      avgAngle: sessionMetrics.maxFlexionAngle / 2, // Mock calc for average angle
      maxFlexionAngle: sessionMetrics.maxFlexionAngle,
      formAccuracyScore: sessionMetrics.formAccuracyScore,
      durationSeconds: sessionMetrics.sessionDuration,
    };

    try {
      await axios.post(API_BASE_URL, payload);
      // Fetch updated history after successful post
      await fetchHistoricalSessions();
      
      if (isAudioEnabled) {
        speak('Workout session completed and saved.');
      }
    } catch (error) {
      console.error('Error saving workout session:', error);
      alert('Failed to save workout session.');
    }
  };

  return (
    <div className="flexi-track-app p-4 max-w-6xl mx-auto font-sans">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">FlexiTrack AI</h1>
        <div className="flex items-center gap-4">
          <select 
            value={selectedExercise} 
            onChange={(e) => setSelectedExercise(e.target.value)}
            disabled={isSessionActive}
            className="p-2 border rounded"
          >
            <option value="BICEP_CURL">Bicep Curl</option>
            <option value="SQUAT">Squat</option>
            <option value="KNEE_EXTENSION">Knee Extension</option>
          </select>
          <button 
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className={`p-2 rounded text-white ${isAudioEnabled ? 'bg-green-500' : 'bg-red-500'}`}
          >
            {isAudioEnabled ? 'Audio: ON' : 'Audio: OFF'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Camera / Tracking */}
        <div className="bg-gray-100 rounded-lg p-4 shadow">
          <h2 className="text-xl font-semibold mb-4">Live Tracking</h2>
          
          {/* PoseEngine component receives the callback */}
          <div className="aspect-video bg-black flex items-center justify-center text-white rounded overflow-hidden">
             <PoseEngine onPoseUpdate={handlePoseUpdate} isActive={isSessionActive} />
          </div>
          
          <div className="mt-4 flex gap-4">
            {!isSessionActive ? (
              <button 
                onClick={handleStartSession}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
              >
                Start Workout
              </button>
            ) : (
              <button 
                onClick={handleFinishSession}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition"
              >
                Finish Workout Session
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Dashboard & Analytics */}
        <div className="flex flex-col gap-6">
          <Dashboard metrics={sessionMetrics} />
          <ProgressChart history={historicalSessions} />
        </div>
      </div>
    </div>
  );
};

export default App;
