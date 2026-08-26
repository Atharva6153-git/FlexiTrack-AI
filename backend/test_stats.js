const axios = require('axios');

async function testStatsEndpoint() {
  console.log('Testing GET /api/sessions/patient/patient_123/stats');
  try {
    const res = await axios.get('http://localhost:5000/api/sessions/patient/patient_123/stats');
    console.log('Output:', JSON.stringify(res.data, null, 2));
  } catch (error) {
    console.error('Error testing endpoint:', error.response?.data || error.message);
  }
}

testStatsEndpoint();
