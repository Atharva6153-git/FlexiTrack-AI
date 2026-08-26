const express = require('express');
const Patient = require('../models/Patient');
const Session = require('../models/Session');

const router = express.Router();

// Create patient
router.post('/', async (req, res) => {
  try {
    console.log('[POST /api/patients] request body:', req.body);
    const patient = await Patient.findOneAndUpdate(
      { patientId: req.body.patientId },
      { $setOnInsert: req.body },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );
    res.status(200).json(patient);
  } catch (err) {
    console.error('[POST /api/patients] failed:', {
      requestBody: req.body,
      name: err.name,
      message: err.message,
      errors: err.errors,
      code: err.code,
    });
    res.status(400).json({ error: err.message });
  }
});

// Get all patients for a therapist
router.get('/therapist/:therapistId', async (req, res) => {
  try {
    const patients = await Patient.find({ therapistId: req.params.therapistId });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single patient
router.get('/:patientId', async (req, res) => {
  try {
    const patient = await Patient.findOne({ patientId: req.params.patientId });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update/add prescription
router.patch('/:patientId/prescription', async (req, res) => {
  try {
    const { exerciseType, targetReps, targetSets } = req.body;
    const patient = await Patient.findOne({ patientId: req.params.patientId });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const existing = patient.prescriptions.find(p => p.exerciseType === exerciseType);
    if (existing) {
      existing.targetReps = targetReps;
      if (targetSets) existing.targetSets = targetSets;
      existing.assignedAt = new Date();
    } else {
      patient.prescriptions.push({ exerciseType, targetReps, targetSets });
    }
    await patient.save();
    res.json(patient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get compliance stats for a patient
router.get('/:patientId/compliance', async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const patient = await Patient.findOne({ patientId });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const complianceData = [];

    for (const prescription of patient.prescriptions) {
      const { exerciseType, targetReps, targetFrequency } = prescription;

      const sessionsThisWeek = await Session.countDocuments({
        patientId,
        exerciseType,
        createdAt: { $gte: sevenDaysAgo }
      });

      const requiredSessions = targetFrequency || 3;
      const complianceStatus = sessionsThisWeek >= requiredSessions ? "on-track" : "behind";

      complianceData.push({
        exerciseType,
        targetReps,
        targetFrequency: requiredSessions,
        sessionsThisWeek,
        complianceStatus
      });
    }

    res.json(complianceData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;