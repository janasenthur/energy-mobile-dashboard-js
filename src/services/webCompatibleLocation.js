import { Platform } from 'react-native';

// Web-compatible location service
const WebLocation = {
  requestForegroundPermissionsAsync: async () => ({
    status: 'granted',
    canAskAgain: true,
    expires: 'never',
    granted: true,
  }),
  
  getCurrentPositionAsync: async (options = {}) => {
    // Return a mock location for web
    return {
      coords: {
        latitude: 39.8283,
        longitude: -98.5795,
        altitude: null,
        accuracy: 100,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    };
  },
  
  watchPositionAsync: async (options, callback) => {
    // Mock location updates for web
    const mockLocation = {
      coords: {
        latitude: 39.8283 + (Math.random() - 0.5) * 0.01,
        longitude: -98.5795 + (Math.random() - 0.5) * 0.01,
        altitude: null,
        accuracy: 100,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    };
    
    // Call callback immediately with mock data
    callback(mockLocation);
    
    // Return a mock subscription
    return {
      remove: () => console.log('Location watching stopped (web)'),
    };
  },
  
  LocationAccuracy: {
    Highest: 1,
    High: 2,
    Balanced: 3,
    Low: 4,
    Lowest: 5,
    BestForNavigation: 6,
  },
};

// Export the appropriate implementation based on platform
const Location = Platform.OS === 'web' ? WebLocation : require('expo-location');

export default Location;

// Export additional constants for non-web platforms
export const Accuracy = Platform.OS === 'web' ? WebLocation.LocationAccuracy : require('expo-location').Accuracy;
export const LocationAccuracy = Platform.OS === 'web' ? WebLocation.LocationAccuracy : require('expo-location').LocationAccuracy;
