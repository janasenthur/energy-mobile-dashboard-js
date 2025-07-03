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

const DriverManagementScreen = () => {
  const navigation = useNavigation();
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [filter, setFilter] = useState('all'); // all, active, on_duty, off_duty, available
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showDriverModal, setShowDriverModal] = useState(false);

  useEffect(() => {
    loadDrivers();
  }, []);

  useEffect(() => {
    filterDrivers();
  }, [drivers, filter, searchQuery]);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with real API calls
      const mockDrivers = [
        {
          id: 1,
          name: 'John Smith',
          email: 'john.smith@company.com',
          phone: '+1 (555) 123-4567',
          status: 'on_duty',
          location: 'Terminal A, Houston',
          lastUpdate: '2024-01-15T14:30:00Z',
          currentJob: 'J002',
          vehicle: {
            id: 'TR-001',
            make: 'Freightliner',
            model: 'Cascadia',
            license: 'TX-123ABC',
          },
          todaysJobs: 3,
          rating: 4.8,
          totalJobs: 245,
          joinDate: '2023-03-15',
          licenseExpiry: '2025-08-20',
          certifications: ['CDL-A', 'HazMat'],
        },
        {
          id: 2,
          name: 'Sarah Davis',
          email: 'sarah.davis@company.com',
          phone: '+1 (555) 234-5678',
          status: 'available',
          location: 'Downtown Depot',
          lastUpdate: '2024-01-15T13:45:00Z',
          currentJob: null,
          vehicle: {
            id: 'TR-003',
            make: 'Peterbilt',
            model: '579',
            license: 'TX-456DEF',
          },
          todaysJobs: 2,
          rating: 4.9,
          totalJobs: 189,
          joinDate: '2023-06-10',
          licenseExpiry: '2026-02-15',
          certifications: ['CDL-A', 'Passenger'],
        },
        {
          id: 3,
          name: 'Mike Johnson',
          email: 'mike.johnson@company.com',
          phone: '+1 (555) 345-6789',
          status: 'off_duty',
          location: 'Home Base',
          lastUpdate: '2024-01-15T09:00:00Z',
          currentJob: null,
          vehicle: {
            id: 'TR-002',
            make: 'Kenworth',
            model: 'T680',
            license: 'TX-789GHI',
          },
          todaysJobs: 4,
          rating: 4.7,
          totalJobs: 312,
          joinDate: '2022-11-20',
          licenseExpiry: '2024-12-30',
          certifications: ['CDL-A', 'HazMat', 'Tanker'],
        },
        {
          id: 4,
          name: 'Alex Brown',
          email: 'alex.brown@company.com',
          phone: '+1 (555) 456-7890',
          status: 'on_duty',
          location: 'En Route to Port',
          lastUpdate: '2024-01-15T14:15:00Z',
          currentJob: 'J005',
          vehicle: {
            id: 'TR-004',
            make: 'Volvo',
            model: 'VNL',
            license: 'TX-012JKL',
          },
          todaysJobs: 2,
          rating: 4.6,
          totalJobs: 98,
          joinDate: '2023-09-05',
          licenseExpiry: '2025-11-10',
          certifications: ['CDL-A'],
        },
      ];
      
      setDrivers(mockDrivers);
    } catch (error) {
      console.error('Error loading drivers:', error);
      Alert.alert('Error', 'Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const filterDrivers = () => {
    let filtered = drivers;
    
    if (filter !== 'all') {
      filtered = filtered.filter(driver => driver.status === filter);
    }
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(driver => 
        driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.vehicle.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredDrivers(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDrivers();
    setRefreshing(false);
  };

  const handleDriverPress = (driver) => {
    setSelectedDriver(driver);
    setShowDriverModal(true);
  };

  const handleDriverAction = (driver, action) => {
    switch (action) {
      case 'assign_job':
        Alert.alert('Assign Job', 'Job assignment functionality would open job selection');
        break;
      case 'contact':
        Alert.alert(
          'Contact Driver',
          `Call ${driver.name}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Call', onPress: () => console.log(`Calling ${driver.phone}`) },
          ]
        );
        break;
      case 'change_status':
        Alert.alert(
          'Change Status',
          'Status change functionality would show status options'
        );
        break;
      case 'view_location':
        Alert.alert('View Location', 'This would open map with driver location');
        break;
      default:
        break;
    }
    setShowDriverModal(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'on_duty': return colors.primary;
      case 'available': return colors.success;
      case 'off_duty': return colors.gray[500];
      case 'inactive': return colors.error;
      default: return colors.gray[500];
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'on_duty': return 'radio-button-on';
      case 'available': return 'checkmark-circle';
      case 'off_duty': return 'pause-circle';
      case 'inactive': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const DriverCard = ({ driver }) => (
    <TouchableOpacity style={styles.driverCard} onPress={() => handleDriverPress(driver)}>
      <View style={styles.driverHeader}>
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{driver.name}</Text>
          <Text style={styles.driverVehicle}>{driver.vehicle.id}</Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(driver.status) }]}>
            <Ionicons name={getStatusIcon(driver.status)} size={12} color={colors.white} />
            <Text style={styles.statusText}>{driver.status.replace('_', ' ').toUpperCase()}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.driverDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="location-outline" size={16} color={colors.gray[600]} />
          <Text style={styles.detailText} numberOfLines={1}>{driver.location}</Text>
        </View>
        
        {driver.currentJob && (
          <View style={styles.detailItem}>
            <Ionicons name="briefcase-outline" size={16} color={colors.primary} />
            <Text style={[styles.detailText, { color: colors.primary }]}>Job: {driver.currentJob}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.driverStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{driver.todaysJobs}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{driver.rating}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{driver.totalJobs}</Text>
          <Text style={styles.statLabel}>Total Jobs</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDriverAction(driver, 'contact')}
          >
            <Ionicons name="call" size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDriverAction(driver, 'view_location')}
          >
            <Ionicons name="location" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
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

  const DriverModal = () => (
    <Modal
      visible={showDriverModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowDriverModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Driver Details</Text>
          <TouchableOpacity onPress={() => setShowDriverModal(false)}>
            <Ionicons name="close" size={24} color={colors.dark} />
          </TouchableOpacity>
        </View>
        
        {selectedDriver && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Personal Information</Text>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Name:</Text>
                <Text style={styles.modalValue}>{selectedDriver.name}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Email:</Text>
                <Text style={styles.modalValue}>{selectedDriver.email}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Phone:</Text>
                <Text style={styles.modalValue}>{selectedDriver.phone}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Status:</Text>
                <Text style={[styles.modalValue, { color: getStatusColor(selectedDriver.status) }]}>
                  {selectedDriver.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Vehicle Information</Text>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Vehicle ID:</Text>
                <Text style={styles.modalValue}>{selectedDriver.vehicle.id}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Make/Model:</Text>
                <Text style={styles.modalValue}>{selectedDriver.vehicle.make} {selectedDriver.vehicle.model}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>License:</Text>
                <Text style={styles.modalValue}>{selectedDriver.vehicle.license}</Text>
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Work Information</Text>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Current Job:</Text>
                <Text style={styles.modalValue}>{selectedDriver.currentJob || 'None'}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Location:</Text>
                <Text style={styles.modalValue}>{selectedDriver.location}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Today's Jobs:</Text>
                <Text style={styles.modalValue}>{selectedDriver.todaysJobs}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Total Jobs:</Text>
                <Text style={styles.modalValue}>{selectedDriver.totalJobs}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Rating:</Text>
                <Text style={styles.modalValue}>{selectedDriver.rating}/5.0</Text>
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Certifications & Licenses</Text>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Certifications:</Text>
                <Text style={styles.modalValue}>{selectedDriver.certifications.join(', ')}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>License Expiry:</Text>
                <Text style={styles.modalValue}>{new Date(selectedDriver.licenseExpiry).toLocaleDateString()}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Join Date:</Text>
                <Text style={styles.modalValue}>{new Date(selectedDriver.joinDate).toLocaleDateString()}</Text>
              </View>
            </View>
          </ScrollView>
        )}
        
        <View style={styles.modalActions}>
          {selectedDriver?.status === 'available' && (
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={() => handleDriverAction(selectedDriver, 'assign_job')}
            >
              <Text style={styles.modalButtonText}>Assign Job</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: colors.success }]}
            onPress={() => handleDriverAction(selectedDriver, 'contact')}
          >
            <Text style={styles.modalButtonText}>Contact</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: colors.warning }]}
            onPress={() => handleDriverAction(selectedDriver, 'change_status')}
          >
            <Text style={styles.modalButtonText}>Change Status</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Driver Management</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="person-add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={colors.gray[600]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search drivers, vehicles..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        <FilterButton title="All" value="all" isActive={filter === 'all'} />
        <FilterButton title="On Duty" value="on_duty" isActive={filter === 'on_duty'} />
        <FilterButton title="Available" value="available" isActive={filter === 'available'} />
        <FilterButton title="Off Duty" value="off_duty" isActive={filter === 'off_duty'} />
      </ScrollView>

      <ScrollView
        style={styles.driversList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading drivers...</Text>
          </View>
        ) : filteredDrivers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={colors.gray[400]} />
            <Text style={styles.emptyText}>No drivers found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filter</Text>
          </View>
        ) : (
          filteredDrivers.map(driver => <DriverCard key={driver.id} driver={driver} />)
        )}
      </ScrollView>

      <DriverModal />
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
  driversList: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  driverCard: {
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
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
  },
  driverVehicle: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 2,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  driverDetails: {
    marginBottom: spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailText: {
    fontSize: 14,
    color: colors.gray[600],
    marginLeft: spacing.xs,
    flex: 1,
  },
  driverStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray[600],
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
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

export default DriverManagementScreen;
