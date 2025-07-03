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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme/theme';
import { useNavigation } from '@react-navigation/native';
import { apiService } from '../../services/apiService';

const DispatcherHomeScreen = () => {
  const navigation = useNavigation();
  const [dashboardData, setDashboardData] = useState({
    todaysJobs: 0,
    activeDrivers: 0,
    pendingJobs: 0,
    completedJobs: 0,
    urgentJobs: [],
    recentActivity: [],
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with real API calls
      const mockData = {
        todaysJobs: 24,
        activeDrivers: 18,
        pendingJobs: 6,
        completedJobs: 18,
        urgentJobs: [
          {
            id: 1,
            customer: 'ABC Transport',
            location: 'Downtown Terminal',
            priority: 'High',
            dueTime: '2:30 PM',
            driver: 'John Smith',
          },
          {
            id: 2,
            customer: 'XYZ Logistics',
            location: 'Port Authority',
            priority: 'Critical',
            dueTime: '3:00 PM',
            driver: 'Unassigned',
          },
        ],
        recentActivity: [
          {
            id: 1,
            type: 'job_completed',
            message: 'Job #234 completed by Mike Johnson',
            time: '10 minutes ago',
          },
          {
            id: 2,
            type: 'driver_check_in',
            message: 'Sarah Davis checked in at Terminal B',
            time: '15 minutes ago',
          },
          {
            id: 3,
            type: 'job_assigned',
            message: 'Job #235 assigned to Alex Brown',
            time: '20 minutes ago',
          },
        ],
      };
      
      setDashboardData(mockData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleUrgentJobPress = (job) => {
    Alert.alert(
      'Urgent Job',
      `Customer: ${job.customer}\nLocation: ${job.location}\nDue: ${job.dueTime}\nDriver: ${job.driver}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Assign Driver', onPress: () => navigation.navigate('Drivers') },
        { text: 'View Details', onPress: () => navigation.navigate('JobQueue') },
      ]
    );
  };

  const StatCard = ({ title, value, icon, onPress, color = colors.primary }) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color={colors.white} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  const UrgentJobCard = ({ job }) => (
    <TouchableOpacity 
      style={styles.urgentJobCard} 
      onPress={() => handleUrgentJobPress(job)}
    >
      <View style={styles.urgentJobHeader}>
        <Text style={styles.urgentJobCustomer}>{job.customer}</Text>
        <View style={[styles.priorityBadge, { 
          backgroundColor: job.priority === 'Critical' ? colors.error : colors.warning 
        }]}>
          <Text style={styles.priorityText}>{job.priority}</Text>
        </View>
      </View>
      <Text style={styles.urgentJobLocation}>{job.location}</Text>
      <View style={styles.urgentJobFooter}>
        <Text style={styles.urgentJobDue}>Due: {job.dueTime}</Text>
        <Text style={[styles.urgentJobDriver, { 
          color: job.driver === 'Unassigned' ? colors.error : colors.success 
        }]}>
          {job.driver}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const ActivityItem = ({ activity }) => (
    <View style={styles.activityItem}>
      <View style={styles.activityIcon}>
        <Ionicons 
          name={
            activity.type === 'job_completed' ? 'checkmark-circle' :
            activity.type === 'driver_check_in' ? 'location' : 'briefcase'
          } 
          size={16} 
          color={
            activity.type === 'job_completed' ? colors.success :
            activity.type === 'driver_check_in' ? colors.primary : colors.warning
          } 
        />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityMessage}>{activity.message}</Text>
        <Text style={styles.activityTime}>{activity.time}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dispatcher Dashboard</Text>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={colors.dark} />
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Today's Jobs"
            value={dashboardData.todaysJobs}
            icon="briefcase"
            onPress={() => navigation.navigate('JobQueue')}
            color={colors.primary}
          />
          <StatCard
            title="Active Drivers"
            value={dashboardData.activeDrivers}
            icon="car"
            onPress={() => navigation.navigate('Drivers')}
            color={colors.success}
          />
          <StatCard
            title="Pending Jobs"
            value={dashboardData.pendingJobs}
            icon="time"
            onPress={() => navigation.navigate('JobQueue')}
            color={colors.warning}
          />
          <StatCard
            title="Completed"
            value={dashboardData.completedJobs}
            icon="checkmark-circle"
            onPress={() => navigation.navigate('Reports')}
            color={colors.success}
          />
        </View>

        {/* Urgent Jobs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Urgent Jobs</Text>
            <TouchableOpacity onPress={() => navigation.navigate('JobQueue')}>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>
          {dashboardData.urgentJobs.map(job => (
            <UrgentJobCard key={job.id} job={job} />
          ))}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {dashboardData.recentActivity.map(activity => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('JobQueue')}
            >
              <Ionicons name="add-circle" size={24} color={colors.primary} />
              <Text style={styles.quickActionText}>New Job</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Drivers')}
            >
              <Ionicons name="people" size={24} color={colors.primary} />
              <Text style={styles.quickActionText}>Manage Drivers</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Reports')}
            >
              <Ionicons name="analytics" size={24} color={colors.primary} />
              <Text style={styles.quickActionText}>Reports</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: colors.gray[600],
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
  notificationButton: {
    padding: spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    marginHorizontal: '1%',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.dark,
  },
  statTitle: {
    fontSize: 12,
    color: colors.gray[600],
    marginTop: 2,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.dark,
  },
  sectionLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  urgentJobCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  urgentJobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  urgentJobCustomer: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '500',
  },
  urgentJobLocation: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
  urgentJobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  urgentJobDue: {
    fontSize: 14,
    color: colors.error,
    fontWeight: '500',
  },
  urgentJobDriver: {
    fontSize: 14,
    fontWeight: '500',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    fontSize: 14,
    color: colors.dark,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: colors.gray[600],
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
  },
  quickActionButton: {
    alignItems: 'center',
    padding: spacing.md,
  },
  quickActionText: {
    fontSize: 12,
    color: colors.dark,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

export default DispatcherHomeScreen;
