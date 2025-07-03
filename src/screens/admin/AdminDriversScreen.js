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

const AdminDriversScreen = () => {
  const navigation = useNavigation();
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [driverStats, setDriverStats] = useState({});

  useEffect(() => {
    loadDrivers();
    loadDriverStats();
  }, []);

  useEffect(() => {
    filterDrivers();
  }, [drivers, filter, searchQuery]);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      // Mock data - replace with real API calls
      const mockDrivers = [
        {
          id: 1,
          name: 'John Smith',
          email: 'john.smith@company.com',
          phone: '+1 (555) 123-4567',
          status: 'active',
          employmentStatus: 'full_time',
          location: 'Terminal A, Houston',
          lastUpdate: '2024-01-15T14:30:00Z',
          currentJob: 'J002',
          vehicle: {
            id: 'TR-001',
            make: 'Freightliner',
            model: 'Cascadia',
            license: 'TX-123ABC',
          },
          performance: {
            todaysJobs: 3,
            weeklyJobs: 18,
            monthlyJobs: 72,
            rating: 4.8,
            totalJobs: 245,
            onTimeDeliveryRate: 96.5,
            customerRating: 4.7,
          },
          employment: {
            joinDate: '2023-03-15',
            department: 'Transportation',
            manager: 'Sarah Wilson',
            salary: 65000,
            bonusEarned: 8500,
          },
          certifications: {
            licenseNumber: 'CDL-TX-12345',
            licenseExpiry: '2025-08-20',
            certifications: ['CDL-A', 'HazMat', 'Defensive Driving'],
            medicalExpiry: '2024-12-15',
            backgroundCheck: '2023-03-10',
          },
          documents: {
            license: 'completed',
            insurance: 'completed',
            medical: 'expires_soon',
            backgroundCheck: 'completed',
            drugTest: 'completed',
          },
        },
        {
          id: 2,
          name: 'Sarah Davis',
          email: 'sarah.davis@company.com',
          phone: '+1 (555) 234-5678',
          status: 'active',
          employmentStatus: 'full_time',
          location: 'Downtown Depot',
          lastUpdate: '2024-01-15T13:45:00Z',
          currentJob: null,
          vehicle: {
            id: 'TR-003',
            make: 'Peterbilt',
            model: '579',
            license: 'TX-456DEF',
          },
          performance: {
            todaysJobs: 2,
            weeklyJobs: 15,
            monthlyJobs: 68,
            rating: 4.9,
            totalJobs: 189,
            onTimeDeliveryRate: 98.2,
            customerRating: 4.8,
          },
          employment: {
            joinDate: '2023-06-10',
            department: 'Transportation',
            manager: 'Mike Johnson',
            salary: 68000,
            bonusEarned: 9200,
          },
          certifications: {
            licenseNumber: 'CDL-TX-67890',
            licenseExpiry: '2026-02-15',
            certifications: ['CDL-A', 'Passenger', 'First Aid'],
            medicalExpiry: '2025-01-20',
            backgroundCheck: '2023-06-05',
          },
          documents: {
            license: 'completed',
            insurance: 'completed',
            medical: 'completed',
            backgroundCheck: 'completed',
            drugTest: 'completed',
          },
        },
        {
          id: 3,
          name: 'Mike Johnson',
          email: 'mike.johnson@company.com',
          phone: '+1 (555) 345-6789',
          status: 'inactive',
          employmentStatus: 'part_time',
          location: 'Home Base',
          lastUpdate: '2024-01-15T09:00:00Z',
          currentJob: null,
          vehicle: {
            id: 'TR-002',
            make: 'Kenworth',
            model: 'T680',
            license: 'TX-789GHI',
          },
          performance: {
            todaysJobs: 0,
            weeklyJobs: 8,
            monthlyJobs: 35,
            rating: 4.7,
            totalJobs: 312,
            onTimeDeliveryRate: 94.5,
            customerRating: 4.6,
          },
          employment: {
            joinDate: '2022-11-20',
            department: 'Transportation',
            manager: 'Sarah Wilson',
            salary: 45000,
            bonusEarned: 4200,
          },
          certifications: {
            licenseNumber: 'CDL-TX-11111',
            licenseExpiry: '2024-12-30',
            certifications: ['CDL-A', 'HazMat', 'Tanker'],
            medicalExpiry: '2024-11-30',
            backgroundCheck: '2022-11-15',
          },
          documents: {
            license: 'expires_soon',
            insurance: 'completed',
            medical: 'expires_soon',
            backgroundCheck: 'completed',
            drugTest: 'expired',
          },
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

  const loadDriverStats = async () => {
    try {
      const mockStats = {
        totalDrivers: 25,
        activeDrivers: 18,
        inactiveDrivers: 7,
        fullTimeDrivers: 20,
        partTimeDrivers: 5,
        avgRating: 4.7,
        totalJobsCompleted: 8543,
        avgJobsPerDriver: 342,
        onTimeDeliveryRate: 95.2,
        documentExpiryAlerts: 8,
        totalPayroll: 156750,
        avgSalary: 62700,
        bonusPool: 125000,
      };
      setDriverStats(mockStats);
    } catch (error) {
      console.error('Error loading driver stats:', error);
    }
  };

  const filterDrivers = () => {
    let filtered = drivers;
    
    if (filter !== 'all') {
      if (filter === 'active' || filter === 'inactive') {
        filtered = filtered.filter(driver => driver.status === filter);
      } else if (filter === 'full_time' || filter === 'part_time') {
        filtered = filtered.filter(driver => driver.employmentStatus === filter);
      } else if (filter === 'document_alerts') {
        filtered = filtered.filter(driver => 
          Object.values(driver.documents).some(status => 
            status === 'expires_soon' || status === 'expired'
          )
        );
      }
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
    await Promise.all([loadDrivers(), loadDriverStats()]);
    setRefreshing(false);
  };

  const handleDriverPress = (driver) => {
    setSelectedDriver(driver);
    setShowDriverModal(true);
  };

  const handleDriverAction = (driver, action) => {
    switch (action) {
      case 'edit':
        Alert.alert('Edit Driver', 'Edit driver profile functionality');
        break;
      case 'deactivate':
        Alert.alert(
          'Deactivate Driver',
          `Are you sure you want to deactivate ${driver.name}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Deactivate', style: 'destructive', onPress: () => console.log('Driver deactivated') },
          ]
        );
        break;
      case 'activate':
        Alert.alert(
          'Activate Driver',
          `Activate ${driver.name}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Activate', onPress: () => console.log('Driver activated') },
          ]
        );
        break;
      case 'documents':
        Alert.alert('Documents', 'View/manage driver documents');
        break;
      case 'payroll':
        Alert.alert('Payroll', 'View payroll and compensation details');
        break;
      default:
        break;
    }
    setShowDriverModal(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return colors.success;
      case 'inactive': return colors.error;
      default: return colors.gray[500];
    }
  };

  const getDocumentStatusColor = (status) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'expires_soon': return colors.warning;
      case 'expired': return colors.error;
      default: return colors.gray[500];
    }
  };

  const DriverCard = ({ driver }) => {
    const hasAlerts = Object.values(driver.documents).some(status => 
      status === 'expires_soon' || status === 'expired'
    );

    return (
      <TouchableOpacity style={styles.driverCard} onPress={() => handleDriverPress(driver)}>
        <View style={styles.driverHeader}>
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>{driver.name}</Text>
            <Text style={styles.driverVehicle}>{driver.vehicle.id} • {driver.employment.department}</Text>
          </View>
          <View style={styles.driverStatusContainer}>
            {hasAlerts && (
              <Ionicons name="warning" size={16} color={colors.warning} style={styles.alertIcon} />
            )}
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(driver.status) }]}>
              <Text style={styles.statusText}>{driver.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.performanceRow}>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceValue}>{driver.performance.rating}</Text>
            <Text style={styles.performanceLabel}>Rating</Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceValue}>{driver.performance.totalJobs}</Text>
            <Text style={styles.performanceLabel}>Total Jobs</Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceValue}>{driver.performance.onTimeDeliveryRate}%</Text>
            <Text style={styles.performanceLabel}>On Time</Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceValue}>${(driver.employment.salary / 1000).toFixed(0)}K</Text>
            <Text style={styles.performanceLabel}>Salary</Text>
          </View>
        </View>

        <View style={styles.driverFooter}>
          <View style={styles.employmentInfo}>
            <Text style={styles.employmentText}>
              {driver.employmentStatus.replace('_', ' ').toUpperCase()} • 
              Joined {new Date(driver.employment.joinDate).toLocaleDateString()}
            </Text>
          </View>
          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="call-outline" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

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
          <Text style={styles.modalTitle}>Driver Statistics</Text>
          <TouchableOpacity onPress={() => setShowStatsModal(false)}>
            <Ionicons name="close" size={24} color={colors.dark} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{driverStats.totalDrivers}</Text>
              <Text style={styles.statLabel}>Total Drivers</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: colors.success }]}>
                {driverStats.activeDrivers}
              </Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: colors.error }]}>
                {driverStats.inactiveDrivers}
              </Text>
              <Text style={styles.statLabel}>Inactive</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{driverStats.avgRating}</Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
          </View>

          <View style={styles.statsSection}>
            <Text style={styles.statsSectionTitle}>Employment Status</Text>
            <View style={styles.employmentStats}>
              <View style={styles.employmentStatRow}>
                <Text style={styles.employmentStatLabel}>Full-Time Drivers</Text>
                <Text style={styles.employmentStatValue}>{driverStats.fullTimeDrivers}</Text>
              </View>
              <View style={styles.employmentStatRow}>
                <Text style={styles.employmentStatLabel}>Part-Time Drivers</Text>
                <Text style={styles.employmentStatValue}>{driverStats.partTimeDrivers}</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsSection}>
            <Text style={styles.statsSectionTitle}>Performance Overview</Text>
            <View style={styles.performanceStats}>
              <View style={styles.performanceStatRow}>
                <Text style={styles.performanceStatLabel}>Total Jobs Completed</Text>
                <Text style={styles.performanceStatValue}>
                  {driverStats.totalJobsCompleted?.toLocaleString()}
                </Text>
              </View>
              <View style={styles.performanceStatRow}>
                <Text style={styles.performanceStatLabel}>Avg Jobs per Driver</Text>
                <Text style={styles.performanceStatValue}>{driverStats.avgJobsPerDriver}</Text>
              </View>
              <View style={styles.performanceStatRow}>
                <Text style={styles.performanceStatLabel}>On-Time Delivery Rate</Text>
                <Text style={styles.performanceStatValue}>{driverStats.onTimeDeliveryRate}%</Text>
              </View>
              <View style={styles.performanceStatRow}>
                <Text style={styles.performanceStatLabel}>Document Expiry Alerts</Text>
                <Text style={[styles.performanceStatValue, { color: colors.warning }]}>
                  {driverStats.documentExpiryAlerts}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.statsSection}>
            <Text style={styles.statsSectionTitle}>Payroll Overview</Text>
            <View style={styles.payrollStats}>
              <View style={styles.payrollStatRow}>
                <Text style={styles.payrollStatLabel}>Total Monthly Payroll</Text>
                <Text style={styles.payrollStatValue}>
                  ${driverStats.totalPayroll?.toLocaleString()}
                </Text>
              </View>
              <View style={styles.payrollStatRow}>
                <Text style={styles.payrollStatLabel}>Average Salary</Text>
                <Text style={styles.payrollStatValue}>
                  ${driverStats.avgSalary?.toLocaleString()}
                </Text>
              </View>
              <View style={styles.payrollStatRow}>
                <Text style={styles.payrollStatLabel}>Total Bonuses Paid</Text>
                <Text style={styles.payrollStatValue}>
                  ${driverStats.bonusPool?.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
          <Text style={styles.modalTitle}>Driver Profile</Text>
          <TouchableOpacity onPress={() => setShowDriverModal(false)}>
            <Ionicons name="close" size={24} color={colors.dark} />
          </TouchableOpacity>
        </View>
        
        {selectedDriver && (
          <ScrollView style={styles.modalContent}>
            {/* Personal Information */}
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
                  {selectedDriver.status.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Employment Information */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Employment Details</Text>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Department:</Text>
                <Text style={styles.modalValue}>{selectedDriver.employment.department}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Manager:</Text>
                <Text style={styles.modalValue}>{selectedDriver.employment.manager}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Employment Type:</Text>
                <Text style={styles.modalValue}>
                  {selectedDriver.employmentStatus.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Join Date:</Text>
                <Text style={styles.modalValue}>
                  {new Date(selectedDriver.employment.joinDate).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Annual Salary:</Text>
                <Text style={styles.modalValue}>
                  ${selectedDriver.employment.salary.toLocaleString()}
                </Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Bonus Earned:</Text>
                <Text style={styles.modalValue}>
                  ${selectedDriver.employment.bonusEarned.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Performance Metrics */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Performance Metrics</Text>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Overall Rating:</Text>
                <Text style={styles.modalValue}>{selectedDriver.performance.rating}/5.0</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Customer Rating:</Text>
                <Text style={styles.modalValue}>{selectedDriver.performance.customerRating}/5.0</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Total Jobs:</Text>
                <Text style={styles.modalValue}>{selectedDriver.performance.totalJobs}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>This Month:</Text>
                <Text style={styles.modalValue}>{selectedDriver.performance.monthlyJobs} jobs</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>On-Time Delivery:</Text>
                <Text style={styles.modalValue}>{selectedDriver.performance.onTimeDeliveryRate}%</Text>
              </View>
            </View>

            {/* Vehicle Information */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Vehicle Assignment</Text>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Vehicle ID:</Text>
                <Text style={styles.modalValue}>{selectedDriver.vehicle.id}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Make/Model:</Text>
                <Text style={styles.modalValue}>
                  {selectedDriver.vehicle.make} {selectedDriver.vehicle.model}
                </Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>License Plate:</Text>
                <Text style={styles.modalValue}>{selectedDriver.vehicle.license}</Text>
              </View>
            </View>

            {/* Certifications & Documents */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Certifications & Documents</Text>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>License Number:</Text>
                <Text style={styles.modalValue}>{selectedDriver.certifications.licenseNumber}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>License Expiry:</Text>
                <Text style={styles.modalValue}>
                  {new Date(selectedDriver.certifications.licenseExpiry).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Medical Expiry:</Text>
                <Text style={styles.modalValue}>
                  {new Date(selectedDriver.certifications.medicalExpiry).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Certifications:</Text>
                <Text style={styles.modalValue}>
                  {selectedDriver.certifications.certifications.join(', ')}
                </Text>
              </View>
            </View>

            {/* Document Status */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Document Status</Text>
              {Object.entries(selectedDriver.documents).map(([doc, status]) => (
                <View key={doc} style={styles.modalRow}>
                  <Text style={styles.modalLabel}>
                    {doc.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                  </Text>
                  <Text style={[styles.modalValue, { color: getDocumentStatusColor(status) }]}>
                    {status.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
        
        <View style={styles.modalActions}>
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: colors.primary }]}
            onPress={() => handleDriverAction(selectedDriver, 'edit')}
          >
            <Text style={styles.modalButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: colors.info }]}
            onPress={() => handleDriverAction(selectedDriver, 'documents')}
          >
            <Text style={styles.modalButtonText}>Documents</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: colors.success }]}
            onPress={() => handleDriverAction(selectedDriver, 'payroll')}
          >
            <Text style={styles.modalButtonText}>Payroll</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, { 
              backgroundColor: selectedDriver?.status === 'active' ? colors.error : colors.success 
            }]}
            onPress={() => handleDriverAction(
              selectedDriver, 
              selectedDriver?.status === 'active' ? 'deactivate' : 'activate'
            )}
          >
            <Text style={styles.modalButtonText}>
              {selectedDriver?.status === 'active' ? 'Deactivate' : 'Activate'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  const getFilterCount = (filterValue) => {
    switch (filterValue) {
      case 'all': return drivers.length;
      case 'active': return drivers.filter(d => d.status === 'active').length;
      case 'inactive': return drivers.filter(d => d.status === 'inactive').length;
      case 'full_time': return drivers.filter(d => d.employmentStatus === 'full_time').length;
      case 'part_time': return drivers.filter(d => d.employmentStatus === 'part_time').length;
      case 'document_alerts': 
        return drivers.filter(d => 
          Object.values(d.documents).some(status => 
            status === 'expires_soon' || status === 'expired'
          )
        ).length;
      default: return 0;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Driver Management</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.statsButton}
            onPress={() => setShowStatsModal(true)}
          >
            <Ionicons name="analytics-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="person-add" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={colors.gray[600]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search drivers, vehicles, departments..."
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
          title="Active" 
          value="active" 
          isActive={filter === 'active'} 
          count={getFilterCount('active')}
        />
        <FilterButton 
          title="Inactive" 
          value="inactive" 
          isActive={filter === 'inactive'} 
          count={getFilterCount('inactive')}
        />
        <FilterButton 
          title="Full-Time" 
          value="full_time" 
          isActive={filter === 'full_time'} 
          count={getFilterCount('full_time')}
        />
        <FilterButton 
          title="Part-Time" 
          value="part_time" 
          isActive={filter === 'part_time'} 
          count={getFilterCount('part_time')}
        />
        <FilterButton 
          title="Doc Alerts" 
          value="document_alerts" 
          isActive={filter === 'document_alerts'} 
          count={getFilterCount('document_alerts')}
        />
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
  driverStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIcon: {
    marginRight: spacing.xs,
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
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
  },
  performanceItem: {
    alignItems: 'center',
    flex: 1,
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark,
  },
  performanceLabel: {
    fontSize: 10,
    color: colors.gray[600],
    marginTop: 2,
  },
  driverFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  employmentInfo: {
    flex: 1,
  },
  employmentText: {
    fontSize: 12,
    color: colors.gray[600],
  },
  contactButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 12,
    fontWeight: '600',
  },
  // Stats Modal Styles
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
  employmentStats: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
  },
  employmentStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  employmentStatLabel: {
    fontSize: 14,
    color: colors.gray[600],
  },
  employmentStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark,
  },
  performanceStats: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
  },
  performanceStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  performanceStatLabel: {
    fontSize: 14,
    color: colors.gray[600],
  },
  performanceStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark,
  },
  payrollStats: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
  },
  payrollStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  payrollStatLabel: {
    fontSize: 14,
    color: colors.gray[600],
  },
  payrollStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark,
  },
});

export default AdminDriversScreen;
