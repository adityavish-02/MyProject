import axios from 'axios';

// ⚠️ IMPORTANT: PASTE YOUR CLIMATIQ API KEY HERE.
const API_KEY = 'B9Z6FF4JMN3J3ARBBZ3FXHT7MM'; 

const BASE_URL = 'https://api.climatiq.io/data/v1';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`, 
    'Content-Type': 'application/json',
  },
});

export const estimateEmissions = async (activityId, amount, unit, unitType) => {
  let parameterKey = 'distance'; 
  
  // Dynamically map unit types to the correct parameter key
  switch (unitType) {
    case 'Energy': parameterKey = 'energy'; break;
    case 'Volume': parameterKey = 'volume'; break;
    case 'Weight': parameterKey = 'weight'; break;
    case 'Money':  parameterKey = 'money'; break;
    case 'Time':   parameterKey = 'time'; break;
    default:       parameterKey = 'distance';
  }

  const payload = {
    emission_factor: {
      activity_id: activityId,
      // UPDATED: Changed from ^6 to ^21 to match the documentation you found.
      // This ensures we are using a recent enough database version.
      data_version: '^21', 
    },
    parameters: {
      [parameterKey]: parseFloat(amount), 
      [`${parameterKey}_unit`]: unit,
    },
  };

  console.log("Sending Payload to Climatiq:", JSON.stringify(payload, null, 2));

  try {
    const response = await client.post('/estimate', payload);
    return response.data;
  } catch (error) {
    // Improved error logging to help you see exactly what Climatiq is rejecting
    console.error('Climatiq Error Details:', error.response?.data || error.message);
    throw new Error('Climatiq API call failed. Check console for details.');
  }
};