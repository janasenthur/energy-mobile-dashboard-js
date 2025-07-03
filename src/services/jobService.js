import { apiService } from './apiService';
import { API_CONFIG } from '../config/config';
import { notificationService } from './notificationService';

class JobService {
  constructor() {
    this.activeJobs = [];
    this.jobHistory = [];
  }

  // Job CRUD operations
  async createJob(jobData) {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.JOBS.CREATE, jobData);
      
      // Send notification to dispatchers about new job
      await notificationService.sendBroadcastNotification(
        'New Job Created',
        `Job #${response.data.id} needs to be assigned`,
        { jobId: response.data.id, type: 'new_job' },
        ['dispatcher', 'admin']
      );
      
      return response.data;
    } catch (error) {
      console.error('Error creating job:', error);
      
      // Return mock data for development
      const mockJob = {
        id: Math.random().toString(36).substr(2, 9),
        ...jobData,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      
      return mockJob;
    }
  }

  async updateJob(jobId, updates) {
    try {
      const response = await apiService.put(`${API_CONFIG.ENDPOINTS.JOBS.UPDATE}/${jobId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  }

  async deleteJob(jobId) {
    try {
      await apiService.delete(`${API_CONFIG.ENDPOINTS.JOBS.DELETE}/${jobId}`);
      return true;
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }

  async getJob(jobId) {
    try {
      const response = await apiService.get(`${API_CONFIG.ENDPOINTS.JOBS.LIST}/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting job:', error);
      return this.getMockJob(jobId);
    }
  }

  async getJobs(filters = {}) {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.JOBS.LIST, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error getting jobs:', error);
      return this.getMockJobs(filters);
    }
  }

  // Job assignment operations
  async assignJob(jobId, driverId) {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.JOBS.ASSIGN, {
        jobId,
        driverId,
      });

      // Send notification to driver about new assignment
      await notificationService.sendDriverNotification(
        driverId,
        'New Job Assignment',
        `You have been assigned job #${jobId}`,
        { jobId, type: 'job_assignment' }
      );

      return response.data;
    } catch (error) {
      console.error('Error assigning job:', error);
      throw error;
    }
  }

  async unassignJob(jobId) {
    try {
      const response = await apiService.post(`${API_CONFIG.ENDPOINTS.JOBS.ASSIGN}/unassign`, {
        jobId,
      });
      return response.data;
    } catch (error) {
      console.error('Error unassigning job:', error);
      throw error;
    }
  }

  // Job status operations
  async updateJobStatus(jobId, status, location = null) {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.JOBS.STATUS, {
        jobId,
        status,
        location,
        timestamp: new Date().toISOString(),
      });

      // Send notifications based on status changes
      await this.handleStatusChangeNotifications(jobId, status);

      return response.data;
    } catch (error) {
      console.error('Error updating job status:', error);
      throw error;
    }
  }

  async handleStatusChangeNotifications(jobId, status) {
    try {
      const job = await this.getJob(jobId);
      
      switch (status) {
        case 'en_route_pickup':
          await notificationService.sendCustomerNotification(
            job.customerId,
            'Driver En Route',
            `Your driver is heading to the pickup location for job #${jobId}`,
            { jobId, type: 'status_update' }
          );
          break;
          
        case 'arrived_pickup':
          await notificationService.sendCustomerNotification(
            job.customerId,
            'Driver Arrived',
            `Your driver has arrived at the pickup location for job #${jobId}`,
            { jobId, type: 'status_update' }
          );
          break;
          
        case 'en_route_delivery':
          await notificationService.sendCustomerNotification(
            job.customerId,
            'En Route to Delivery',
            `Your shipment is on the way for job #${jobId}`,
            { jobId, type: 'status_update' }
          );
          break;
          
        case 'delivered':
          await notificationService.sendCustomerNotification(
            job.customerId,
            'Delivery Complete',
            `Your shipment has been delivered for job #${jobId}`,
            { jobId, type: 'delivery_complete' }
          );
          break;
          
        case 'cancelled':
          await notificationService.sendCustomerNotification(
            job.customerId,
            'Job Cancelled',
            `Job #${jobId} has been cancelled`,
            { jobId, type: 'job_cancelled' }
          );
          break;
      }
    } catch (error) {
      console.error('Error sending status change notifications:', error);
    }
  }

  // Job filtering and searching
  filterJobs(jobs, filters) {
    let filteredJobs = [...jobs];

    if (filters.status) {
      filteredJobs = filteredJobs.filter(job => job.status === filters.status);
    }

    if (filters.priority) {
      filteredJobs = filteredJobs.filter(job => job.priority === filters.priority);
    }

    if (filters.driverId) {
      filteredJobs = filteredJobs.filter(job => job.driverId === filters.driverId);
    }

    if (filters.customerId) {
      filteredJobs = filteredJobs.filter(job => job.customerId === filters.customerId);
    }

    if (filters.dateRange) {
      const { startDate, endDate } = filters.dateRange;
      filteredJobs = filteredJobs.filter(job => {
        const jobDate = new Date(job.scheduledDate);
        return jobDate >= startDate && jobDate <= endDate;
      });
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredJobs = filteredJobs.filter(job =>
        job.id.toLowerCase().includes(searchLower) ||
        job.type.toLowerCase().includes(searchLower) ||
        job.pickupLocation.toLowerCase().includes(searchLower) ||
        job.deliveryLocation.toLowerCase().includes(searchLower)
      );
    }

    return filteredJobs;
  }

  // Utility methods
  getJobStatusColor(status) {
    const statusColors = {
      pending: '#FFA500',
      assigned: '#2196F3',
      en_route_pickup: '#FF9800',
      arrived_pickup: '#9C27B0',
      picked_up: '#607D8B',
      en_route_delivery: '#3F51B5',
      arrived_delivery: '#795548',
      delivered: '#4CAF50',
      cancelled: '#F44336',
      on_hold: '#FFEB3B',
    };
    
    return statusColors[status] || '#757575';
  }

  getJobPriorityColor(priority) {
    const priorityColors = {
      low: '#4CAF50',
      medium: '#FF9800',
      high: '#FF5722',
      urgent: '#F44336',
    };
    
    return priorityColors[priority] || '#757575';
  }

  calculateJobETA(job) {
    // Mock ETA calculation - would integrate with real routing service
    const baseTime = 30; // 30 minutes base
    const distance = Math.random() * 50; // Random distance for demo
    const eta = baseTime + (distance * 1.5); // 1.5 minutes per km
    
    return Math.round(eta);
  }

  // Mock data methods (for development)
  getMockJob(jobId) {
    return {
      id: jobId,
      type: 'Delivery',
      status: 'assigned',
      priority: 'medium',
      customerId: 'customer1',
      customerName: 'ABC Company',
      driverId: 'driver1',
      driverName: 'John Doe',
      pickupLocation: '123 Main St, City A',
      deliveryLocation: '456 Oak Ave, City B',
      scheduledDate: new Date().toISOString(),
      estimatedDuration: 120,
      distance: 25.5,
      cargoDetails: 'Electronics - Fragile',
      specialInstructions: 'Handle with care',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  getMockJobs(filters = {}) {
    const mockJobs = [
      {
        id: 'job001',
        type: 'Delivery',
        status: 'pending',
        priority: 'high',
        customerId: 'customer1',
        customerName: 'ABC Company',
        pickupLocation: '123 Main St, Dallas, TX',
        deliveryLocation: '456 Oak Ave, Houston, TX',
        scheduledDate: new Date().toISOString(),
        estimatedDuration: 180,
        distance: 45.2,
        cargoDetails: 'Electronics - 5 boxes',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'job002',
        type: 'Pickup',
        status: 'assigned',
        priority: 'medium',
        customerId: 'customer2',
        customerName: 'XYZ Corp',
        driverId: 'driver1',
        driverName: 'John Doe',
        pickupLocation: '789 Pine St, Austin, TX',
        deliveryLocation: '321 Elm Dr, San Antonio, TX',
        scheduledDate: new Date(Date.now() + 3600000).toISOString(),
        estimatedDuration: 210,
        distance: 62.1,
        cargoDetails: 'Documents - Confidential',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'job003',
        type: 'Emergency',
        status: 'en_route_pickup',
        priority: 'urgent',
        customerId: 'customer3',
        customerName: 'Emergency Services',
        driverId: 'driver2',
        driverName: 'Jane Smith',
        pickupLocation: '555 Emergency Ln, Dallas, TX',
        deliveryLocation: '777 Hospital Dr, Dallas, TX',
        scheduledDate: new Date().toISOString(),
        estimatedDuration: 30,
        distance: 8.5,
        cargoDetails: 'Medical supplies',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      },
    ];

    return this.filterJobs(mockJobs, filters);
  }
}

export const jobService = new JobService();
