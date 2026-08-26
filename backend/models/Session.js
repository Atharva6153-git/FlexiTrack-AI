const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SessionSchema = new Schema({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
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
  }
});

module.exports = mongoose.model('Session', SessionSchema);
