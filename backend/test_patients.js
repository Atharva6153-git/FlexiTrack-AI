const axios = require('axios');

const API_URL = 'http://localhost:5000/api/patients';

async function runTests() {
  console.log('--- Starting API Tests for /api/patients ---');
  
  // 1. POST / (create test patient)
  try {
    console.log('\n[1] POST / (Creating test patient)');
    const createRes = await axios.post(`${API_URL}/`, {
      patientId: 'patient_123',
      name: 'Test Patient',
      therapistId: 'therapist_1'
    });
    console.log('Success:', createRes.data);
  } catch (err) {
    console.log('Result (might already exist):', err.response?.data || err.message);
  }

  // 2. GET /therapist/:therapistId
  try {
    console.log('\n[2] GET /therapist/therapist_1');
    const listRes = await axios.get(`${API_URL}/therapist/therapist_1`);
    console.log(`Found ${listRes.data.length} patients for therapist_1`);
    console.log('Data:', listRes.data);
  } catch (err) {
    console.log('Error:', err.response?.data || err.message);
  }

  // 3. GET /:patientId
  try {
    console.log('\n[3] GET /patient_123');
    const getRes = await axios.get(`${API_URL}/patient_123`);
    console.log('Data:', getRes.data);
  } catch (err) {
    console.log('Error:', err.response?.data || err.message);
  }

  // 4. PATCH /:patientId/prescription
  try {
    console.log('\n[4] PATCH /patient_123/prescription (Adding prescription)');
    const patchRes = await axios.patch(`${API_URL}/patient_123/prescription`, {
      exerciseType: 'SQUAT',
      targetReps: 15,
      targetSets: 3
    });
    console.log('Success:', patchRes.data);
  } catch (err) {
    console.log('Error:', err.response?.data || err.message);
  }

  console.log('\n--- Tests Completed ---');
}

runTests();
