import { apiService } from './apiService';
import { API_CONFIG } from '../config/config';
import { locationService } from './locationService';

class DriverService {
  constructor() {
    this.activeDrivers = [];
    this.driverStatuses = {};
  }

  // Driver CRUD operations
  async registerDriver(driverData) {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.DRIVERS.REGISTER, driverData);
      return response.data;
    } catch (error) {
      console.error('Error registering driver:', error);
      
      // Return mock data for development
      return {
        id: Math.random().toString(36).substr(2, 9),
        ...driverData,
        status: 'pending_approval',
        createdAt: new Date().toISOString(),
      };
    }
  }

  async updateDriver(driverId, updates) {
    try {
      const response = await apiService.put(`${API_CONFIG.ENDPOINTS.DRIVERS.UPDATE}/${driverId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating driver:', error);
      throw error;
    }
  }

  async getDriver(driverId) {
    try {
      const response = await apiService.get(`${API_CONFIG.ENDPOINTS.DRIVERS.LIST}/${driverId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting driver:', error);
      return this.getMockDriver(driverId);
    }
  }

  async getDrivers(filters = {}) {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.DRIVERS.LIST, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error getting drivers:', error);
      return this.getMockDrivers(filters);
    }
  }

  // Driver status operations
  async updateDriverStatus(driverId, status) {
    try {
      const response = await apiService.post(`${API_CONFIG.ENDPOINTS.DRIVERS.UPDATE}/${driverId}/status`, {
        status,
        timestamp: new Date().toISOString(),
      });

      this.driverStatuses[driverId] = status;
      return response.data;
    } catch (error) {
      console.error('Error updating driver status:', error);
      this.driverStatuses[driverId] = status; // Update locally for development
      return { status, timestamp: new Date().toISOString() };
    }
  }

  async punchIn(driverId, location = null) {
    try {
      const currentLocation = location || await locationService.getCurrentLocation();
      
      const response = await apiService.post(`${API_CONFIG.ENDPOINTS.DRIVERS.UPDATE}/${driverId}/punch-in`, {
        location: currentLocation,
        timestamp: new Date().toISOString(),
      });

      await this.updateDriverStatus(driverId, 'available');
      return response.data;
    } catch (error) {
      console.error('Error punching in:', error);
      await this.updateDriverStatus(driverId, 'available');
      return { success: true, timestamp: new Date().toISOString() };
    }
  }

  async punchOut(driverId, location = null) {
    try {
      const currentLocation = location || await locationService.getCurrentLocation();
      
      const response = await apiService.post(`${API_CONFIG.ENDPOINTS.DRIVERS.UPDATE}/${driverId}/punch-out`, {
        location: currentLocation,
        timestamp: new Date().toISOString(),
      });

      await this.updateDriverStatus(driverId, 'offline');
      return response.data;
    } catch (error) {
      console.error('Error punching out:', error);
      await this.updateDriverStatus(driverId, 'offline');
      return { success: true, timestamp: new Date().toISOString() };
    }
  }

  // Driver location operations
  async updateDriverLocation(driverId, location) {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.DRIVERS.LOCATION, {
        driverId,
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: location.timestamp || new Date().toISOString(),
        speed: location.speed,
        heading: location.heading,
      });

      return response.data;
    } catch (error) {
      console.error('Error updating driver location:', error);
      return { success: true };
    }
  }

  async getDriverLocation(driverId) {
    try {
      const response = await apiService.get(`${API_CONFIG.ENDPOINTS.DRIVERS.LOCATION}/${driverId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting driver location:', error);
      
      // Return mock location for development
      return {
        latitude: 32.7767 + (Math.random() - 0.5) * 0.1, // Dallas area
        longitude: -96.7970 + (Math.random() - 0.5) * 0.1,
        timestamp: new Date().toISOString(),
        accuracy: 10,
      };
    }
  }

  async getActiveDriversLocations() {
    try {
      const response = await apiService.get(`${API_CONFIG.ENDPOINTS.DRIVERS.LOCATION}/active`);
      return response.data;
    } catch (error) {
      console.error('Error getting active drivers locations:', error);
      return this.getMockActiveDriversLocations();
    }
  }

  // Driver performance and reports
  async getDriverReports(driverId, dateRange) {
    try {
      const response = await apiService.get(`${API_CONFIG.ENDPOINTS.DRIVERS.REPORTS}/${driverId}`, {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting driver reports:', error);
      return this.getMockDriverReports(driverId, dateRange);
    }
  }

  async getDriverPerformanceMetrics(driverId) {
    try {
      const response = await apiService.get(`${API_CONFIG.ENDPOINTS.DRIVERS.REPORTS}/${driverId}/performance`);
      return response.data;
    } catch (error) {
      console.error('Error getting driver performance metrics:', error);
      return this.getMockDriverPerformanceMetrics(driverId);
    }
  }

  // Driver filtering and searching
  filterDrivers(drivers, filters) {
    let filteredDrivers = [...drivers];

    if (filters.status) {
      filteredDrivers = filteredDrivers.filter(driver => driver.status === filters.status);
    }

    if (filters.availability) {
      filteredDrivers = filteredDrivers.filter(driver => driver.availability === filters.availability);
    }

    if (filters.location) {
      // Filter by proximity to a location
      const { latitude, longitude, radius } = filters.location;
      filteredDrivers = filteredDrivers.filter(driver => {
        if (!driver.currentLocation) return false;
        const distance = locationService.calculateDistance(
          latitude,
          longitude,
          driver.currentLocation.latitude,
          driver.currentLocation.longitude
        );
        return distance <= radius;
      });
    }

    if (filters.vehicleType) {
      filteredDrivers = filteredDrivers.filter(driver => 
        driver.vehicle && driver.vehicle.type === filters.vehicleType
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredDrivers = filteredDrivers.filter(driver =>
        driver.name.toLowerCase().includes(searchLower) ||
        driver.email.toLowerCase().includes(searchLower) ||
        driver.phone.toLowerCase().includes(searchLower) ||
        (driver.vehicle && driver.vehicle.licensePlate.toLowerCase().includes(searchLower))
      );
    }

    return filteredDrivers;
  }

  // Utility methods
  getDriverStatusColor(status) {
    const statusColors = {
      available: '#4CAF50',
      busy: '#FF9800',
      offline: '#757575',
      break: '#2196F3',
      pending_approval: '#FFC107',
      suspended: '#F44336',
    };
    
    return statusColors[status] || '#757575';
  }

  calculateDriverRating(reviews) {
    if (!reviews || reviews.length === 0) return 0;
    
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((total / reviews.length) * 10) / 10;
  }

  formatDriverWorkHours(hoursWorked) {
    const hours = Math.floor(hoursWorked);
    const minutes = Math.round((hoursWorked - hours) * 60);
    return `${hours}h ${minutes}m`;
  }

  // Mock data methods (for development)
  getMockDriver(driverId) {
    return {
      id: driverId,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      status: 'available',
      rating: 4.8,
      totalJobs: 145,
      totalEarnings: 15750.50,
      joinDate: '2023-01-15',
      vehicle: {
        type: 'Truck',
        make: 'Ford',
        model: 'F-150',
        year: 2022,
        licensePlate: 'ABC-1234',
        capacity: '1000 lbs',
      },
      documents: {
        license: { verified: true, expiryDate: '2025-12-31' },
        insurance: { verified: true, expiryDate: '2024-06-30' },
        registration: { verified: true, expiryDate: '2024-12-31' },
      },
      currentLocation: {
        latitude: 32.7767,
        longitude: -96.7970,
        timestamp: new Date().toISOString(),
      },
    };
  }

  getMockDrivers(filters = {}) {
    const mockDrivers = [
      {
        id: 'driver1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0123',
        status: 'available',
        rating: 4.8,
        totalJobs: 145,
        joinDate: '2023-01-15',
        vehicle: { type: 'Truck', licensePlate: 'ABC-1234' },
        currentLocation: { latitude: 32.7767, longitude: -96.7970 },
      },
      {
        id: 'driver2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-0124',
        status: 'busy',
        rating: 4.9,
        totalJobs: 98,
        joinDate: '2023-03-20',
        vehicle: { type: 'Van', licensePlate: 'XYZ-5678' },
        currentLocation: { latitude: 32.7850, longitude: -96.8050 },
      },
      {
        id: 'driver3',
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        phone: '+1-555-0125',
        status: 'offline',
        rating: 4.6,
        totalJobs: 67,
        joinDate: '2023-06-10',
        vehicle: { type: 'Truck', licensePlate: 'DEF-9012' },
        currentLocation: { latitude: 32.7500, longitude: -96.8200 },
      },
    ];

    return this.filterDrivers(mockDrivers, filters);
  }

  getMockActiveDriversLocations() {
    return [
      {
        driverId: 'driver1',
        name: 'John Doe',
        latitude: 32.7767,
        longitude: -96.7970,
        status: 'available',
        timestamp: new Date().toISOString(),
      },
      {
        driverId: 'driver2',
        name: 'Jane Smith',
        latitude: 32.7850,
        longitude: -96.8050,
        status: 'busy',
        timestamp: new Date().toISOString(),
      },
    ];
  }

  getMockDriverReports(driverId, dateRange) {
    return {
      driverId,
      dateRange,
      summary: {
        totalJobs: 23,
        completedJobs: 21,
        cancelledJobs: 2,
        totalDistance: 1245.6,
        totalEarnings: 2340.50,
        hoursWorked: 156.5,
        averageRating: 4.7,
      },
      dailyStats: [
        { date: '2023-12-01', jobs: 3, distance: 45.2, earnings: 127.50, hours: 6.5 },
        { date: '2023-12-02', jobs: 2, distance: 32.1, earnings: 89.00, hours: 4.2 },
        // ... more daily stats
      ],
    };
  }

  getMockDriverPerformanceMetrics(driverId) {
    return {
      driverId,
      overallRating: 4.8,
      totalRatings: 145,
      onTimeDeliveryRate: 96.5,
      customerSatisfactionScore: 4.7,
      averageJobDuration: 85, // minutes
      fuelEfficiency: 8.5, // km/L
      safetyScore: 92,
      communicationScore: 4.6,
      monthlyTrends: {
        ratings: [4.6, 4.7, 4.8, 4.8, 4.9],
        earnings: [2100, 2300, 2500, 2340, 2450],
        jobCounts: [18, 21, 25, 23, 24],
      },
    };
  }
}

export const driverService = new DriverService();
