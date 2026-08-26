const axios = require('axios');

async function testComplianceEndpoint() {
  console.log('Testing GET /api/patients/patient_123/compliance');
  try {
    const res = await axios.get('http://localhost:5000/api/patients/patient_123/compliance');
    console.log('Output:', JSON.stringify(res.data, null, 2));
  } catch (error) {
    console.error('Error testing endpoint:', error.response?.data || error.message);
  }
}

testComplianceEndpoint();
