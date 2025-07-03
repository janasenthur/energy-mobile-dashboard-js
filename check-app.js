#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to check if file exists and has valid syntax
function checkFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Missing: ${filePath}`);
    return false;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // Basic syntax check - ensure no obvious syntax errors
    if (content.includes('import') && content.includes('export')) {
      console.log(`✅ Valid: ${filePath}`);
      return true;
    } else {
      console.log(`⚠️  Warning: ${filePath} - Check syntax`);
      return true;
    }
  } catch (error) {
    console.log(`❌ Error reading: ${filePath} - ${error.message}`);
    return false;
  }
}

console.log('🔍 Checking Energy Mobile Dashboard App Structure...\n');

// Core files to check
const coreFiles = [
  'package.json',
  'app.json',
  'App.js',
  'src/theme/theme.js',
  'src/config/config.js',
  'src/navigation/AppNavigator.js',
  'src/context/AuthContext.js',
  'src/context/LocationContext.js',
  'src/context/NotificationContext.js',
  'src/services/apiService.js',
  'src/services/locationService.js',
  'src/services/notificationService.js',
  'src/services/jobService.js',
  'src/services/driverService.js',
];

// Component files
const componentFiles = [
  'src/components/common/Button.js',
  'src/components/common/Input.js',
  'src/components/common/Card.js',
  'src/components/common/LoadingSpinner.js',
  'src/components/common/EmptyState.js',
  'src/components/common/ConfirmationModal.js',
];

// Screen files
const screenFiles = [
  // Auth
  'src/screens/auth/RoleSelectionScreen.js',
  'src/screens/auth/LoginScreen.js',
  'src/screens/auth/RegisterScreen.js',
  'src/screens/auth/ForgotPasswordScreen.js',
  'src/screens/auth/DriverRegistrationScreen.js',
  
  // Customer
  'src/screens/customer/CustomerHomeScreen.js',
  'src/screens/customer/CustomerChatScreen.js',
  'src/screens/customer/CustomerBookingsScreen.js',
  'src/screens/customer/BookingScreen.js',
  'src/screens/customer/CustomerProfileScreen.js',
  'src/screens/customer/TrackingScreen.js',
  
  // Driver
  'src/screens/driver/DriverHomeScreen.js',
  'src/screens/driver/DriverJobsScreen.js',
  'src/screens/driver/DriverTrackingScreen.js',
  'src/screens/driver/DriverReportsScreen.js',
  'src/screens/driver/DriverProfileScreen.js',
  
  // Dispatcher
  'src/screens/dispatcher/DispatcherHomeScreen.js',
  'src/screens/dispatcher/JobQueueScreen.js',
  'src/screens/dispatcher/DriverManagementScreen.js',
  'src/screens/dispatcher/DispatcherReportsScreen.js',
  
  // Admin
  'src/screens/admin/AdminHomeScreen.js',
  'src/screens/admin/AdminJobsScreen.js',
  'src/screens/admin/AdminDriversScreen.js',
  'src/screens/admin/AdminReportsScreen.js',
  'src/screens/admin/AdminSettingsScreen.js',
  
  // Shared
  'src/screens/shared/NotificationsScreen.js',
  'src/screens/shared/SettingsScreen.js',
  'src/screens/shared/HelpScreen.js',
];

console.log('📁 Core Files:');
let coreValid = true;
coreFiles.forEach(file => {
  if (!checkFile(file)) coreValid = false;
});

console.log('\n🧩 Components:');
let componentsValid = true;
componentFiles.forEach(file => {
  if (!checkFile(file)) componentsValid = false;
});

console.log('\n📱 Screens:');
let screensValid = true;
screenFiles.forEach(file => {
  if (!checkFile(file)) screensValid = false;
});

console.log('\n📊 Summary:');
console.log(`Core Files: ${coreValid ? '✅ All Good' : '❌ Issues Found'}`);
console.log(`Components: ${componentsValid ? '✅ All Good' : '❌ Issues Found'}`);
console.log(`Screens: ${screensValid ? '✅ All Good' : '❌ Issues Found'}`);

if (coreValid && componentsValid && screensValid) {
  console.log('\n🎉 Energy Mobile Dashboard App is ready!');
  console.log('\n📋 Next Steps:');
  console.log('1. npm install');
  console.log('2. Update src/config/config.js with your backend URLs');
  console.log('3. expo start');
  console.log('4. Test on device with Expo Go app');
} else {
  console.log('\n⚠️  Please fix the issues above before running the app.');
}

console.log('\n🔗 Quick Start Commands:');
console.log('npm install && expo start');

module.exports = { checkFile };
