// Test script to validate JS component imports
const React = require('react');

try {
  const TruckIcon = require('./assets/truck-icon.png.js');
  const Truck1 = require('./assets/truck1.png.js');
  const Truck2 = require('./assets/truck2.png.js');
  const Truck3 = require('./assets/truck3.png.js');
  const DefaultAvatar = require('./assets/default-avatar.png.js');
  const DriverAvatar = require('./assets/driver-avatar.png.js');
  const CustomerAvatar = require('./assets/customer-avatar.png.js');
  const Announcement1 = require('./assets/announcement1.png.js');
  const AnnouncementDriver = require('./assets/announcement-driver.png.js');
  
  console.log('✅ All image components imported successfully!');
  console.log('📦 Components available:');
  console.log('  - TruckIcon');
  console.log('  - Truck1, Truck2, Truck3');
  console.log('  - DefaultAvatar, DriverAvatar, CustomerAvatar');
  console.log('  - Announcement1, AnnouncementDriver');
  
} catch (error) {
  console.error('❌ Error importing components:', error.message);
}
