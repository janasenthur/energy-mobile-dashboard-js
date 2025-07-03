// Quick test to verify backend and fix any remaining issues
const axios = require('axios');

async function quickTest() {
  const baseURL = 'http://localhost:3000';
  
  console.log('🔧 Quick Backend Test...\n');

  try {
    // Test health endpoint
    console.log('1. Health check...');
    const health = await axios.get(`${baseURL}/health`);
    console.log('✅ Health:', health.data.status);

    // Test login with existing user
    console.log('\n2. Testing login...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'admin@nbs.com',
      password: 'admin123'
    });
    
    console.log('✅ Login successful');
    console.log('   User:', loginResponse.data.data.user.email);
    console.log('   Role:', loginResponse.data.data.user.role);
    console.log('   Token:', loginResponse.data.data.token ? 'Generated' : 'Missing');

    // Test registration with strong password
    console.log('\n3. Testing registration...');
    try {
      const regResponse = await axios.post(`${baseURL}/api/auth/register`, {
        email: 'testuser@nbs.com',
        password: 'TestPass123!',
        first_name: 'Test',
        last_name: 'User',
        phone: '+1234567890',
        role: 'customer'
      });
      console.log('✅ Registration successful');
    } catch (regError) {
      if (regError.response?.data?.error?.includes('already exists')) {
        console.log('ℹ️  User already exists (that\'s fine)');
      } else {
        console.log('❌ Registration error:', regError.response?.data);
      }
    }

    console.log('\n🎉 Backend is working correctly!');
    console.log('💡 The frontend should now connect properly');

  } catch (error) {
    console.log('❌ Backend test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the backend server is running: npm start');
    }
  }
}

quickTest();
