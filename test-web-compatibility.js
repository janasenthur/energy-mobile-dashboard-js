// Quick test script to validate web compatibility fixes
const { Platform } = require('react-native');

console.log('🧪 Testing Web Compatibility...');
console.log('Platform:', Platform.OS);

try {
  // Test web-compatible imports
  console.log('✅ Testing imports...');
  
  // These should not throw errors
  const MapComponent = require('./src/components/WebCompatibleMap.js');
  console.log('✅ WebCompatibleMap imported successfully');
  
  const LocationService = require('./src/services/webCompatibleLocation.js');
  console.log('✅ webCompatibleLocation imported successfully');
  
  const NotificationService = require('./src/services/webCompatibleNotifications.js');
  console.log('✅ webCompatibleNotifications imported successfully');
  
  console.log('');
  console.log('🎉 All web compatibility components loaded successfully!');
  console.log('');
  console.log('Your app should now be able to start on web without errors.');
  console.log('Run: npx expo start --web');
  
} catch (error) {
  console.error('❌ Error during compatibility test:', error.message);
  console.error('Stack:', error.stack);
}
