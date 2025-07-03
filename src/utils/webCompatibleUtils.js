// Web-compatible Utilities
import { Dimensions } from 'react-native';

export const DeviceInfo = {
  getModel: () => 'Web Device',
  getBrand: () => 'Browser',
  getSystemName: () => 'Web',
  getSystemVersion: () => navigator.userAgent,
  getUniqueId: () => 'web-device-id',
  isTablet: () => {
    const { width, height } = Dimensions.get('window');
    return Math.min(width, height) >= 768;
  },
};

export const NetInfo = {
  fetch: async () => ({
    type: navigator.onLine ? 'wifi' : 'none',
    isConnected: navigator.onLine,
    isInternetReachable: navigator.onLine,
  }),
  addEventListener: (callback) => {
    const handleOnline = () => callback({
      type: 'wifi',
      isConnected: true,
      isInternetReachable: true,
    });
    const handleOffline = () => callback({
      type: 'none',
      isConnected: false,
      isInternetReachable: false,
    });
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  },
};

export const Permissions = {
  LOCATION: 'location',
  CAMERA: 'camera',
  NOTIFICATIONS: 'notifications',
  
  request: async (permission) => {
    if (permission === 'location') {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        return result.state === 'granted' ? 'granted' : 'denied';
      } catch {
        return 'denied';
      }
    }
    return 'granted'; // Default for web
  },
  
  check: async (permission) => {
    if (permission === 'location') {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        return result.state === 'granted' ? 'granted' : 'denied';
      } catch {
        return 'denied';
      }
    }
    return 'granted'; // Default for web
  },
};

export const Haptics = {
  impact: () => {
    // Web fallback - try to use vibration API if available
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  },
  notification: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  },
  selection: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(25);
    }
  },
};

export const StatusBar = {
  setBarStyle: () => {},
  setBackgroundColor: () => {},
  setHidden: () => {},
  setTranslucent: () => {},
};
