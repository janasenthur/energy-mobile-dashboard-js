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

const JobQueueScreen = () => {
  const navigation = useNavigation();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, assigned, in_progress, completed
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, filter, searchQuery]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with real API calls
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
          specialInstructions: 'Handle with care, fragile items',
        },
        {
          id: 2,
          jobNumber: 'J002',
          customer: 'XYZ Logistics',
          pickupLocation: 'Warehouse District',
          deliveryLocation: 'Airport Cargo Hub',
          scheduledTime: '2024-01-15T16:00:00Z',
          status: 'assigned',
          priority: 'medium',
          driver: 'John Smith',
          vehicle: 'TR-001',
          estimatedDuration: '1.5 hours',
          distance: '18 miles',
          cargoType: 'Electronics',
          specialInstructions: 'Signature required on delivery',
        },
        {
          id: 3,
          jobNumber: 'J003',
          customer: 'Fast Delivery Co',
          pickupLocation: 'Manufacturing Plant',
          deliveryLocation: 'Retail Store Network',
          scheduledTime: '2024-01-15T18:00:00Z',
          status: 'in_progress',
          priority: 'critical',
          driver: 'Sarah Davis',
          vehicle: 'TR-003',
          estimatedDuration: '3 hours',
          distance: '45 miles',
          cargoType: 'Perishable Goods',
          specialInstructions: 'Temperature controlled, urgent delivery',
        },
        {
          id: 4,
          jobNumber: 'J004',
          customer: 'Regional Supply',
          pickupLocation: 'Central Depot',
          deliveryLocation: 'Multiple Locations',
          scheduledTime: '2024-01-15T10:00:00Z',
          status: 'completed',
          priority: 'low',
          driver: 'Mike Johnson',
          vehicle: 'TR-002',
          estimatedDuration: '4 hours',
          distance: '60 miles',
          cargoType: 'Bulk Materials',
          specialInstructions: 'Multiple stops required',
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
    await loadJobs();
    setRefreshing(false);
  };

  const handleJobPress = (job) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

  const handleAssignDriver = (job) => {
    Alert.alert(
      'Assign Driver',
      `Assign a driver to job ${job.jobNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Select Driver', onPress: () => navigation.navigate('Drivers') },
      ]
    );
  };

  const handleJobAction = (job, action) => {
    switch (action) {
      case 'assign':
        handleAssignDriver(job);
        break;
      case 'edit':
        Alert.alert('Edit Job', 'Edit job functionality would open edit form');
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
      default:
        break;
    }
    setShowJobModal(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'assigned': return colors.info;
      case 'in_progress': return colors.primary;
      case 'completed': return colors.success;
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
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(job.priority) }]}>
          <Text style={styles.priorityText}>{job.priority.toUpperCase()}</Text>
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
      
      <View style={styles.jobDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={14} color={colors.gray[600]} />
          <Text style={styles.detailText}>{new Date(job.scheduledTime).toLocaleTimeString()}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="speedometer-outline" size={14} color={colors.gray[600]} />
          <Text style={styles.detailText}>{job.distance}</Text>
        </View>
        {job.driver && (
          <View style={styles.detailItem}>
            <Ionicons name="person-outline" size={14} color={colors.gray[600]} />
            <Text style={styles.detailText}>{job.driver}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const FilterButton = ({ title, value, isActive }) => (
    <TouchableOpacity
      style={[styles.filterButton, isActive && styles.filterButtonActive]}
      onPress={() => setFilter(value)}
    >
      <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
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
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Locations</Text>
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
              <Text style={styles.modalSectionTitle}>Assignment</Text>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Driver:</Text>
                <Text style={styles.modalValue}>{selectedJob.driver || 'Unassigned'}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Vehicle:</Text>
                <Text style={styles.modalValue}>{selectedJob.vehicle || 'Unassigned'}</Text>
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Details</Text>
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
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Instructions:</Text>
                <Text style={styles.modalValue}>{selectedJob.specialInstructions}</Text>
              </View>
            </View>
          </ScrollView>
        )}
        
        <View style={styles.modalActions}>
          {selectedJob?.status === 'pending' && (
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={() => handleJobAction(selectedJob, 'assign')}
            >
              <Text style={styles.modalButtonText}>Assign Driver</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: colors.gray[600] }]}
            onPress={() => handleJobAction(selectedJob, 'edit')}
          >
            <Text style={styles.modalButtonText}>Edit Job</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: colors.error }]}
            onPress={() => handleJobAction(selectedJob, 'cancel')}
          >
            <Text style={styles.modalButtonText}>Cancel Job</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Job Queue</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
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
        <FilterButton title="All" value="all" isActive={filter === 'all'} />
        <FilterButton title="Pending" value="pending" isActive={filter === 'pending'} />
        <FilterButton title="Assigned" value="assigned" isActive={filter === 'assigned'} />
        <FilterButton title="In Progress" value="in_progress" isActive={filter === 'in_progress'} />
        <FilterButton title="Completed" value="completed" isActive={filter === 'completed'} />
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
  jobNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
    marginRight: spacing.sm,
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
  jobDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
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
});

export default JobQueueScreen;
