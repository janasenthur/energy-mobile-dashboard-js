import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '../config/config';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
          await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
          await AsyncStorage.removeItem(STORAGE_KEYS.USER_ROLE);
          
          // Navigate to login screen
          // This would be handled by your navigation context
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic HTTP methods
  async get(url, params = {}) {
    try {
      const response = await this.api.get(url, { params });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post(url, data = {}) {
    try {
      const response = await this.api.post(url, data);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put(url, data = {}) {
    try {
      const response = await this.api.put(url, data);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete(url) {
    try {
      const response = await this.api.delete(url);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async upload(url, formData) {
    try {
      const response = await this.api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.message || 'Server error occurred';
      return new Error(errorMessage);
    } else if (error.request) {
      // Network error
      return new Error('Network error. Please check your connection.');
    } else {
      // Other error
      return new Error('An unexpected error occurred');
    }
  }

  // Auth API methods
  async login(credentials) {
    return this.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials);
  }

  async register(userData) {
    return this.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData);
  }

  async refreshToken() {
    return this.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH);
  }

  async logout() {
    return this.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
  }

  async forgotPassword(email) {
    return this.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  }

  async resetPassword(token, password) {
    return this.post(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, { token, password });
  }

  // User API methods
  async getUserProfile() {
    return this.get(API_CONFIG.ENDPOINTS.USER.PROFILE);
  }

  async updateUserProfile(userData) {
    return this.put(API_CONFIG.ENDPOINTS.USER.UPDATE_PROFILE, userData);
  }

  async changePassword(passwordData) {
    return this.post(API_CONFIG.ENDPOINTS.USER.CHANGE_PASSWORD, passwordData);
  }

  // Jobs API methods
  async getJobs(filters = {}) {
    return this.get(API_CONFIG.ENDPOINTS.JOBS.LIST, filters);
  }

  async createJob(jobData) {
    return this.post(API_CONFIG.ENDPOINTS.JOBS.CREATE, jobData);
  }

  async updateJob(jobId, jobData) {
    return this.put(`${API_CONFIG.ENDPOINTS.JOBS.UPDATE}/${jobId}`, jobData);
  }

  async deleteJob(jobId) {
    return this.delete(`${API_CONFIG.ENDPOINTS.JOBS.DELETE}/${jobId}`);
  }

  async assignJob(jobId, driverId) {
    return this.post(API_CONFIG.ENDPOINTS.JOBS.ASSIGN, { jobId, driverId });
  }

  async updateJobStatus(jobId, status, location = null) {
    return this.put(`${API_CONFIG.ENDPOINTS.JOBS.STATUS}/${jobId}`, { status, location });
  }

  // Drivers API methods
  async getDrivers(filters = {}) {
    return this.get(API_CONFIG.ENDPOINTS.DRIVERS.LIST, filters);
  }

  async registerDriver(driverData) {
    return this.post(API_CONFIG.ENDPOINTS.DRIVERS.REGISTER, driverData);
  }

  async updateDriver(driverId, driverData) {
    return this.put(`${API_CONFIG.ENDPOINTS.DRIVERS.UPDATE}/${driverId}`, driverData);
  }

  async updateDriverLocation(location) {
    return this.post(API_CONFIG.ENDPOINTS.DRIVERS.LOCATION, location);
  }

  async getDriverReports(driverId, filters = {}) {
    return this.get(`${API_CONFIG.ENDPOINTS.DRIVERS.REPORTS}/${driverId}`, filters);
  }

  // Tracking API methods
  async updateLocation(locationData) {
    return this.post(API_CONFIG.ENDPOINTS.TRACKING.UPDATE_LOCATION, locationData);
  }

  async getRoute(jobId) {
    return this.get(`${API_CONFIG.ENDPOINTS.TRACKING.GET_ROUTE}/${jobId}`);
  }

  async optimizeRoute(routeData) {
    return this.post(API_CONFIG.ENDPOINTS.TRACKING.OPTIMIZE_ROUTE, routeData);
  }

  // Notifications API methods
  async getNotifications() {
    return this.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS.LIST);
  }

  async markNotificationAsRead(notificationId) {
    return this.post(API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_READ, { notificationId });
  }

  async updateNotificationSettings(settings) {
    return this.put(API_CONFIG.ENDPOINTS.NOTIFICATIONS.SETTINGS, settings);
  }

  // Reports API methods
  async generateReport(reportType, filters = {}) {
    return this.post(API_CONFIG.ENDPOINTS.REPORTS.GENERATE, { reportType, filters });
  }

  async downloadReport(reportId) {
    return this.get(`${API_CONFIG.ENDPOINTS.REPORTS.DOWNLOAD}/${reportId}`);
  }
}

export const apiService = new ApiService();
