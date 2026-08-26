const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const mongoose = require('mongoose');

// POST /api/sessions
// Validate and save a new completed rehabilitation session
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

    if (
      !patientId ||
      !exerciseType ||
      totalReps === undefined ||
      targetReps === undefined ||
      avgAngle === undefined ||
      maxFlexionAngle === undefined ||
      formAccuracyScore === undefined ||
      durationSeconds === undefined
    ) {
      return res.status(400).json({ error: 'All fields are required.' });
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

// GET /api/sessions/patient/:patientId
// Retrieve all past workout sessions for a specific patient sorted by latest date
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ error: 'Invalid patientId.' });
    }

    const sessions = await Session.find({ patientId }).sort({ createdAt: -1 });
    res.status(200).json(sessions);
  } catch (error) {
    console.error('Error fetching patient sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/sessions/analytics/:patientId
// Return aggregated statistics (total reps completed, average form score, maximum range of motion trend)
router.get('/analytics/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ error: 'Invalid patientId.' });
    }

    const sessions = await Session.find({ patientId });

    if (sessions.length === 0) {
      return res.status(200).json({
        totalRepsCompleted: 0,
        averageFormScore: 0,
        maxRangeOfMotion: 0,
        sessionCount: 0
      });
    }

    const totalRepsCompleted = sessions.reduce((acc, curr) => acc + curr.totalReps, 0);
    const sumFormScore = sessions.reduce((acc, curr) => acc + curr.formAccuracyScore, 0);
    const averageFormScore = sumFormScore / sessions.length;
    const maxRangeOfMotion = Math.max(...sessions.map(s => s.maxFlexionAngle));

    res.status(200).json({
      totalRepsCompleted,
      averageFormScore,
      maxRangeOfMotion,
      sessionCount: sessions.length
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
