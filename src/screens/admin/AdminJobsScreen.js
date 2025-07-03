import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme/theme';
import { useNavigation } from '@react-navigation/native';
import { apiService } from '../../services/apiService';

const AdminJobsScreen = () => {
  const navigation = useNavigation();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [jobStats, setJobStats] = useState({});

  useEffect(() => {
    loadJobs();
    loadJobStats();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, filter, searchQuery]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      // Mock data - replace with real API calls
      const mockJobs = [
        {
          id: 1,
          jobNumber: 'J001',
          customer: 'ABC Transport',
          pickupLocation: 'Terminal A, Port of Houston',
          deliveryLocation: 'Downtown Distribution Center',
          scheduledTime: '2024-01-15T14:30:00Z',
          status: 'pending',
          priority: 'high',
          driver: null,
          vehicle: null,
          estimatedDuration: '2.5 hours',
          distance: '25 miles',
          cargoType: 'General Freight',
          value: 450.00,
          createdDate: '2024-01-15T10:00:00Z',
        },
        {
          id: 2,
          jobNumber: 'J002',
          customer: 'XYZ Logistics',
          pickupLocation: 'Warehouse District',
          deliveryLocation: 'Airport Cargo Hub',
          scheduledTime: '2024-01-15T16:00:00Z',
          status: 'in_progress',
          priority: 'medium',
          driver: 'John Smith',
          vehicle: 'TR-001',
          estimatedDuration: '1.5 hours',
          distance: '18 miles',
          cargoType: 'Electronics',
          value: 320.00,
          createdDate: '2024-01-15T08:30:00Z',
        },
        {
          id: 3,
          jobNumber: 'J003',
          customer: 'Fast Delivery Co',
          pickupLocation: 'Manufacturing Plant',
          deliveryLocation: 'Retail Store Network',
          scheduledTime: '2024-01-15T18:00:00Z',
          status: 'completed',
          priority: 'critical',
          driver: 'Sarah Davis',
          vehicle: 'TR-003',
          estimatedDuration: '3 hours',
          distance: '45 miles',
          cargoType: 'Perishable Goods',
          value: 680.00,
          createdDate: '2024-01-14T16:20:00Z',
          completedDate: '2024-01-15T12:45:00Z',
        },
        {
          id: 4,
          jobNumber: 'J004',
          customer: 'Regional Supply',
          pickupLocation: 'Central Depot',
          deliveryLocation: 'Multiple Locations',
          scheduledTime: '2024-01-15T10:00:00Z',
          status: 'cancelled',
          priority: 'low',
          driver: null,
          vehicle: null,
          estimatedDuration: '4 hours',
          distance: '60 miles',
          cargoType: 'Bulk Materials',
          value: 0,
          createdDate: '2024-01-14T12:00:00Z',
          cancelledDate: '2024-01-15T09:30:00Z',
          cancelReason: 'Customer requested cancellation',
        },
      ];
      
      setJobs(mockJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
      Alert.alert('Error', 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const loadJobStats = async () => {
    try {
      // Mock stats data
      const mockStats = {
        totalJobs: 1847,
        todayJobs: 24,
        thisWeekJobs: 156,
        thisMonthJobs: 687,
        completedJobs: 1623,
        pendingJobs: 89,
        inProgressJobs: 47,
        cancelledJobs: 88,
        totalRevenue: 456780.50,
        avgJobValue: 247.30,
        completionRate: 87.9,
        onTimeDeliveryRate: 94.2,
      };
      setJobStats(mockStats);
    } catch (error) {
      console.error('Error loading job stats:', error);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;
    
    if (filter !== 'all') {
      filtered = filtered.filter(job => job.status === filter);
    }
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(job => 
        job.jobNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.driver?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredJobs(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadJobs(), loadJobStats()]);
    setRefreshing(false);
  };

  const handleJobPress = (job) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

  const handleJobAction = (job, action) => {
    switch (action) {
      case 'edit':
        Alert.alert('Edit Job', 'Edit job functionality would open edit form');
        break;
      case 'duplicate':
        Alert.alert('Duplicate Job', 'Create a copy of this job?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Duplicate', onPress: () => console.log('Job duplicated') },
        ]);
        break;
      case 'cancel':
        Alert.alert(
          'Cancel Job',
          `Are you sure you want to cancel job ${job.jobNumber}?`,
          [
            { text: 'No', style: 'cancel' },
            { text: 'Yes', style: 'destructive', onPress: () => console.log('Job cancelled') },
          ]
        );
        break;
      case 'assign':
        Alert.alert('Assign Driver', 'Driver assignment functionality');
        break;
      default:
        break;
    }
    setShowJobModal(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'in_progress': return colors.primary;
      case 'completed': return colors.success;
      case 'cancelled': return colors.error;
      default: return colors.gray[500];
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return colors.error;
      case 'high': return colors.warning;
      case 'medium': return colors.info;
      case 'low': return colors.gray[500];
      default: return colors.gray[500];
    }
  };

  const JobCard = ({ job }) => (
    <TouchableOpacity style={styles.jobCard} onPress={() => handleJobPress(job)}>
      <View style={styles.jobHeader}>
        <View style={styles.jobHeaderLeft}>
          <Text style={styles.jobNumber}>{job.jobNumber}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
            <Text style={styles.statusText}>{job.status.replace('_', ' ').toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.jobHeaderRight}>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(job.priority) }]}>
            <Text style={styles.priorityText}>{job.priority.toUpperCase()}</Text>
          </View>
          <Text style={styles.jobValue}>${job.value.toFixed(2)}</Text>
        </View>
      </View>
      
      <Text style={styles.customer}>{job.customer}</Text>
      
      <View style={styles.locationContainer}>
        <View style={styles.locationItem}>
          <Ionicons name="location-outline" size={16} color={colors.primary} />
          <Text style={styles.locationText} numberOfLines={1}>{job.pickupLocation}</Text>
        </View>
        <Ionicons name="arrow-down" size={16} color={colors.gray[400]} style={styles.arrowIcon} />
        <View style={styles.locationItem}>
          <Ionicons name="flag-outline" size={16} color={colors.success} />
          <Text style={styles.locationText} numberOfLines={1}>{job.deliveryLocation}</Text>
        </View>
      </View>
      
      <View style={styles.jobFooter}>
        <View style={styles.jobDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color={colors.gray[600]} />
            <Text style={styles.detailText}>{new Date(job.scheduledTime).toLocaleTimeString()}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="speedometer-outline" size={14} color={colors.gray[600]} />
            <Text style={styles.detailText}>{job.distance}</Text>
          </View>
        </View>
        {job.driver && (
          <View style={styles.driverInfo}>
            <Ionicons name="person-outline" size={14} color={colors.gray[600]} />
            <Text style={styles.driverText}>{job.driver}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const FilterButton = ({ title, value, isActive, count }) => (
    <TouchableOpacity
      style={[styles.filterButton, isActive && styles.filterButtonActive]}
      onPress={() => setFilter(value)}
    >
      <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
        {title}
      </Text>
      {count > 0 && (
        <View style={[styles.filterBadge, isActive && styles.filterBadgeActive]}>
          <Text style={[styles.filterBadgeText, isActive && styles.filterBadgeTextActive]}>
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const StatsModal = () => (
    <Modal
      visible={showStatsModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowStatsModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Job Statistics</Text>
          <TouchableOpacity onPress={() => setShowStatsModal(false)}>
            <Ionicons name="close" size={24} color={colors.dark} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{jobStats.totalJobs?.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Jobs</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{jobStats.todayJobs}</Text>
              <Text style={styles.statLabel}>Today</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{jobStats.thisWeekJobs}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{jobStats.thisMonthJobs}</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
          </View>

          <View style={styles.statsSection}>
            <Text style={styles.statsSectionTitle}>Job Status Breakdown</Text>
            <View style={styles.statusStatsGrid}>
              <View style={styles.statusStatCard}>
                <Text style={[styles.statusStatValue, { color: colors.success }]}>
                  {jobStats.completedJobs}
                </Text>
                <Text style={styles.statusStatLabel}>Completed</Text>
              </View>
              <View style={styles.statusStatCard}>
                <Text style={[styles.statusStatValue, { color: colors.primary }]}>
                  {jobStats.inProgressJobs}
                </Text>
                <Text style={styles.statusStatLabel}>In Progress</Text>
              </View>
              <View style={styles.statusStatCard}>
                <Text style={[styles.statusStatValue, { color: colors.warning }]}>
                  {jobStats.pendingJobs}
                </Text>
                <Text style={styles.statusStatLabel}>Pending</Text>
              </View>
              <View style={styles.statusStatCard}>
                <Text style={[styles.statusStatValue, { color: colors.error }]}>
                  {jobStats.cancelledJobs}
                </Text>
                <Text style={styles.statusStatLabel}>Cancelled</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsSection}>
            <Text style={styles.statsSectionTitle}>Financial Overview</Text>
            <View style={styles.financialStats}>
              <View style={styles.financialStatRow}>
                <Text style={styles.financialStatLabel}>Total Revenue</Text>
                <Text style={styles.financialStatValue}>
                  ${jobStats.totalRevenue?.toLocaleString()}
                </Text>
              </View>
              <View style={styles.financialStatRow}>
                <Text style={styles.financialStatLabel}>Average Job Value</Text>
                <Text style={styles.financialStatValue}>
                  ${jobStats.avgJobValue?.toFixed(2)}
                </Text>
              </View>
              <View style={styles.financialStatRow}>
                <Text style={styles.financialStatLabel}>Completion Rate</Text>
                <Text style={styles.financialStatValue}>
                  {jobStats.completionRate}%
                </Text>
              </View>
              <View style={styles.financialStatRow}>
                <Text style={styles.financialStatLabel}>On-Time Delivery</Text>
                <Text style={styles.financialStatValue}>
                  {jobStats.onTimeDeliveryRate}%
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const JobModal = () => (
    <Modal
      visible={showJobModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowJobModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Job Details</Text>
          <TouchableOpacity onPress={() => setShowJobModal(false)}>
            <Ionicons name="close" size={24} color={colors.dark} />
          </TouchableOpacity>
        </View>
        
        {selectedJob && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Job Information</Text>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Job Number:</Text>
                <Text style={styles.modalValue}>{selectedJob.jobNumber}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Customer:</Text>
                <Text style={styles.modalValue}>{selectedJob.customer}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Status:</Text>
                <Text style={[styles.modalValue, { color: getStatusColor(selectedJob.status) }]}>
                  {selectedJob.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Priority:</Text>
                <Text style={[styles.modalValue, { color: getPriorityColor(selectedJob.priority) }]}>
                  {selectedJob.priority.toUpperCase()}
                </Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Value:</Text>
                <Text style={styles.modalValue}>${selectedJob.value.toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Schedule & Locations</Text>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Scheduled Time:</Text>
                <Text style={styles.modalValue}>
                  {new Date(selectedJob.scheduledTime).toLocaleString()}
                </Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Pickup:</Text>
                <Text style={styles.modalValue}>{selectedJob.pickupLocation}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Delivery:</Text>
                <Text style={styles.modalValue}>{selectedJob.deliveryLocation}</Text>
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Assignment & Details</Text>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Driver:</Text>
                <Text style={styles.modalValue}>{selectedJob.driver || 'Unassigned'}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Vehicle:</Text>
                <Text style={styles.modalValue}>{selectedJob.vehicle || 'Unassigned'}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Cargo Type:</Text>
                <Text style={styles.modalValue}>{selectedJob.cargoType}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Distance:</Text>
                <Text style={styles.modalValue}>{selectedJob.distance}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Est. Duration:</Text>
                <Text style={styles.modalValue}>{selectedJob.estimatedDuration}</Text>
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Timestamps</Text>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Created:</Text>
                <Text style={styles.modalValue}>
                  {new Date(selectedJob.createdDate).toLocaleString()}
                </Text>
              </View>
              {selectedJob.completedDate && (
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Completed:</Text>
                  <Text style={styles.modalValue}>
                    {new Date(selectedJob.completedDate).toLocaleString()}
                  </Text>
                </View>
              )}
              {selectedJob.cancelledDate && (
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Cancelled:</Text>
                  <Text style={styles.modalValue}>
                    {new Date(selectedJob.cancelledDate).toLocaleString()}
                  </Text>
                </View>
              )}
              {selectedJob.cancelReason && (
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Cancel Reason:</Text>
                  <Text style={styles.modalValue}>{selectedJob.cancelReason}</Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}
        
        <View style={styles.modalActions}>
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: colors.primary }]}
            onPress={() => handleJobAction(selectedJob, 'edit')}
          >
            <Text style={styles.modalButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: colors.info }]}
            onPress={() => handleJobAction(selectedJob, 'duplicate')}
          >
            <Text style={styles.modalButtonText}>Duplicate</Text>
          </TouchableOpacity>
          {selectedJob?.status === 'pending' && (
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.success }]}
              onPress={() => handleJobAction(selectedJob, 'assign')}
            >
              <Text style={styles.modalButtonText}>Assign</Text>
            </TouchableOpacity>
          )}
          {selectedJob?.status !== 'completed' && selectedJob?.status !== 'cancelled' && (
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.error }]}
              onPress={() => handleJobAction(selectedJob, 'cancel')}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );

  const getFilterCount = (filterValue) => {
    if (filterValue === 'all') return jobs.length;
    return jobs.filter(job => job.status === filterValue).length;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Job Management</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.statsButton}
            onPress={() => setShowStatsModal(true)}
          >
            <Ionicons name="analytics-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={colors.gray[600]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs, customers, drivers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        <FilterButton 
          title="All" 
          value="all" 
          isActive={filter === 'all'} 
          count={getFilterCount('all')}
        />
        <FilterButton 
          title="Pending" 
          value="pending" 
          isActive={filter === 'pending'} 
          count={getFilterCount('pending')}
        />
        <FilterButton 
          title="In Progress" 
          value="in_progress" 
          isActive={filter === 'in_progress'} 
          count={getFilterCount('in_progress')}
        />
        <FilterButton 
          title="Completed" 
          value="completed" 
          isActive={filter === 'completed'} 
          count={getFilterCount('completed')}
        />
        <FilterButton 
          title="Cancelled" 
          value="cancelled" 
          isActive={filter === 'cancelled'} 
          count={getFilterCount('cancelled')}
        />
      </ScrollView>

      <ScrollView
        style={styles.jobsList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading jobs...</Text>
          </View>
        ) : filteredJobs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={64} color={colors.gray[400]} />
            <Text style={styles.emptyText}>No jobs found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filter</Text>
          </View>
        ) : (
          filteredJobs.map(job => <JobCard key={job.id} job={job} />)
        )}
      </ScrollView>

      <JobModal />
      <StatsModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.dark,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 16,
    color: colors.dark,
  },
  filterContainer: {
    paddingLeft: spacing.lg,
    marginBottom: spacing.md,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    marginRight: spacing.sm,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.gray[600],
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  filterBadge: {
    marginLeft: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: colors.gray[300],
    minWidth: 18,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: colors.white,
  },
  filterBadgeText: {
    fontSize: 10,
    color: colors.gray[600],
    fontWeight: 'bold',
  },
  filterBadgeTextActive: {
    color: colors.primary,
  },
  jobsList: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  jobCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  jobHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobHeaderRight: {
    alignItems: 'flex-end',
  },
  jobNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
    marginRight: spacing.sm,
  },
  jobValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.success,
    marginTop: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '600',
  },
  customer: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark,
    marginBottom: spacing.sm,
  },
  locationContainer: {
    marginBottom: spacing.sm,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  locationText: {
    fontSize: 14,
    color: colors.gray[600],
    marginLeft: spacing.xs,
    flex: 1,
  },
  arrowIcon: {
    alignSelf: 'center',
    marginLeft: spacing.sm,
    marginBottom: spacing.xs,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobDetails: {
    flexDirection: 'row',
    flex: 1,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  detailText: {
    fontSize: 12,
    color: colors.gray[600],
    marginLeft: spacing.xs,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverText: {
    fontSize: 12,
    color: colors.gray[600],
    marginLeft: spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray[600],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[600],
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.dark,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  modalSection: {
    marginBottom: spacing.lg,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark,
    marginBottom: spacing.md,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  modalLabel: {
    fontSize: 14,
    color: colors.gray[600],
    flex: 1,
  },
  modalValue: {
    fontSize: 14,
    color: colors.dark,
    flex: 2,
    textAlign: 'right',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
  },
  modalButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    marginHorizontal: '1%',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.dark,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray[600],
    marginTop: spacing.xs,
  },
  statsSection: {
    marginBottom: spacing.lg,
  },
  statsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark,
    marginBottom: spacing.md,
  },
  statusStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statusStatCard: {
    width: '48%',
    alignItems: 'center',
    padding: spacing.md,
    marginHorizontal: '1%',
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  statusStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusStatLabel: {
    fontSize: 12,
    color: colors.gray[600],
    marginTop: spacing.xs,
  },
  financialStats: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
  },
  financialStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  financialStatLabel: {
    fontSize: 14,
    color: colors.gray[600],
  },
  financialStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark,
  },
});

export default AdminJobsScreen;
