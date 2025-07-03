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
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme/theme';
import { useNavigation } from '@react-navigation/native';
import { apiService } from '../../services/apiService';

const { width } = Dimensions.get('window');

const AdminHomeScreen = () => {
  const navigation = useNavigation();
  const [dashboardData, setDashboardData] = useState({
    businessMetrics: {
      revenue: 0,
      totalJobs: 0,
      activeCustomers: 0,
      fleetUtilization: 0,
    },
    operationalStats: {
      totalDrivers: 0,
      activeDrivers: 0,
      totalVehicles: 0,
      activeVehicles: 0,
      pendingJobs: 0,
      completedJobs: 0,
    },
    alerts: [],
    recentActivity: [],
    systemHealth: {},
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with real API calls
      const mockData = {
        businessMetrics: {
          revenue: 125670,
          totalJobs: 1847,
          activeCustomers: 89,
          fleetUtilization: 87.3,
        },
        operationalStats: {
          totalDrivers: 25,
          activeDrivers: 18,
          totalVehicles: 22,
          activeVehicles: 16,
          pendingJobs: 14,
          completedJobs: 1833,
        },
        alerts: [
          {
            id: 1,
            type: 'warning',
            title: 'License Expiry Alert',
            message: 'Mike Johnson\'s license expires in 30 days',
            timestamp: '2024-01-15T14:30:00Z',
            severity: 'medium',
          },
          {
            id: 2,
            type: 'error',
            title: 'Vehicle Maintenance Due',
            message: 'TR-003 requires scheduled maintenance',
            timestamp: '2024-01-15T13:45:00Z',
            severity: 'high',
          },
          {
            id: 3,
            type: 'info',
            title: 'New Customer Registration',
            message: 'TechCorp Inc. has been registered',
            timestamp: '2024-01-15T12:20:00Z',
            severity: 'low',
          },
        ],
        recentActivity: [
          {
            id: 1,
            type: 'job_completed',
            message: 'Job #J-1847 completed successfully',
            user: 'Sarah Davis',
            timestamp: '10 minutes ago',
          },
          {
            id: 2,
            type: 'driver_added',
            message: 'New driver Alex Brown onboarded',
            user: 'System',
            timestamp: '2 hours ago',
          },
          {
            id: 3,
            type: 'customer_registered',
            message: 'New customer TechCorp Inc. registered',
            user: 'Admin',
            timestamp: '4 hours ago',
          },
          {
            id: 4,
            type: 'maintenance_scheduled',
            message: 'Maintenance scheduled for TR-005',
            user: 'Fleet Manager',
            timestamp: '6 hours ago',
          },
        ],
        systemHealth: {
          apiStatus: 'healthy',
          databaseStatus: 'healthy',
          gpsTrackingStatus: 'healthy',
          notificationStatus: 'warning',
          backupStatus: 'healthy',
        },
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

  const handleAlertPress = (alert) => {
    Alert.alert(
      alert.title,
      alert.message,
      [
        { text: 'Dismiss', style: 'cancel' },
        { text: 'View Details', onPress: () => console.log('View alert details') },
      ]
    );
  };

  const MetricCard = ({ title, value, icon, color = colors.primary, trend, onPress }) => (
    <TouchableOpacity style={styles.metricCard} onPress={onPress}>
      <View style={[styles.metricIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color={colors.white} />
      </View>
      <View style={styles.metricContent}>
        <Text style={styles.metricValue}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Text>
        <Text style={styles.metricTitle}>{title}</Text>
        {trend && (
          <View style={styles.trendContainer}>
            <Ionicons 
              name={trend > 0 ? 'trending-up' : 'trending-down'} 
              size={12} 
              color={trend > 0 ? colors.success : colors.error} 
            />
            <Text style={[styles.trendText, { color: trend > 0 ? colors.success : colors.error }]}>
              {Math.abs(trend)}%
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const AlertCard = ({ alert }) => {
    const getAlertColor = (severity) => {
      switch (severity) {
        case 'high': return colors.error;
        case 'medium': return colors.warning;
        case 'low': return colors.info;
        default: return colors.gray[500];
      }
    };

    const getAlertIcon = (type) => {
      switch (type) {
        case 'warning': return 'warning';
        case 'error': return 'alert-circle';
        case 'info': return 'information-circle';
        default: return 'alert';
      }
    };

    return (
      <TouchableOpacity style={styles.alertCard} onPress={() => handleAlertPress(alert)}>
        <View style={[styles.alertIcon, { backgroundColor: getAlertColor(alert.severity) }]}>
          <Ionicons name={getAlertIcon(alert.type)} size={16} color={colors.white} />
        </View>
        <View style={styles.alertContent}>
          <Text style={styles.alertTitle}>{alert.title}</Text>
          <Text style={styles.alertMessage} numberOfLines={2}>{alert.message}</Text>
          <Text style={styles.alertTime}>
            {new Date(alert.timestamp).toLocaleTimeString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const ActivityItem = ({ activity }) => {
    const getActivityIcon = (type) => {
      switch (type) {
        case 'job_completed': return 'checkmark-circle';
        case 'driver_added': return 'person-add';
        case 'customer_registered': return 'business';
        case 'maintenance_scheduled': return 'construct';
        default: return 'information-circle';
      }
    };

    const getActivityColor = (type) => {
      switch (type) {
        case 'job_completed': return colors.success;
        case 'driver_added': return colors.primary;
        case 'customer_registered': return colors.info;
        case 'maintenance_scheduled': return colors.warning;
        default: return colors.gray[500];
      }
    };

    return (
      <View style={styles.activityItem}>
        <View style={[styles.activityIcon, { backgroundColor: getActivityColor(activity.type) }]}>
          <Ionicons name={getActivityIcon(activity.type)} size={16} color={colors.white} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityMessage}>{activity.message}</Text>
          <Text style={styles.activityMeta}>{activity.user} • {activity.timestamp}</Text>
        </View>
      </View>
    );
  };

  const SystemHealthIndicator = ({ service, status }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'healthy': return colors.success;
        case 'warning': return colors.warning;
        case 'error': return colors.error;
        default: return colors.gray[500];
      }
    };

    return (
      <View style={styles.healthIndicator}>
        <View style={[styles.healthStatus, { backgroundColor: getStatusColor(status) }]} />
        <Text style={styles.healthService}>{service}</Text>
        <Text style={[styles.healthStatusText, { color: getStatusColor(status) }]}>
          {status.toUpperCase()}
        </Text>
      </View>
    );
  };

  const TabButton = ({ title, value, isActive }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.tabButtonActive]}
      onPress={() => setSelectedTab(value)}
    >
      <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Admin Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>System Overview & Management</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color={colors.dark} />
          {dashboardData.alerts.length > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{dashboardData.alerts.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
        <TabButton title="Overview" value="overview" isActive={selectedTab === 'overview'} />
        <TabButton title="Business" value="business" isActive={selectedTab === 'business'} />
        <TabButton title="Operations" value="operations" isActive={selectedTab === 'operations'} />
        <TabButton title="System" value="system" isActive={selectedTab === 'system'} />
      </ScrollView>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {selectedTab === 'overview' && (
          <>
            {/* Key Metrics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Key Metrics</Text>
              <View style={styles.metricsGrid}>
                <MetricCard
                  title="Monthly Revenue"
                  value={`$${dashboardData.businessMetrics.revenue.toLocaleString()}`}
                  icon="trending-up"
                  color={colors.success}
                  trend={12.5}
                  onPress={() => navigation.navigate('Reports')}
                />
                <MetricCard
                  title="Total Jobs"
                  value={dashboardData.businessMetrics.totalJobs}
                  icon="briefcase"
                  color={colors.primary}
                  trend={8.3}
                  onPress={() => navigation.navigate('Jobs')}
                />
                <MetricCard
                  title="Active Customers"
                  value={dashboardData.businessMetrics.activeCustomers}
                  icon="people"
                  color={colors.info}
                  trend={-2.1}
                />
                <MetricCard
                  title="Fleet Utilization"
                  value={`${dashboardData.businessMetrics.fleetUtilization}%`}
                  icon="car"
                  color={colors.warning}
                  trend={5.7}
                  onPress={() => navigation.navigate('Drivers')}
                />
              </View>
            </View>

            {/* Alerts */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>System Alerts</Text>
                <TouchableOpacity>
                  <Text style={styles.sectionLink}>View All</Text>
                </TouchableOpacity>
              </View>
              {dashboardData.alerts.slice(0, 3).map(alert => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </View>

            {/* Recent Activity */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <View style={styles.activityContainer}>
                {dashboardData.recentActivity.slice(0, 4).map(activity => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </View>
            </View>
          </>
        )}

        {selectedTab === 'business' && (
          <>
            {/* Business Metrics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Business Performance</Text>
              <View style={styles.metricsGrid}>
                <MetricCard
                  title="Monthly Revenue"
                  value={`$${dashboardData.businessMetrics.revenue.toLocaleString()}`}
                  icon="cash"
                  color={colors.success}
                />
                <MetricCard
                  title="Jobs Completed"
                  value={dashboardData.operationalStats.completedJobs}
                  icon="checkmark-circle"
                  color={colors.primary}
                />
                <MetricCard
                  title="Active Customers"
                  value={dashboardData.businessMetrics.activeCustomers}
                  icon="business"
                  color={colors.info}
                />
                <MetricCard
                  title="Revenue Per Job"
                  value={`$${(dashboardData.businessMetrics.revenue / dashboardData.businessMetrics.totalJobs).toFixed(2)}`}
                  icon="calculator"
                  color={colors.warning}
                />
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Business Actions</Text>
              <View style={styles.quickActions}>
                <TouchableOpacity 
                  style={styles.quickActionButton}
                  onPress={() => navigation.navigate('Reports')}
                >
                  <Ionicons name="analytics" size={32} color={colors.primary} />
                  <Text style={styles.quickActionText}>Financial Reports</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.quickActionButton}
                  onPress={() => Alert.alert('Customer Management', 'Navigate to customer management')}
                >
                  <Ionicons name="people" size={32} color={colors.primary} />
                  <Text style={styles.quickActionText}>Customer Management</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.quickActionButton}
                  onPress={() => Alert.alert('Pricing', 'Navigate to pricing management')}
                >
                  <Ionicons name="pricetag" size={32} color={colors.primary} />
                  <Text style={styles.quickActionText}>Pricing & Billing</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {selectedTab === 'operations' && (
          <>
            {/* Operational Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Operational Overview</Text>
              <View style={styles.metricsGrid}>
                <MetricCard
                  title="Active Drivers"
                  value={`${dashboardData.operationalStats.activeDrivers}/${dashboardData.operationalStats.totalDrivers}`}
                  icon="person"
                  color={colors.primary}
                  onPress={() => navigation.navigate('Drivers')}
                />
                <MetricCard
                  title="Active Vehicles"
                  value={`${dashboardData.operationalStats.activeVehicles}/${dashboardData.operationalStats.totalVehicles}`}
                  icon="car"
                  color={colors.success}
                />
                <MetricCard
                  title="Pending Jobs"
                  value={dashboardData.operationalStats.pendingJobs}
                  icon="clock"
                  color={colors.warning}
                  onPress={() => navigation.navigate('Jobs')}
                />
                <MetricCard
                  title="Fleet Utilization"
                  value={`${dashboardData.businessMetrics.fleetUtilization}%`}
                  icon="speedometer"
                  color={colors.info}
                />
              </View>
            </View>

            {/* Operations Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Operations Management</Text>
              <View style={styles.quickActions}>
                <TouchableOpacity 
                  style={styles.quickActionButton}
                  onPress={() => navigation.navigate('Jobs')}
                >
                  <Ionicons name="briefcase" size={32} color={colors.primary} />
                  <Text style={styles.quickActionText}>Job Management</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.quickActionButton}
                  onPress={() => navigation.navigate('Drivers')}
                >
                  <Ionicons name="people" size={32} color={colors.primary} />
                  <Text style={styles.quickActionText}>Driver Management</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.quickActionButton}
                  onPress={() => Alert.alert('Fleet', 'Navigate to fleet management')}
                >
                  <Ionicons name="car" size={32} color={colors.primary} />
                  <Text style={styles.quickActionText}>Fleet Management</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {selectedTab === 'system' && (
          <>
            {/* System Health */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>System Health</Text>
              <View style={styles.systemHealthContainer}>
                <SystemHealthIndicator service="API Services" status={dashboardData.systemHealth.apiStatus} />
                <SystemHealthIndicator service="Database" status={dashboardData.systemHealth.databaseStatus} />
                <SystemHealthIndicator service="GPS Tracking" status={dashboardData.systemHealth.gpsTrackingStatus} />
                <SystemHealthIndicator service="Notifications" status={dashboardData.systemHealth.notificationStatus} />
                <SystemHealthIndicator service="Backup System" status={dashboardData.systemHealth.backupStatus} />
              </View>
            </View>

            {/* System Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>System Management</Text>
              <View style={styles.quickActions}>
                <TouchableOpacity 
                  style={styles.quickActionButton}
                  onPress={() => navigation.navigate('Settings')}
                >
                  <Ionicons name="settings" size={32} color={colors.primary} />
                  <Text style={styles.quickActionText}>System Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.quickActionButton}
                  onPress={() => Alert.alert('User Management', 'Navigate to user management')}
                >
                  <Ionicons name="people-circle" size={32} color={colors.primary} />
                  <Text style={styles.quickActionText}>User Management</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.quickActionButton}
                  onPress={() => Alert.alert('Backup', 'Navigate to backup & security')}
                >
                  <Ionicons name="shield-checkmark" size={32} color={colors.primary} />
                  <Text style={styles.quickActionText}>Backup & Security</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  headerSubtitle: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 2,
  },
  notificationButton: {
    padding: spacing.xs,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  tabContainer: {
    paddingLeft: spacing.lg,
    marginBottom: spacing.md,
  },
  tabButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    marginRight: spacing.sm,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 14,
    color: colors.gray[600],
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: colors.white,
  },
  content: {
    flex: 1,
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
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
  },
  metricCard: {
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
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  metricContent: {
    flex: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
  },
  metricTitle: {
    fontSize: 12,
    color: colors.gray[600],
    marginTop: 2,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 2,
  },
  alertCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark,
  },
  alertMessage: {
    fontSize: 12,
    color: colors.gray[600],
    marginTop: 2,
  },
  alertTime: {
    fontSize: 10,
    color: colors.gray[500],
    marginTop: 4,
  },
  activityContainer: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
  },
  activityMeta: {
    fontSize: 12,
    color: colors.gray[600],
    marginTop: 2,
  },
  systemHealthContainer: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  healthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  healthStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.md,
  },
  healthService: {
    flex: 1,
    fontSize: 14,
    color: colors.dark,
  },
  healthStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
  },
  quickActionButton: {
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 80,
  },
  quickActionText: {
    fontSize: 12,
    color: colors.dark,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});

export default AdminHomeScreen;
