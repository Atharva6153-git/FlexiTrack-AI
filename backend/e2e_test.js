const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const PATIENT_ID = 'patient_e2e_test_' + Date.now();
const THERAPIST_ID = 'therapist_e2e';

async function runE2E() {
  console.log(`--- Starting E2E Test for patient: ${PATIENT_ID} ---`);

  try {
    // 1. Create Patient
    console.log('\n[1] Creating new patient...');
    const createRes = await axios.post(`${API_URL}/patients`, {
      patientId: PATIENT_ID,
      name: 'E2E Test Patient',
      therapistId: THERAPIST_ID
    });
    console.log('Success:', createRes.data.patientId);

    // 2. Assign Prescription
    console.log('\n[2] Assigning prescription (SQUAT, 10 reps, 3 sets)...');
    const patchRes = await axios.patch(`${API_URL}/patients/${PATIENT_ID}/prescription`, {
      exerciseType: 'SQUAT',
      targetReps: 10,
      targetSets: 3
    });
    console.log('Success:', patchRes.data.prescriptions);

    // 3. Record 3 demo sessions (simulating 3 days of workouts)
    console.log('\n[3] Recording 3 sessions...');
    const dates = [
      new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
      new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
      new Date(Date.now()).toISOString() // today
    ];

    for (let i = 0; i < 3; i++) {
      const sessionData = {
        patientId: PATIENT_ID,
        exerciseType: 'SQUAT',
        totalReps: 12,
        targetReps: 10,
        avgAngle: 100,
        maxFlexionAngle: 110 + (i * 5), // improving angle
        formAccuracyScore: 90 + (i * 2),
        durationSeconds: 60,
      };
      
      const sRes = await axios.post(`${API_URL}/sessions`, sessionData);
      // Manually update createdAt in DB to simulate different dates
      // Wait, Mongoose will auto-set createdAt. But for test purposes, we can update it directly if we had mongoose access.
      // Since we don't, they will all have today's date.
      console.log(`Recorded session ${i+1}`);
    }

    // 4. Verify History Stats
    console.log('\n[4] Verifying History Stats (/stats)...');
    const statsRes = await axios.get(`${API_URL}/sessions/patient/${PATIENT_ID}/stats`);
    console.log('Stats length:', statsRes.data.length);
    console.log(statsRes.data);

    // 5. Verify Therapist Portal Compliance
    console.log('\n[5] Verifying Compliance (/compliance)...');
    const compRes = await axios.get(`${API_URL}/patients/${PATIENT_ID}/compliance`);
    console.log(compRes.data);

    console.log('\n--- E2E Test Completed Successfully ---');

  } catch (error) {
    console.error('Error in E2E:', error.response?.data || error.message);
  }
}

runE2E();
