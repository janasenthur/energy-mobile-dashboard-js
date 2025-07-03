import React, { createContext, useContext, useReducer, useEffect } from 'react';
import Notifications from '../services/webCompatibleNotifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/apiService';
import { API_CONFIG, STORAGE_KEYS } from '../config/config';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const NotificationContext = createContext();

const initialState = {
  notifications: [],
  unreadCount: 0,
  pushToken: null,
  permissions: null,
  loading: false,
  error: null,
};

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return { 
        ...state, 
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.read).length,
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: action.payload.read ? state.unreadCount : state.unreadCount + 1,
      };
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => 
          n.id === action.payload ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      };
    case 'SET_PUSH_TOKEN':
      return { ...state, pushToken: action.payload };
    case 'SET_PERMISSIONS':
      return { ...state, permissions: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  useEffect(() => {
    initializeNotifications();
    setupNotificationListeners();
  }, []);

  const initializeNotifications = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      dispatch({ type: 'SET_PERMISSIONS', payload: status });

      if (status === 'granted') {
        // Get push token
        const token = await registerForPushNotificationsAsync();
        if (token) {
          dispatch({ type: 'SET_PUSH_TOKEN', payload: token });
          // Send token to backend
          await sendPushTokenToServer(token);
        }
      }

      // Load existing notifications
      await loadNotifications();
      
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('Error initializing notifications:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize notifications' });
    }
  };

  const registerForPushNotificationsAsync = async () => {
    let token;
    
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
  };

  const setupNotificationListeners = () => {
    // Listen for incoming notifications
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      const newNotification = {
        id: notification.request.identifier,
        title: notification.request.content.title,
        body: notification.request.content.body,
        data: notification.request.content.data,
        timestamp: new Date().toISOString(),
        read: false,
      };
      
      dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
    });

    // Listen for notification taps
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const notificationId = response.notification.request.identifier;
      markAsRead(notificationId);
      
      // Handle navigation based on notification data
      handleNotificationTap(response.notification.request.content.data);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  };

  const sendPushTokenToServer = async (token) => {
    try {
      // Only send token if user is authenticated
      const userToken = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      if (userToken) {
        await apiService.post('/user/push-token', { token });
      } else {
        console.log('User not authenticated, skipping push token registration');
      }
    } catch (error) {
      console.error('Error sending push token to server:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      // Only load notifications if user is authenticated
      const userToken = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      if (userToken) {
        const response = await apiService.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS.LIST);
        dispatch({ type: 'SET_NOTIFICATIONS', payload: response.data });
      } else {
        console.log('User not authenticated, skipping notification loading');
        // Set empty notifications array
        dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Return mock data for development
      const mockNotifications = [
        {
          id: '1',
          title: 'New Job Assignment',
          message: 'You have been assigned a new delivery job #12345',
          type: 'job',
          timestamp: '2 hours ago',
          read: false,
        },
        {
          id: '2',
          title: 'Payment Received',
          message: 'Payment of $150.00 has been processed for job #12344',
          type: 'payment',
          timestamp: '4 hours ago',
          read: true,
        },
        {
          id: '3',
          title: 'System Maintenance',
          message: 'Scheduled maintenance will occur tonight from 2-4 AM',
          type: 'system',
          timestamp: '1 day ago',
          read: false,
        },
      ];
      dispatch({ type: 'SET_NOTIFICATIONS', payload: mockNotifications });
    }
  };

  const refreshNotifications = async () => {
    await loadNotifications();
  };

  const clearNotification = async (notificationId) => {
    try {
      await apiService.delete(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS.DELETE}/${notificationId}`);
      const updatedNotifications = state.notifications.filter(n => n.id !== notificationId);
      dispatch({ type: 'SET_NOTIFICATIONS', payload: updatedNotifications });
    } catch (error) {
      console.error('Error clearing notification:', error);
      // For development, just remove from local state
      const updatedNotifications = state.notifications.filter(n => n.id !== notificationId);
      dispatch({ type: 'SET_NOTIFICATIONS', payload: updatedNotifications });
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await apiService.post(API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_READ, {
        notificationId,
      });
      dispatch({ type: 'MARK_AS_READ', payload: notificationId });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiService.post(API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_READ, {
        markAll: true,
      });
      dispatch({ type: 'MARK_ALL_AS_READ' });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const sendLocalNotification = async (title, body, data = {}) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  };

  const handleNotificationTap = (data) => {
    // Handle navigation based on notification type
    // This would be implemented based on your navigation structure
    console.log('Notification tapped:', data);
  };

  const value = {
    ...state,
    markAsRead,
    markAllAsRead,
    sendLocalNotification,
    loadNotifications,
    refreshNotifications,
    clearNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
