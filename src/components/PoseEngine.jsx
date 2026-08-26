import React, { useRef, useEffect } from 'react';
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

// Helper function to calculate the angle between three points (A, B, C) where B is the vertex
const calculateAngle = (a, b, c) => {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  
  if (angle > 180.0) {
    angle = 360.0 - angle;
  }
  
  return angle;
};

const PoseEngine = ({ 
  onPoseResults, 
  onPoseUpdate, // Added for compatibility with App.jsx
  isActive = true,
  // We'll default to the shoulder (12), elbow (14), and wrist (16) 
  // if specific targets aren't requested by the parent.
  targetLandmarks = { a: 12, b: 14, c: 16 } 
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (!isActive) {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      return;
    }

    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext('2d');

    // Initialize MediaPipe Pose
    const pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      },
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => {
      // 1. Clear Canvas
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      
      // 2. Draw Video Frame
      canvasCtx.drawImage(
        results.image, 0, 0, canvasElement.width, canvasElement.height
      );

      if (results.poseLandmarks) {
        // 3. Render Skeleton
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 4,
        });
        drawLandmarks(canvasCtx, results.poseLandmarks, {
          color: '#FF0000',
          lineWidth: 2,
        });

        // 4. Compute Angle
        const { a, b, c } = targetLandmarks;
        const pointA = results.poseLandmarks[a];
        const pointB = results.poseLandmarks[b];
        const pointC = results.poseLandmarks[c];

        if (pointA && pointB && pointC) {
          const angle = calculateAngle(pointA, pointB, pointC);
          const confidence = Math.min(pointA.visibility, pointB.visibility, pointC.visibility);

          // Draw the live angle degree text next to joint B
          canvasCtx.font = "bold 32px Arial";
          canvasCtx.fillStyle = "white";
          canvasCtx.strokeStyle = "black";
          canvasCtx.lineWidth = 3;
          
          const textX = pointB.x * canvasElement.width + 15;
          const textY = pointB.y * canvasElement.height;
          const text = `${Math.round(angle)}°`;

          canvasCtx.strokeText(text, textX, textY);
          canvasCtx.fillText(text, textX, textY);

          // 5. Pass Metrics to Parent Callback
          const callback = onPoseResults || onPoseUpdate;
          if (callback) {
            callback({
              angle,
              confidence,
              landmarks: results.poseLandmarks
            });
          }
        }
      }
      canvasCtx.restore();
    });

    // Start Camera
    cameraRef.current = new Camera(videoElement, {
      onFrame: async () => {
        await pose.send({ image: videoElement });
      },
      width: 640,
      height: 480,
    });
    cameraRef.current.start();

    // 6. Cleanup
    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      pose.close();
    };
  }, [isActive, onPoseResults, onPoseUpdate, targetLandmarks]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
      {/* Hidden Video Element */}
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        width="640"
        height="480"
        playsInline
      ></video>
      
      {/* Overlay Canvas */}
      <canvas
        ref={canvasRef}
        width="640"
        height="480"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain' // Maintains aspect ratio
        }}
      ></canvas>
    </div>
  );
};

export default PoseEngine;
