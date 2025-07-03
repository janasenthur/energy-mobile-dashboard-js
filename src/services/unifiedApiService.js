import { apiService } from './apiService';
import devApiService from './devApiService';

// Determine which API service to use
const isDevelopment = process.env.NODE_ENV === 'development';
const isWeb = typeof window !== 'undefined';

// Use real API always (disable mock API for proper backend integration)
const shouldUseMockApi = false; // Changed: Always use real API now that backend is ready

console.log('API Service Selection:', {
  isDevelopment,
  isWeb,
  shouldUseMockApi,
  service: shouldUseMockApi ? 'Mock API' : 'Real API'
});

// Create a unified API interface
class UnifiedApiService {
  constructor() {
    this.realApi = apiService;
    this.mockApi = devApiService;
    this.useMock = shouldUseMockApi;
  }

  // Helper to route to appropriate service
  getService() {
    return this.useMock ? this.mockApi : this.realApi;
  }

  // Auth methods
  async login(credentials) {
    if (this.useMock) {
      return { data: await this.mockApi.login(credentials) };
    }
    
    try {
      console.log('Logging in with credentials:', { email: credentials.email, passwordLength: credentials.password?.length });
      const response = await this.realApi.login(credentials);
      console.log('Login API response structure:', Object.keys(response.data));
      return response;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  }

  async register(userData) {
    if (this.useMock) {
      return { data: await this.mockApi.register(userData) };
    }
    return this.realApi.register(userData);
  }

  async refreshToken() {
    if (this.useMock) {
      return { data: { success: true, token: 'mock-refresh-token' } };
    }
    return this.realApi.refreshToken();
  }

  async logout() {
    if (this.useMock) {
      return { data: { success: true } };
    }
    return this.realApi.logout();
  }

  async forgotPassword(email) {
    if (this.useMock) {
      return { data: { success: true, message: 'Password reset email sent' } };
    }
    return this.realApi.forgotPassword(email);
  }

  async resetPassword(token, password) {
    if (this.useMock) {
      return { data: { success: true, message: 'Password reset successful' } };
    }
    return this.realApi.resetPassword(token, password);
  }

  // User methods
  async getUserProfile() {
    if (this.useMock) {
      return { data: await this.mockApi.getProfile() };
    }
    return this.realApi.getUserProfile();
  }

  async updateUserProfile(userData) {
    if (this.useMock) {
      return { data: await this.mockApi.updateProfile(userData) };
    }
    return this.realApi.updateUserProfile(userData);
  }

  async changePassword(passwordData) {
    if (this.useMock) {
      return { data: { success: true, message: 'Password changed successfully' } };
    }
    return this.realApi.changePassword(passwordData);
  }

  // Jobs methods
  async getJobs(filters = {}) {
    if (this.useMock) {
      return { data: await this.mockApi.getJobs() };
    }
    return this.realApi.getJobs(filters);
  }

  async createJob(jobData) {
    if (this.useMock) {
      return { data: { success: true, id: Date.now(), ...jobData } };
    }
    return this.realApi.createJob(jobData);
  }

  async updateJob(jobId, jobData) {
    if (this.useMock) {
      return { data: { success: true, id: jobId, ...jobData } };
    }
    return this.realApi.updateJob(jobId, jobData);
  }

  async deleteJob(jobId) {
    if (this.useMock) {
      return { data: { success: true, id: jobId } };
    }
    return this.realApi.deleteJob(jobId);
  }

  async assignJob(jobId, driverId) {
    if (this.useMock) {
      return { data: { success: true, jobId, driverId } };
    }
    return this.realApi.assignJob(jobId, driverId);
  }

  async updateJobStatus(jobId, status, location = null) {
    if (this.useMock) {
      return { data: await this.mockApi.updateJobStatus(jobId, status) };
    }
    return this.realApi.updateJobStatus(jobId, status, location);
  }

  // Drivers methods
  async getDrivers(filters = {}) {
    if (this.useMock) {
      return { data: await this.mockApi.getFleetData() };
    }
    return this.realApi.getDrivers(filters);
  }

  async registerDriver(driverData) {
    if (this.useMock) {
      return { data: { success: true, id: Date.now(), ...driverData } };
    }
    return this.realApi.registerDriver(driverData);
  }

  async updateDriver(driverId, driverData) {
    if (this.useMock) {
      return { data: { success: true, id: driverId, ...driverData } };
    }
    return this.realApi.updateDriver(driverId, driverData);
  }

  async updateDriverLocation(location) {
    if (this.useMock) {
      return { data: { success: true, location, timestamp: new Date().toISOString() } };
    }
    return this.realApi.updateDriverLocation(location);
  }

  async getDriverReports(driverId, filters = {}) {
    if (this.useMock) {
      return { data: await this.mockApi.getAnalytics() };
    }
    return this.realApi.getDriverReports(driverId, filters);
  }

  // Tracking methods
  async updateLocation(locationData) {
    if (this.useMock) {
      return { data: { success: true, ...locationData } };
    }
    return this.realApi.updateLocation(locationData);
  }

  async getRoute(jobId) {
    if (this.useMock) {
      return { data: { success: true, route: [], jobId } };
    }
    return this.realApi.getRoute(jobId);
  }

  async optimizeRoute(routeData) {
    if (this.useMock) {
      return { data: { success: true, optimizedRoute: routeData } };
    }
    return this.realApi.optimizeRoute(routeData);
  }

  // Notifications methods
  async getNotifications() {
    if (this.useMock) {
      return { data: await this.mockApi.getNotifications() };
    }
    return this.realApi.getNotifications();
  }

  async markNotificationAsRead(notificationId) {
    if (this.useMock) {
      return { data: { success: true, id: notificationId } };
    }
    return this.realApi.markNotificationAsRead(notificationId);
  }

  async updateNotificationSettings(settings) {
    if (this.useMock) {
      return { data: { success: true, settings } };
    }
    return this.realApi.updateNotificationSettings(settings);
  }

  // Reports methods
  async generateReport(reportType, filters = {}) {
    if (this.useMock) {
      return { data: await this.mockApi.getAnalytics() };
    }
    return this.realApi.generateReport(reportType, filters);
  }

  async downloadReport(reportId) {
    if (this.useMock) {
      return { data: { success: true, url: 'mock-report-url', reportId } };
    }
    return this.realApi.downloadReport(reportId);
  }

  // Energy methods (for mock)
  async getEnergyData() {
    if (this.useMock) {
      return { data: await this.mockApi.getEnergyData() };
    }
    return this.realApi.get('/energy/data');
  }

  async getFleetData() {
    if (this.useMock) {
      return { data: await this.mockApi.getFleetData() };
    }
    return this.realApi.get('/fleet/data');
  }

  async getAnalytics() {
    if (this.useMock) {
      return { data: await this.mockApi.getAnalytics() };
    }
    return this.realApi.get('/analytics');
  }
}

export default new UnifiedApiService();
