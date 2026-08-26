const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  exerciseType: {
    type: String,
    required: true,
  },
  totalReps: {
    type: Number,
    required: true,
  },
  targetReps: {
    type: Number,
    required: true,
  },
  avgAngle: {
    type: Number,
    required: true,
  },
  maxFlexionAngle: {
    type: Number,
    required: true,
  },
  formAccuracyScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  durationSeconds: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
