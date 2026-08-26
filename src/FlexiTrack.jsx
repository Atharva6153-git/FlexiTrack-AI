import React, { useRef, useEffect, useState } from 'react';
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

const calculateAngle = (a, b, c) => {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  return angle;
};

const FlexiTrack = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [angle, setAngle] = useState(0);
  const [repCount, setRepCount] = useState(0);
  const [stage, setStage] = useState('DOWN');
  const [feedback, setFeedback] = useState('Get ready!');
  
  const stageRef = useRef('DOWN');
  const repCountRef = useRef(0);

  useEffect(() => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext('2d');

    const pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      }
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    pose.onResults((results) => {
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      
      // Draw video frame on canvas
      canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

      if (results.poseLandmarks) {
        // Draw skeleton
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 4
        });
        drawLandmarks(canvasCtx, results.poseLandmarks, {
          color: '#FF0000',
          lineWidth: 2
        });

        // Track right arm bicep curls
        // Right shoulder: 12, Right elbow: 14, Right wrist: 16
        const shoulder = results.poseLandmarks[12];
        const elbow = results.poseLandmarks[14];
        const wrist = results.poseLandmarks[16];

        if (shoulder.visibility > 0.5 && elbow.visibility > 0.5 && wrist.visibility > 0.5) {
          const currentAngle = calculateAngle(shoulder, elbow, wrist);
          setAngle(Math.round(currentAngle));
          
          // Render angle near elbow
          canvasCtx.font = "24px Arial";
          canvasCtx.fillStyle = "white";
          canvasCtx.fillText(Math.round(currentAngle) + "°", elbow.x * canvasElement.width, elbow.y * canvasElement.height);

          // Repetition logic
          if (currentAngle > 150) {
            if (stageRef.current !== 'DOWN') {
              stageRef.current = 'DOWN';
              setStage('DOWN');
              setFeedback('Curl UP');
            }
          }
          if (currentAngle < 50 && stageRef.current === 'DOWN') {
            stageRef.current = 'UP';
            setStage('UP');
            repCountRef.current += 1;
            setRepCount(repCountRef.current);
            setFeedback('Good Rep! Lower Down');
          } else if (currentAngle >= 50 && currentAngle <= 150) {
              setFeedback(stageRef.current === 'DOWN' ? 'Keep curling up' : 'Lower slowly');
          }
        } else {
            setFeedback('Adjust Position: Make sure your right arm is visible');
        }
      } else {
          setFeedback('No pose detected. Please step into frame.');
      }
      canvasCtx.restore();
    });

    let camera = null;
    if (videoElement) {
      camera = new Camera(videoElement, {
        onFrame: async () => {
          await pose.send({ image: videoElement });
        },
        width: 640,
        height: 480
      });
      camera.start();
    }

    return () => {
      if (camera) {
        camera.stop();
      }
      if (pose) {
        pose.close();
      }
    };
  }, []);

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Inter, system-ui, sans-serif',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      minHeight: '100vh',
    },
    header: {
      marginBottom: '20px',
      fontSize: '2.5rem',
      fontWeight: 'bold',
      background: 'linear-gradient(to right, #38bdf8, #818cf8)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    dashboard: {
      display: 'flex',
      gap: '20px',
      marginBottom: '30px',
      width: '100%',
      maxWidth: '800px',
      justifyContent: 'space-between',
    },
    card: {
      flex: 1,
      backgroundColor: '#1e293b',
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      border: '1px solid #334155',
    },
    cardTitle: {
      fontSize: '1rem',
      color: '#94a3b8',
      marginBottom: '8px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: '600',
    },
    cardValue: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#f8fafc',
    },
    feedbackCard: {
      flex: 2,
      backgroundColor: '#1e293b',
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      border: '1px solid #38bdf8',
    },
    videoContainer: {
      position: 'relative',
      width: '640px',
      height: '480px',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      backgroundColor: '#000',
      border: '2px solid #334155',
    },
    video: {
      display: 'none', // Hide the video element since we draw on canvas
    },
    canvas: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      transform: 'scaleX(-1)', // Mirror the camera
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>FlexiTrack AI</h1>
      
      <div style={styles.dashboard}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Reps</div>
          <div style={styles.cardValue}>{repCount}</div>
        </div>
        
        <div style={styles.feedbackCard}>
          <div style={styles.cardTitle}>Live Guidance</div>
          <div style={{ ...styles.cardValue, color: '#38bdf8', fontSize: '1.8rem' }}>{feedback}</div>
        </div>
        
        <div style={styles.card}>
          <div style={styles.cardTitle}>Angle</div>
          <div style={styles.cardValue}>{angle}°</div>
        </div>
      </div>

      <div style={styles.videoContainer}>
        <video 
          ref={videoRef} 
          style={styles.video} 
          playsInline 
        />
        <canvas 
          ref={canvasRef} 
          width="640" 
          height="480" 
          style={styles.canvas} 
        />
      </div>
    </div>
  );
};

export default FlexiTrack;
