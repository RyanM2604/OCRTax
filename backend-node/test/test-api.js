const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

// Test configuration
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  firstName: 'Test',
  lastName: 'User'
};

// Helper function to make authenticated requests
const authRequest = (method, url, data = null) => {
  const config = {
    method,
    url: `${BASE_URL}${url}`,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    }
  };
  
  if (data) {
    config.data = data;
  }
  
  return axios(config);
};

// Test functions
const testHealthCheck = async () => {
  try {
    console.log('🔍 Testing health check...');
    const response = await axios.get('http://localhost:5000/health');
    console.log('✅ Health check passed:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
};

const testRegistration = async () => {
  try {
    console.log('🔍 Testing user registration...');
    const response = await authRequest('POST', '/auth/register', testUser);
    console.log('✅ Registration successful:', response.data.message);
    return true;
  } catch (error) {
    if (error.response?.data?.message?.includes('already exists')) {
      console.log('⚠️  User already exists, continuing...');
      return true;
    }
    console.error('❌ Registration failed:', error.response?.data || error.message);
    return false;
  }
};

const testLogin = async () => {
  try {
    console.log('🔍 Testing user login...');
    const response = await authRequest('POST', '/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    
    authToken = response.data.data.token;
    console.log('✅ Login successful');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
};

const testGetProfile = async () => {
  try {
    console.log('🔍 Testing get profile...');
    const response = await authRequest('GET', '/auth/profile');
    console.log('✅ Profile retrieved:', response.data.data.user.email);
    return true;
  } catch (error) {
    console.error('❌ Get profile failed:', error.response?.data || error.message);
    return false;
  }
};

const testGetDocuments = async () => {
  try {
    console.log('🔍 Testing get documents...');
    const response = await authRequest('GET', '/documents');
    console.log('✅ Documents retrieved:', response.data.data.documents.length, 'documents');
    return true;
  } catch (error) {
    console.error('❌ Get documents failed:', error.response?.data || error.message);
    return false;
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting API tests...\n');
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'User Registration', fn: testRegistration },
    { name: 'User Login', fn: testLogin },
    { name: 'Get Profile', fn: testGetProfile },
    { name: 'Get Documents', fn: testGetDocuments }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`);
    const result = await test.fn();
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! The API is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the server logs.');
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests }; 