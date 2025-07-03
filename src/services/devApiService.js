// Development API Service - Mock endpoints for web development
export class DevApiService {
  constructor() {
    this.baseUrl = 'https://jsonplaceholder.typicode.com';
    this.isWeb = typeof window !== 'undefined';
    this.isDev = process.env.NODE_ENV === 'development';
  }

  // Mock authentication
  async login(credentials) {
    console.log('Mock login:', credentials);
    return {
      success: true,
      data: {
        user: {
          id: 1,
          name: 'John Doe',
          email: credentials.email || 'john@example.com',
          role: 'driver',
        },
        token: 'mock-jwt-token-' + Date.now(),
      }
    };
  }

  async register(userData) {
    console.log('Mock register:', userData);
    return {
      success: true,
      data: {
        user: {
          id: Date.now(),
          ...userData,
          role: 'driver',
        },
        token: 'mock-jwt-token-' + Date.now(),
      }
    };
  }

  // Mock job endpoints
  async getJobs() {
    console.log('Mock getJobs');
    return {
      success: true,
      data: [
        {
          id: 1,
          title: 'Delivery to Downtown',
          description: 'Deliver packages to downtown office building',
          status: 'pending',
          priority: 'high',
          location: {
            address: '123 Main St, Downtown',
            latitude: 40.7128,
            longitude: -74.0060,
          },
          estimatedTime: '2 hours',
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          title: 'Pickup from Warehouse',
          description: 'Pick up inventory from main warehouse',
          status: 'in_progress',
          priority: 'medium',
          location: {
            address: '456 Industrial Blvd',
            latitude: 40.7589,
            longitude: -73.9851,
          },
          estimatedTime: '1.5 hours',
          created_at: new Date().toISOString(),
        }
      ]
    };
  }

  async getJob(id) {
    console.log('Mock getJob:', id);
    const jobs = await this.getJobs();
    const job = jobs.data.find(j => j.id === parseInt(id));
    return {
      success: !!job,
      data: job || null,
    };
  }

  async updateJobStatus(id, status) {
    console.log('Mock updateJobStatus:', id, status);
    return {
      success: true,
      data: { id, status, updated_at: new Date().toISOString() }
    };
  }

  // Mock energy data
  async getEnergyData() {
    console.log('Mock getEnergyData');
    return {
      success: true,
      data: {
        totalConsumption: 1250.5,
        avgEfficiency: 85.2,
        co2Savings: 45.8,
        dailyData: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          consumption: Math.random() * 200 + 100,
          efficiency: Math.random() * 20 + 80,
        })),
        monthlyData: Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          consumption: Math.random() * 2000 + 1000,
          efficiency: Math.random() * 20 + 75,
        })),
      }
    };
  }

  // Mock fleet data
  async getFleetData() {
    console.log('Mock getFleetData');
    return {
      success: true,
      data: {
        totalVehicles: 25,
        activeVehicles: 18,
        maintenanceNeeded: 3,
        vehicles: Array.from({ length: 5 }, (_, i) => ({
          id: i + 1,
          name: `Vehicle ${i + 1}`,
          type: ['truck', 'van', 'car'][i % 3],
          status: ['active', 'maintenance', 'idle'][i % 3],
          batteryLevel: Math.random() * 100,
          location: {
            latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
            longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
          },
          lastUpdate: new Date().toISOString(),
        })),
      }
    };
  }

  // Mock analytics
  async getAnalytics() {
    console.log('Mock getAnalytics');
    return {
      success: true,
      data: {
        totalDistance: 15420,
        totalTrips: 342,
        avgEfficiency: 87.5,
        costSavings: 2840.50,
        performanceMetrics: {
          efficiency: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            value: Math.random() * 20 + 80,
          })),
          consumption: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            value: Math.random() * 100 + 150,
          })),
        }
      }
    };
  }

  // Mock notifications
  async getNotifications() {
    console.log('Mock getNotifications');
    return {
      success: true,
      data: [
        {
          id: 1,
          title: 'New Job Assignment',
          message: 'You have been assigned a new delivery job',
          type: 'job',
          read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          title: 'Vehicle Maintenance Due',
          message: 'Vehicle #3 requires scheduled maintenance',
          type: 'maintenance',
          read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
      ]
    };
  }

  // Mock profile
  async getProfile() {
    console.log('Mock getProfile');
    return {
      success: true,
      data: {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        role: 'driver',
        avatar: null,
        statistics: {
          totalJobs: 156,
          completedJobs: 148,
          avgRating: 4.8,
          totalDistance: 15420,
        }
      }
    };
  }

  async updateProfile(data) {
    console.log('Mock updateProfile:', data);
    return {
      success: true,
      data: { ...data, updated_at: new Date().toISOString() }
    };
  }

  // Generic fetch method for compatibility
  async fetch(endpoint, options = {}) {
    const method = options.method || 'GET';
    console.log(`Mock API ${method}:`, endpoint);
    
    // Simple routing based on endpoint
    if (endpoint.includes('/auth/login')) {
      return this.login(options.body ? JSON.parse(options.body) : {});
    } else if (endpoint.includes('/auth/register')) {
      return this.register(options.body ? JSON.parse(options.body) : {});
    } else if (endpoint.includes('/jobs') && method === 'GET') {
      return this.getJobs();
    } else if (endpoint.includes('/energy')) {
      return this.getEnergyData();
    } else if (endpoint.includes('/fleet')) {
      return this.getFleetData();
    } else if (endpoint.includes('/analytics')) {
      return this.getAnalytics();
    } else if (endpoint.includes('/notifications')) {
      return this.getNotifications();
    } else if (endpoint.includes('/profile') || endpoint.includes('/user')) {
      return this.getProfile();
    }
    
    // Default response
    return {
      success: true,
      data: { message: 'Mock endpoint response', endpoint, method }
    };
  }
}

export default new DevApiService();
