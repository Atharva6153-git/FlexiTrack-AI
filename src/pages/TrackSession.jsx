import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { Camera, Volume2, VolumeX, CheckCircle2, RotateCcw, Save, ArrowLeft, Target, Timer, Zap, AlertCircle } from 'lucide-react';
import PoseEngine from '../components/PoseEngine';
import { evaluateRepetition } from '../utils/exerciseRules';
import { useAuth } from '../context/AuthContext';

// Ideal peak-flexion targets per exercise (degrees) — used to score form quality.
// A rep that reaches within ±15° of the target scores 100%; each degree beyond
// that costs 2 points, floored at 0.
const IDEAL_PEAK_ANGLE = {
  BICEP_CURL:     45,   // full curl — elbow fully flexed
  SQUAT:          90,   // thigh parallel — knee at 90°
  KNEE_EXTENSION: 160,  // leg fully extended
};
const FORM_TOLERANCE_DEG = 15;  // degrees of leeway before penalty kicks in

const TrackSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const defaultExercise = location.state?.defaultExercise || 'BICEP_CURL';
  const [selectedExercise, setSelectedExercise] = useState(defaultExercise);
  // Use Firebase UID as patientId — guaranteed unique and tied to the logged-in user
  const patientId = user?.uid;
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [prescriptions, setPrescriptions] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  const [sessionMetrics, setSessionMetrics] = useState({
    angle: 0,
    repCount: 0,
    targetReps: 10,
    feedback: 'Ready to start! Position yourself in frame.',
    feedbackType: 'info', // 'info', 'success', 'warning'
    formScore: 100,
    sessionDuration: 0,
    maxFlexionAngle: null,
    currentRepPeak: null,
    repState: 'DOWN',
    // Running totals for true avgAngle and form score calculations
    _angleSamples: 0,
    _angleSum: 0,
    _repFormScores: [],
  });

  // Timer logic
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

  // Fetch Prescriptions
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/patients/${patientId}`);
        if (res.data && res.data.prescriptions) {
          setPrescriptions(res.data.prescriptions);
          // If defaultExercise wasn't set by state and we have prescriptions, select the first one
          if (!location.state?.defaultExercise && res.data.prescriptions.length > 0) {
            const firstExercise = res.data.prescriptions[0];
            setSelectedExercise(firstExercise.exerciseType);
            setSessionMetrics(prev => ({ ...prev, targetReps: firstExercise.targetReps }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch prescriptions:", err);
      }
    };
    fetchPrescriptions();
  }, [patientId, API_URL, location.state]);

  const handlePoseUpdate = useCallback(({ angle, confidence, landmarks }) => {
    if (!isSessionActive) return;

    setSessionMetrics(prev => {
      // Temporarily override speakFeedback if muted by hijacking window.speechSynthesis
      const originalSpeak = window.speechSynthesis.speak;
      if (isMuted) {
        window.speechSynthesis.speak = () => {};
      }

      const { newState, isRepComplete, feedback } = evaluateRepetition(
        selectedExercise, 
        angle, 
        prev.repState
      );

      // Restore speech synthesis
      if (isMuted) {
        window.speechSynthesis.speak = originalSpeak;
      }

      // Determine feedback banner styling
      let fType = 'info';
      if (isRepComplete || feedback.toLowerCase().includes('good')) fType = 'success';
      else if (feedback.toLowerCase().includes('further') || feedback.toLowerCase().includes('lower')) fType = 'warning';

      // --- True running average angle ---
      const newAngleSum = prev._angleSum + angle;
      const newAngleSamples = prev._angleSamples + 1;

      // --- Per-rep peak tracking ---
      let newRepPeak = prev.currentRepPeak;
      let newGlobalPeak = prev.maxFlexionAngle;
      
      // Determine if we seek min or max based on the exercise.
      // BICEP_CURL (45) and SQUAT (90) seek minimum angles. KNEE_EXTENSION (160) seeks maximum.
      const isMaxSeeking = selectedExercise === 'KNEE_EXTENSION';
      
      if (newRepPeak === null) {
        newRepPeak = angle;
      } else {
        newRepPeak = isMaxSeeking ? Math.max(newRepPeak, angle) : Math.min(newRepPeak, angle);
      }
      
      if (newGlobalPeak === null) {
        newGlobalPeak = angle;
      } else {
        newGlobalPeak = isMaxSeeking ? Math.max(newGlobalPeak, angle) : Math.min(newGlobalPeak, angle);
      }

      // --- Per-rep form score based on peak flexion quality ---
      let repFormScores = prev._repFormScores;
      if (isRepComplete) {
        const ideal = IDEAL_PEAK_ANGLE[selectedExercise] ?? 90;
        const deviation = Math.abs(newRepPeak - ideal);
        const repScore = Math.max(0, 100 - Math.max(0, deviation - FORM_TOLERANCE_DEG) * 2);
        repFormScores = [...prev._repFormScores, repScore];
      }

      // Session-level form score = average of all completed rep scores (or 100 if no reps yet)
      const newFormScore = repFormScores.length > 0
        ? Math.round(repFormScores.reduce((a, b) => a + b, 0) / repFormScores.length)
        : prev.formScore;

      return {
        ...prev,
        angle,
        maxFlexionAngle: newGlobalPeak,
        currentRepPeak: isRepComplete ? angle : newRepPeak,
        repState: newState,
        repCount: isRepComplete ? prev.repCount + 1 : prev.repCount,
        feedback: feedback || prev.feedback,
        feedbackType: fType,
        formScore: newFormScore,
        _angleSum: newAngleSum,
        _angleSamples: newAngleSamples,
        _repFormScores: repFormScores,
      };
    });
  }, [isSessionActive, selectedExercise, isMuted]);

  // Demo Mode Simulation Timer
  useEffect(() => {
    let demoInterval;
    if (isSessionActive && isDemoMode) {
      demoInterval = setInterval(() => {
        const time = Date.now();
        // 2000ms for a full sine wave cycle between 30 and 160
        const simulatedAngle = 95 + 65 * Math.sin(time / (2000 / (2 * Math.PI)));
        
        handlePoseUpdate({ 
          angle: simulatedAngle, 
          confidence: 0.99, 
          landmarks: [] 
        });
      }, 100);
    }
    return () => clearInterval(demoInterval);
  }, [isSessionActive, isDemoMode, handlePoseUpdate]);

  const handleStartSession = () => {
    setSessionMetrics(prev => ({
      ...prev,
      angle: 0,
      repCount: 0,
      feedback: 'Tracking active. Let\'s go!',
      feedbackType: 'info',
      formScore: 100,
      sessionDuration: 0,
      maxFlexionAngle: null,
      currentRepPeak: null,
      repState: 'DOWN',
      _angleSamples: 0,
      _angleSum: 0,
      _repFormScores: [],
    }));
    setIsSessionActive(true);
  };

  const handleFinishSession = async () => {
    setIsSessionActive(false);
    // Compute true average angle from running totals
    const trueAvgAngle = sessionMetrics._angleSamples > 0
      ? Math.round(sessionMetrics._angleSum / sessionMetrics._angleSamples)
      : Math.round(sessionMetrics.maxFlexionAngle / 2);
    try {
      await axios.post(`${API_URL}/api/sessions`, {
        patientId,
        exerciseType: selectedExercise,
        totalReps: sessionMetrics.repCount,
        targetReps: sessionMetrics.targetReps,
        avgAngle: trueAvgAngle,
        maxFlexionAngle: sessionMetrics.maxFlexionAngle !== null ? Math.round(sessionMetrics.maxFlexionAngle) : 0,
        formAccuracyScore: sessionMetrics.formScore,
        durationSeconds: sessionMetrics.sessionDuration
      });
      alert('Workout session saved successfully!');
      navigate('/history');
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Failed to save session. Make sure your backend is running.');
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getFeedbackBannerStyle = () => {
    switch (sessionMetrics.feedbackType) {
      case 'success': return 'bg-emerald-100/90 border-emerald-400 text-emerald-900';
      case 'warning': return 'bg-orange-100/90 border-orange-400 text-orange-900';
      default: return 'bg-teal-100/90 border-teal-400 text-teal-900';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-[1600px] mx-auto w-full -mt-4 animate-fade-in">
      
      {/* 1. Header Control Bar */}
      <header className="flex justify-between items-center py-4 px-2">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-slate-500 hover:text-slate-800 transition-colors p-2 rounded-full hover:bg-slate-200">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Live Tracker</h1>
        </div>

        <div className="flex items-center gap-4">
          <select 
            value={selectedExercise}
            onChange={(e) => {
              setSelectedExercise(e.target.value);
              const presc = prescriptions.find(p => p.exerciseType === e.target.value);
              if (presc) {
                setSessionMetrics(prev => ({ ...prev, targetReps: presc.targetReps }));
              }
            }}
            disabled={isSessionActive}
            className="clinical-card px-4 py-2.5 text-sm font-bold text-[#0D9488] outline-none cursor-pointer disabled:opacity-50"
          >
            {prescriptions.length > 0 ? (
              prescriptions.map(p => (
                <option key={p.exerciseType} value={p.exerciseType}>
                  {p.exerciseType.replace('_', ' ')}
                </option>
              ))
            ) : (
              <>
                <option value="BICEP_CURL">Bicep Curl</option>
                <option value="SQUAT">Squat</option>
                <option value="KNEE_EXTENSION">Knee Extension</option>
              </>
            )}
          </select>

          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 clinical-card text-slate-600 hover:bg-slate-50 transition-colors"
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          <button 
            onClick={() => setIsDemoMode(!isDemoMode)}
            className={`px-4 py-2.5 rounded-xl font-bold shadow-sm transition-all text-sm flex items-center gap-2 ${
              isDemoMode ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            {isDemoMode ? 'Demo Mode: ON' : 'Simulate Reps'}
          </button>

          {!isSessionActive ? (
            <button 
              onClick={handleStartSession}
              className="bg-[#0F172A] hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <RotateCcw size={18} /> Start Session
            </button>
          ) : (
            <button 
              onClick={handleFinishSession}
              className="bg-[#0D9488] hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <Save size={18} /> Finish & Save
            </button>
          )}
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow pb-6 min-h-0">
        
        {/* 2. Main Viewport & HUD Overlay (Left 2/3) */}
        <div className="lg:col-span-2 clinical-card overflow-hidden relative flex flex-col bg-slate-900 border-0 shadow-lg">
          <div className="flex-grow relative h-full">
            <PoseEngine 
              isActive={isSessionActive}
              selectedExercise={selectedExercise}
              onPoseResults={handlePoseUpdate}
            />

            {/* Glassmorphism HUD Overlays */}
            
            {/* Top-Left: Live Joint Angle */}
            <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 shadow-lg flex flex-col items-center min-w-[120px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Live Angle</span>
              <span className="font-mono-num text-4xl font-black text-[#0F172A]">
                {Math.round(sessionMetrics.angle)}°
              </span>
            </div>

            {/* Top-Right: Camera Status */}
            <div className="absolute top-6 right-6 flex flex-col gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md shadow-md border ${isSessionActive ? 'bg-emerald-500/90 text-white border-emerald-400' : 'bg-slate-800/80 text-slate-200 border-slate-600'}`}>
                <Camera size={16} />
                <span className="text-xs font-bold tracking-wide">
                  {isSessionActive ? 'Joint Tracking Active' : 'Camera Paused'}
                </span>
              </div>
            </div>

            {/* Bottom Center: Form Guidance Banner */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-11/12 max-w-lg">
              <div className={`px-6 py-4 rounded-2xl border-2 backdrop-blur-md shadow-xl flex items-center justify-center gap-3 transition-colors duration-300 ${getFeedbackBannerStyle()}`}>
                {sessionMetrics.feedbackType === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                <span className="text-lg font-bold tracking-wide">{sessionMetrics.feedback}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Telemetry & Stats Sidebar (Right 1/3) */}
        <div className="flex flex-col gap-6 overflow-y-auto">
          
          <div className="clinical-card p-8 flex-grow flex flex-col justify-center items-center text-center space-y-2 border-t-4 border-t-[#0F172A]">
            <Target size={36} className="text-slate-400 mb-2" />
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Repetitions</h3>
            <div className="text-7xl font-black text-[#0F172A] tracking-tighter">
              {sessionMetrics.repCount} <span className="text-4xl text-slate-400 font-bold">/ {sessionMetrics.targetReps}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="clinical-card p-6 flex flex-col items-center justify-center text-center space-y-2 border-t-4 border-t-[#10B981]">
              <CheckCircle2 size={24} className="text-emerald-500 mb-1" />
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Form Score</h3>
              <div className="text-3xl font-black text-[#0F172A]">{sessionMetrics.formScore}%</div>
            </div>
            
            <div className="clinical-card p-6 flex flex-col items-center justify-center text-center space-y-2 border-t-4 border-t-[#0D9488]">
              <Timer size={24} className="text-teal-500 mb-1" />
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Elapsed Time</h3>
              <div className="font-mono-num text-3xl font-black text-[#0F172A]">{formatTime(sessionMetrics.sessionDuration)}</div>
            </div>
          </div>

          {/* Exercise Instruction Guide */}
          <div className="clinical-card p-6 bg-slate-800 text-white border-0 shadow-lg">
            <div className="flex items-center gap-2 mb-5">
              <Zap size={20} className="text-teal-400" />
              <h3 className="text-lg font-bold">Correct Form Guide</h3>
            </div>
            <ul className="space-y-4 text-sm text-slate-300 font-medium">
              <li className="flex items-start gap-3">
                <span className="text-teal-400 font-black">1.</span>
                <span className="leading-relaxed">Ensure full body is visible in the camera frame.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-teal-400 font-black">2.</span>
                <span className="leading-relaxed">Move smoothly and deliberately; avoid jerking motions.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-teal-400 font-black">3.</span>
                <span className="leading-relaxed">Listen to the audio cues to reach your full range of motion.</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TrackSession;
