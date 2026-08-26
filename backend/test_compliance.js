require('dotenv').config();
const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  exerciseType: { type: String, required: true },
  targetReps: { type: Number, required: true },
  targetSets: { type: Number, default: 3 },
  assignedAt: { type: Date, default: Date.now }
}, { _id: false });

const patientSchema = new mongoose.Schema({
  patientId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  therapistId: { type: String, required: true },
  prescriptions: [prescriptionSchema],
  createdAt: { type: Date, default: Date.now }
});

const Patient = mongoose.models.Patient || mongoose.model('Patient', patientSchema);
const Session = require('./models/Session');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  // Seed patient if not exists
  let patient = await Patient.findOne({ patientId: 'patient_123' });
  if (!patient) {
    patient = new Patient({
      patientId: 'patient_123',
      name: 'John Doe',
      therapistId: 'therapist_001',
      prescriptions: [
        { exerciseType: 'BICEP_CURL', targetReps: 10 },
        { exerciseType: 'SQUAT', targetReps: 12 },
        { exerciseType: 'KNEE_EXTENSION', targetReps: 15 }
      ]
    });
    await patient.save();
    console.log('Seeded patient_123');
  }

  // Run compliance logic
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const complianceData = [];

  for (const prescription of patient.prescriptions) {
    const { exerciseType, targetReps } = prescription;

    const sessionsThisWeek = await Session.countDocuments({
      patientId: patient.patientId,
      exerciseType,
      createdAt: { $gte: sevenDaysAgo }
    });

    const complianceStatus = sessionsThisWeek >= 3 ? "on-track" : "behind";

    complianceData.push({
      exerciseType,
      targetReps,
      sessionsThisWeek,
      complianceStatus
    });
  }

  console.log('Compliance Output:');
  console.log(JSON.stringify(complianceData, null, 2));

  process.exit(0);
}).catch(console.error);
