import Notifications from './webCompatibleNotifications';
import { Platform } from 'react-native';
import { apiService } from './apiService';
import { API_CONFIG } from '../config/config';

class NotificationService {
  constructor() {
    this.pushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  async initialize() {
    // Configure notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Request permissions and get push token
    const token = await this.registerForPushNotifications();
    if (token) {
      this.pushToken = token;
      await this.sendTokenToServer(token);
    }

    // Set up listeners
    this.setupListeners();

    return token;
  }

  async registerForPushNotifications() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      // Create additional channels for different notification types
      await Notifications.setNotificationChannelAsync('jobs', {
        name: 'Job Notifications',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0066FF',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('emergencies', {
        name: 'Emergency Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF0000',
        sound: 'default',
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

    try {
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Push token:', token);
    } catch (error) {
      console.error('Error getting push token:', error);
    }

    return token;
  }

  setupListeners() {
    // Listen for notifications received while app is running
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Listen for user tapping on notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  removeListeners() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  handleNotificationReceived(notification) {
    // Handle incoming notifications while app is active
    const { title, body, data } = notification.request.content;
    
    // You can add custom logic here based on notification type
    console.log(`Received: ${title} - ${body}`, data);
  }

  handleNotificationResponse(response) {
    // Handle user tapping on notification
    const { title, body, data } = response.notification.request.content;
    
    // Navigate to appropriate screen based on notification data
    if (data && data.screen) {
      // This would integrate with your navigation system
      console.log(`Navigate to: ${data.screen}`, data);
    }
  }

  async sendTokenToServer(token) {
    try {
      await apiService.post('/user/push-token', { token });
      console.log('Push token sent to server');
    } catch (error) {
      console.error('Error sending push token to server:', error);
    }
  }

  async scheduleLocalNotification(title, body, data = {}, delay = 0) {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: delay > 0 ? { seconds: delay } : null,
      });

      return identifier;
    } catch (error) {
      console.error('Error scheduling local notification:', error);
      return null;
    }
  }

  async scheduleJobNotification(jobData, delay = 0) {
    const title = 'New Job Assignment';
    const body = `Job #${jobData.id}: ${jobData.type} - ${jobData.location}`;
    
    return await this.scheduleLocalNotification(
      title,
      body,
      {
        type: 'job',
        jobId: jobData.id,
        screen: 'DriverJobs',
      },
      delay
    );
  }

  async schedulePaymentNotification(paymentData) {
    const title = 'Payment Received';
    const body = `$${paymentData.amount} payment processed for job #${paymentData.jobId}`;
    
    return await this.scheduleLocalNotification(
      title,
      body,
      {
        type: 'payment',
        paymentId: paymentData.id,
        jobId: paymentData.jobId,
        screen: 'DriverReports',
      }
    );
  }

  async scheduleEmergencyNotification(message, data = {}) {
    return await this.scheduleLocalNotification(
      'Emergency Alert',
      message,
      {
        type: 'emergency',
        ...data,
        priority: 'high',
      }
    );
  }

  async scheduleMaintenanceNotification(message, scheduledTime) {
    const delay = Math.max(0, scheduledTime - Date.now()) / 1000;
    
    return await this.scheduleLocalNotification(
      'Scheduled Maintenance',
      message,
      {
        type: 'maintenance',
        screen: 'Help',
      },
      delay
    );
  }

  async cancelNotification(identifier) {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  async getBadgeCount() {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }

  async setBadgeCount(count) {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  async clearBadge() {
    await this.setBadgeCount(0);
  }

  // Utility methods for different user roles
  async sendDriverNotification(driverId, title, body, data = {}) {
    try {
      await apiService.post('/notifications/send-to-driver', {
        driverId,
        title,
        body,
        data,
      });
    } catch (error) {
      console.error('Error sending driver notification:', error);
    }
  }

  async sendCustomerNotification(customerId, title, body, data = {}) {
    try {
      await apiService.post('/notifications/send-to-customer', {
        customerId,
        title,
        body,
        data,
      });
    } catch (error) {
      console.error('Error sending customer notification:', error);
    }
  }

  async sendDispatcherNotification(dispatcherId, title, body, data = {}) {
    try {
      await apiService.post('/notifications/send-to-dispatcher', {
        dispatcherId,
        title,
        body,
        data,
      });
    } catch (error) {
      console.error('Error sending dispatcher notification:', error);
    }
  }

  async sendBroadcastNotification(title, body, data = {}, userRoles = []) {
    try {
      await apiService.post('/notifications/broadcast', {
        title,
        body,
        data,
        userRoles,
      });
    } catch (error) {
      console.error('Error sending broadcast notification:', error);
    }
  }
}

export const notificationService = new NotificationService();
