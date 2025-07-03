const axios = require('axios');

// Test the backend API endpoints
async function testBackendAPI() {
  const baseURL = 'http://localhost:3000/api';
  
  console.log('🧪 Testing Backend API...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:3000/health');
    console.log('✅ Health check:', healthResponse.data.status);

    // Test 2: Register a test user with strong password
    console.log('\n2. Testing user registration...');
    const registerData = {
      email: 'newtest@nbs.com',
      password: 'Test123!', // Strong password: uppercase, lowercase, numbers, special char
      first_name: 'Test',
      last_name: 'User',
      phone: '+1234567890'
    };

    try {
      const registerResponse = await axios.post(`${baseURL}/auth/register`, registerData);
      console.log('✅ Registration successful:', registerResponse.data);
    } catch (regError) {
      if (regError.response?.status === 400 && regError.response?.data?.error?.includes('already exists')) {
        console.log('ℹ️  User already exists, trying login...');
      } else {
        console.log('❌ Registration error:', regError.response?.data || regError.message);
      }
    }

    // Test 3: Login test user
    console.log('\n3. Testing user login...');
    const loginData = {
      email: 'admin@nbs.com', // Use existing user
      password: 'admin123'
    }; // Removed role field from login payload

    try {
      const loginResponse = await axios.post(`${baseURL}/auth/login`, loginData);
      console.log('✅ Login successful:', {
        user: loginResponse.data.data.user.email,
        role: loginResponse.data.data.user.role,
        token: loginResponse.data.data.token ? 'Generated' : 'Missing'
      });

      // Test 4: Test authenticated endpoint
      console.log('\n4. Testing authenticated endpoint...');
      const token = loginResponse.data.data.token;
      const profileResponse = await axios.get(`${baseURL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Profile fetch successful:', profileResponse.data.data.email);

    } catch (loginError) {
      console.log('❌ Login error:', loginError.response?.data || loginError.message);
    }

  } catch (error) {
    console.log('❌ Backend connection failed:', error.message);
    console.log('💡 Make sure the backend server is running on http://localhost:3000');
  }
}

testBackendAPI();
