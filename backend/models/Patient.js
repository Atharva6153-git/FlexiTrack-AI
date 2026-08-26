const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  exerciseType: { type: String, required: true },
  targetReps: { type: Number, required: true },
  targetSets: { type: Number, default: 3 },
  targetFrequency: { type: Number, default: 3 }, // sessions per week
  assignedAt: { type: Date, default: Date.now }
}, { _id: false });

const patientSchema = new mongoose.Schema({
  patientId: { type: String, required: true, unique: true }, // matches Session.patientId
  name: { type: String, required: true },
  therapistId: { type: String, required: true },
  prescriptions: [prescriptionSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Patient', patientSchema);