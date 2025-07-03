// API Configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const isWeb = typeof window !== 'undefined';

export const API_CONFIG = {
  // Use local backend API for both development and production
  BASE_URL: isDevelopment 
    ? 'http://localhost:3000/api'  // Local backend API
    : 'https://your-production-api.com/api', // Update with your production API URL
  TIMEOUT: 30000,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      REFRESH: '/auth/refresh',
      LOGOUT: '/auth/logout',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
      ME: '/auth/me',
    },
    USER: {
      PROFILE: '/user/profile',
      UPDATE_PROFILE: '/user/update-profile',
      CHANGE_PASSWORD: '/auth/change-password',
      NOTIFICATION_SETTINGS: '/user/notification-settings',
      PUSH_TOKEN: '/user/push-token',
      STATISTICS: '/user/statistics',
    },
    JOBS: {
      LIST: '/jobs',
      CREATE: '/jobs/create',
      UPDATE: '/jobs',
      DELETE: '/jobs',
      ASSIGN: '/jobs',
      STATUS: '/jobs',
    },
    DRIVERS: {
      LIST: '/drivers',
      REGISTER: '/drivers/register',
      UPDATE: '/drivers',
      LOCATION: '/drivers/location',
      AVAILABILITY: '/drivers/availability',
      REPORTS: '/drivers',
      PUNCH: '/drivers/punch',
    },
    TRACKING: {
      UPDATE_LOCATION: '/tracking/location',
      GET_ROUTE: '/tracking/route',
      OPTIMIZE_ROUTE: '/tracking/optimize-route',
      TRACK: '/tracking/track',
    },
    NOTIFICATIONS: {
      LIST: '/notifications',
      MARK_READ: '/notifications/read',
      DELETE: '/notifications',
      SETTINGS: '/notifications/settings',
      UNREAD_COUNT: '/notifications/unread-count',
    },
    REPORTS: {
      GENERATE: '/reports/generate',
      DOWNLOAD: '/reports/download',
      DASHBOARD: '/reports/dashboard',
    },
  },
};

// Database Configuration
export const DB_CONFIG = {
  HOST: 'your-postgres-host',
  PORT: 5432,
  DATABASE: 'energy_dashboard',
  USERNAME: 'your-username',
  PASSWORD: 'your-password',
};

// Map Configuration
export const MAP_CONFIG = {
  GOOGLE_MAPS_API_KEY: 'your-google-maps-api-key',
  DEFAULT_REGION: {
    latitude: 39.8283,
    longitude: -98.5795,
    latitudeDelta: 20,
    longitudeDelta: 20,
  },
};

// Notification Configuration
export const NOTIFICATION_CONFIG = {
  FIREBASE_SERVER_KEY: 'your-firebase-server-key',
  SENDER_ID: 'your-sender-id',
};

// Storage Keys
export const STORAGE_KEYS = {
  USER_TOKEN: '@user_token',
  USER_DATA: '@user_data',
  USER_ROLE: '@user_role',
  SETTINGS: '@settings',
  LOCATION_PERMISSION: '@location_permission',
};
