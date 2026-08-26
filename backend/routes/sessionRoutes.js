const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const mongoose = require('mongoose');

// POST /api/sessions
// Save a completed rehabilitation session to the database
router.post('/', async (req, res) => {
  try {
    const {
      patientId,
      exerciseType,
      totalReps,
      targetReps,
      avgAngle,
      maxFlexionAngle,
      formAccuracyScore,
      durationSeconds,
    } = req.body;

    // Validate required fields
    if (!patientId || !exerciseType || totalReps === undefined) {
      return res.status(400).json({ error: 'patientId, exerciseType, and totalReps are required fields.' });
    }

    const newSession = new Session({
      patientId,
      exerciseType,
      totalReps,
      targetReps,
      avgAngle,
      maxFlexionAngle,
      formAccuracyScore,
      durationSeconds,
    });

    const savedSession = await newSession.save();
    res.status(201).json(savedSession);
  } catch (error) {
    console.error('Error saving session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/sessions/patient/:patientId/stats
// Fetch aggregated stats for a patient, grouped by date
router.get('/patient/:patientId/stats', async (req, res) => {
  try {
    const { patientId } = req.params;

    const stats = await Session.aggregate([
      { $match: { patientId: patientId } },
      {
        $group: {
          _id: {
            $dateTrunc: {
              date: "$createdAt",
              unit: "day"
            }
          },
          avgFormAccuracyScore: { $avg: "$formAccuracyScore" },
          avgMaxFlexionAngle: { $avg: "$maxFlexionAngle" },
          totalReps: { $sum: "$totalReps" },
          sessionCount: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/sessions/patient/:patientId
// Fetch all workout sessions for a given patient ID, sorted by createdAt descending
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;


    const sessions = await Session.find({ patientId }).sort({ createdAt: -1 });
    res.status(200).json(sessions);
  } catch (error) {
    console.error('Error fetching patient sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/sessions/analytics/:patientId
// Compute aggregate statistics
router.get('/analytics/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;


    // We sort ascending by createdAt for the trend array to be chronological
    const sessions = await Session.find({ patientId }).sort({ createdAt: 1 });

    if (sessions.length === 0) {
      return res.status(200).json({
        totalSessions: 0,
        totalReps: 0,
        averageFormAccuracyScore: 0,
        maxFlexionAngleTrend: []
      });
    }

    const totalSessions = sessions.length;
    const totalReps = sessions.reduce((acc, curr) => acc + (curr.totalReps || 0), 0);
    
    // Filter sessions that have a form accuracy score
    const sessionsWithFormScore = sessions.filter(s => s.formAccuracyScore !== undefined && s.formAccuracyScore !== null);
    const sumFormScore = sessionsWithFormScore.reduce((acc, curr) => acc + curr.formAccuracyScore, 0);
    const averageFormAccuracyScore = sessionsWithFormScore.length > 0 
      ? (sumFormScore / sessionsWithFormScore.length).toFixed(2) 
      : 0;

    // Build trend array with date and angle
    const maxFlexionAngleTrend = sessions
      .filter(s => s.maxFlexionAngle !== undefined && s.maxFlexionAngle !== null)
      .map(s => ({
        date: s.createdAt,
        angle: s.maxFlexionAngle
      }));

    res.status(200).json({
      totalSessions,
      totalReps,
      averageFormAccuracyScore: Number(averageFormAccuracyScore),
      maxFlexionAngleTrend
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
