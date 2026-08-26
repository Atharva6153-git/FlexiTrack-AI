const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  patientId: {
    type: String, // 👈 Changed from Schema.Types.ObjectId to String
    required: true,
  },
  exerciseType: {
    type: String,
    enum: ['BICEP_CURL', 'SQUAT', 'KNEE_EXTENSION'],
    required: true,
  },
  totalReps: {
    type: Number,
    required: true,
  },
  targetReps: {
    type: Number,
    default: 10,
  },
  avgAngle: {
    type: Number,
  },
  maxFlexionAngle: {
    type: Number,
  },
  formAccuracyScore: {
    type: Number,
  },
  durationSeconds: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Session', sessionSchema);