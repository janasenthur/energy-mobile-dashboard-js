import { Platform } from 'react-native';

// Web-compatible notifications service
const WebNotifications = {
  setNotificationHandler: (handler) => {
    console.log('Notification handler set (web mode)');
  },
  
  requestPermissionsAsync: async () => ({
    status: 'granted',
    canAskAgain: true,
    expires: 'never',
    granted: true,
  }),
  
  getPermissionsAsync: async () => ({
    status: 'granted',
    canAskAgain: true,
    expires: 'never',
    granted: true,
  }),
  
  scheduleNotificationAsync: async (content, trigger) => {
    console.log('Notification scheduled (web mode):', content.title);
    // Return a mock notification ID
    return `web-notification-${Date.now()}`;
  },
  
  presentNotificationAsync: async (content) => {
    console.log('Notification presented (web mode):', content.title);
    
    // Show browser notification if supported
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(content.title, {
            body: content.body,
            icon: '/favicon.ico',
          });
        }
      } catch (error) {
        console.log('Browser notification failed:', error);
      }
    }
    
    return `web-notification-${Date.now()}`;
  },
  
  cancelScheduledNotificationAsync: async (id) => {
    console.log('Notification cancelled (web mode):', id);
  },
  
  cancelAllScheduledNotificationsAsync: async () => {
    console.log('All notifications cancelled (web mode)');
  },
  
  addNotificationReceivedListener: (listener) => {
    console.log('Notification received listener added (web mode)');
    // Return a mock subscription
    return {
      remove: () => console.log('Notification listener removed (web mode)'),
    };
  },
  
  addNotificationResponseReceivedListener: (listener) => {
    console.log('Notification response listener added (web mode)');
    // Return a mock subscription
    return {
      remove: () => console.log('Notification response listener removed (web mode)'),
    };
  },

  getExpoPushTokenAsync: async () => {
    console.log('Getting Expo push token (web mode - mock)');
    // Return a mock push token for web
    return {
      data: `ExponentPushToken[web-mock-${Date.now()}]`,
      type: 'expo',
    };
  },
  
  IosAuthorizationStatus: {
    NOT_DETERMINED: 0,
    DENIED: 1,
    AUTHORIZED: 2,
    PROVISIONAL: 3,
    EPHEMERAL: 4,
  },
  
  AndroidImportance: {
    UNSPECIFIED: -1000,
    NONE: 0,
    MIN: 1,
    LOW: 2,
    DEFAULT: 3,
    HIGH: 4,
    MAX: 5,
  },
};

// Export the appropriate implementation based on platform
const Notifications = Platform.OS === 'web' ? WebNotifications : require('expo-notifications');

export default Notifications;

// Export additional constants for non-web platforms  
export const IosAuthorizationStatus = Platform.OS === 'web' ? WebNotifications.IosAuthorizationStatus : require('expo-notifications').IosAuthorizationStatus;
export const AndroidImportance = Platform.OS === 'web' ? WebNotifications.AndroidImportance : require('expo-notifications').AndroidImportance;
