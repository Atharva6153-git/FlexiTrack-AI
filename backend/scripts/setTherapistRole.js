require('dotenv').config();
const mongoose = require('mongoose');
const Patient = require('../models/Patient');

const patientId = process.argv[2];

if (!patientId) {
  console.error('Usage: node scripts/setTherapistRole.js <firebase-user-uid>');
  process.exit(1);
}

async function setTherapistRole() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const patient = await Patient.findOneAndUpdate(
      { patientId },
      { $set: { role: 'therapist' } },
      { new: true }
    );

    if (!patient) {
      throw new Error(`No Patient found for Firebase UID: ${patientId}`);
    }

    console.log(`Set ${patient.patientId} role to ${patient.role}`);
  } finally {
    await mongoose.disconnect();
  }
}

setTherapistRole().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});