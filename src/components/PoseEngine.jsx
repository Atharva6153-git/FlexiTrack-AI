import React, { useRef, useEffect, useState, useCallback } from 'react';

const getPoseGlobals = () => ({
  Pose: window.Pose,
  POSE_CONNECTIONS: window.POSE_CONNECTIONS,
  drawConnectors: window.drawConnectors,
  drawLandmarks: window.drawLandmarks,
});

export default function PoseEngine({ onPoseResults, selectedExercise = 'BICEP_CURL' }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const hasStarted = useRef(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const calculateAngle = (a, b, c) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let degrees = Math.abs((radians * 180.0) / Math.PI);
    if (degrees > 180.0) degrees = 360.0 - degrees;
    return Math.round(degrees);
  };

  const onResults = useCallback(
    (results) => {
      const canvas = canvasRef.current;
      if (!canvas || !videoRef.current) return;
      const ctx = canvas.getContext('2d');

      const width = videoRef.current.videoWidth || 640;
      const height = videoRef.current.videoHeight || 480;
      canvas.width = width;
      canvas.height = height;

      ctx.save();
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(results.image, 0, 0, width, height);

      const globals = getPoseGlobals();

      if (results.poseLandmarks && globals.drawConnectors) {
        const landmarks = results.poseLandmarks;

        globals.drawConnectors(ctx, landmarks, globals.POSE_CONNECTIONS, {
          color: '#0D9488',
          lineWidth: 3,
        });
        globals.drawLandmarks(ctx, landmarks, {
          color: '#10B981',
          lineWidth: 1,
          radius: 4,
        });

        let p1 = landmarks[12], p2 = landmarks[14], p3 = landmarks[16];
        if (selectedExercise === 'SQUAT' || selectedExercise === 'KNEE_EXTENSION') {
          p1 = landmarks[24]; p2 = landmarks[26]; p3 = landmarks[28];
        }

        if (p1?.visibility > 0.5 && p2?.visibility > 0.5 && p3?.visibility > 0.5) {
          const angle = calculateAngle(p1, p2, p3);
          const cx = p2.x * width;
          const cy = p2.y * height;

          ctx.fillStyle = '#0F172A';
          ctx.fillRect(cx - 30, cy - 30, 60, 26);
          ctx.fillStyle = '#22C55E';
          ctx.font = 'bold 14px JetBrains Mono, monospace';
          ctx.fillText(`${angle}°`, cx - 20, cy - 12);

          if (onPoseResults) {
            onPoseResults({ angle, confidence: p2.visibility, landmarks });
          }
        }
      }
      ctx.restore();
    },
    [onPoseResults, selectedExercise]
  );

  // Keep a ref to the latest onResults so pose.onResults() always calls
  // the freshest version without forcing the camera effect to re-run.
  const onResultsRef = useRef(onResults);
  useEffect(() => {
    onResultsRef.current = onResults;
  }, [onResults]);

  useEffect(() => {
    // Guard: only run once, even under StrictMode double-invoke
    if (hasStarted.current) return;
    hasStarted.current = true;

    let animationFrameId = null;
    let pose = null;

    const startCamera = async () => {
      console.log('[PoseEngine] startCamera() called');
      const globals = getPoseGlobals();

      console.log('[PoseEngine] Globals found:', !!globals.Pose);
      if (!globals.Pose) {
        console.error('[PoseEngine] ERROR: window.Pose is undefined! The MediaPipe CDN script has not loaded yet.');
        return;
      }

      try {
        console.log('[PoseEngine] Initializing Pose model...');
        setCameraError(null);
        pose = new globals.Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        // Call through the ref so the latest onResults (with current
        // selectedExercise) always runs, without re-mounting the camera.
        pose.onResults((results) => onResultsRef.current(results));

        console.log('[PoseEngine] Requesting webcam permissions via getUserMedia...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });

        streamRef.current = stream;

        console.log('[PoseEngine] Webcam access granted! Stream:', stream);

        if (videoRef.current) {
          console.log('[PoseEngine] Attaching stream to videoRef and playing...');
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setIsLoaded(true);
          console.log('[PoseEngine] Video is playing, starting frame processing loop...');

          const processFrame = async () => {
            if (videoRef.current && videoRef.current.readyState >= 2) {
              await pose.send({ image: videoRef.current });
            }
            animationFrameId = requestAnimationFrame(processFrame);
          };
          processFrame();
        } else {
          console.error('[PoseEngine] ERROR: videoRef.current is null! Cannot attach stream.');
        }
      } catch (err) {
        console.error('[PoseEngine] FATAL Webcam/Camera Error Details:', {
          name: err.name,
          message: err.message,
          stack: err.stack,
          rawError: err,
        });
        setCameraError(`Camera Error: ${err.message || 'Permissions Blocked'}`);
      }
    };

    startCamera();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (pose) pose.close();
      hasStarted.current = false;
    };
  }, []); // empty deps — camera starts exactly once per mount, never on exercise switch

  return (
    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={canvasRef} className="w-full h-full object-cover" />

      {!isLoaded && !cameraError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 text-white font-medium">
          Initializing Camera & AI Engine...
        </div>
      )}

      {cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-red-400 p-4 text-center">
          <p className="font-semibold text-lg">{cameraError}</p>
          <p className="text-sm text-slate-400 mt-2">Close Zoom/Teams/other browser tabs and refresh.</p>
        </div>
      )}
    </div>
  );
}