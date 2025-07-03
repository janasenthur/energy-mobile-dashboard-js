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

const { width } = Dimensions.get('window');

const DispatcherReportsScreen = () => {
  const navigation = useNavigation();
  const [selectedPeriod, setSelectedPeriod] = useState('today'); // today, week, month, year
  const [reportData, setReportData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with real API calls
      const mockData = {
        summary: {
          totalJobs: selectedPeriod === 'today' ? 24 : selectedPeriod === 'week' ? 156 : selectedPeriod === 'month' ? 687 : 8234,
          completedJobs: selectedPeriod === 'today' ? 18 : selectedPeriod === 'week' ? 142 : selectedPeriod === 'month' ? 623 : 7456,
          pendingJobs: selectedPeriod === 'today' ? 6 : selectedPeriod === 'week' ? 14 : selectedPeriod === 'month' ? 64 : 778,
          cancelledJobs: selectedPeriod === 'today' ? 0 : selectedPeriod === 'week' ? 3 : selectedPeriod === 'month' ? 12 : 142,
          activeDrivers: 18,
          totalDrivers: 25,
          avgCompletionTime: '2.3 hours',
          onTimeDeliveryRate: 94.2,
        },
        performance: {
          topDrivers: [
            { name: 'John Smith', jobs: 8, rating: 4.9, onTime: 100 },
            { name: 'Sarah Davis', jobs: 7, rating: 4.8, onTime: 95 },
            { name: 'Mike Johnson', jobs: 6, rating: 4.7, onTime: 98 },
          ],
          jobsByStatus: [
            { status: 'Completed', count: 623, percentage: 90.7 },
            { status: 'Pending', count: 64, percentage: 9.3 },
            { status: 'Cancelled', count: 12, percentage: 1.7 },
          ],
          hourlyDistribution: [
            { hour: '06:00', jobs: 12 },
            { hour: '08:00', jobs: 28 },
            { hour: '10:00', jobs: 45 },
            { hour: '12:00', jobs: 52 },
            { hour: '14:00', jobs: 48 },
            { hour: '16:00', jobs: 38 },
            { hour: '18:00', jobs: 22 },
            { hour: '20:00', jobs: 8 },
          ],
        },
        metrics: {
          avgJobsPerDriver: 4.2,
          avgJobDuration: '2.3 hours',
          totalDistance: '1,245 miles',
          fuelEfficiency: '6.8 MPG',
          customerSatisfaction: 4.6,
          costPerJob: '$85.50',
        },
      };
      
      setReportData(mockData);
    } catch (error) {
      console.error('Error loading report data:', error);
      Alert.alert('Error', 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReportData();
    setRefreshing(false);
  };

  const PeriodButton = ({ title, value, isActive }) => (
    <TouchableOpacity
      style={[styles.periodButton, isActive && styles.periodButtonActive]}
      onPress={() => setSelectedPeriod(value)}
    >
      <Text style={[styles.periodButtonText, isActive && styles.periodButtonTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const SummaryCard = ({ title, value, icon, color = colors.primary, subtitle }) => (
    <View style={styles.summaryCard}>
      <View style={[styles.summaryIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color={colors.white} />
      </View>
      <View style={styles.summaryContent}>
        <Text style={styles.summaryValue}>{value}</Text>
        <Text style={styles.summaryTitle}>{title}</Text>
        {subtitle && <Text style={styles.summarySubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  const MetricCard = ({ title, value, icon }) => (
    <View style={styles.metricCard}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
    </View>
  );

  const DriverRow = ({ driver, index }) => (
    <View style={styles.driverRow}>
      <View style={styles.driverRank}>
        <Text style={styles.rankNumber}>{index + 1}</Text>
      </View>
      <View style={styles.driverInfo}>
        <Text style={styles.driverName}>{driver.name}</Text>
        <Text style={styles.driverJobs}>{driver.jobs} jobs</Text>
      </View>
      <View style={styles.driverStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{driver.rating}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{driver.onTime}%</Text>
          <Text style={styles.statLabel}>On Time</Text>
        </View>
      </View>
    </View>
  );

  const StatusBar = ({ status, count, percentage, total }) => {
    const barWidth = (count / total) * 100;
    const getStatusColor = (status) => {
      switch (status.toLowerCase()) {
        case 'completed': return colors.success;
        case 'pending': return colors.warning;
        case 'cancelled': return colors.error;
        default: return colors.gray[400];
      }
    };

    return (
      <View style={styles.statusBarContainer}>
        <View style={styles.statusBarHeader}>
          <Text style={styles.statusLabel}>{status}</Text>
          <Text style={styles.statusCount}>{count} ({percentage}%)</Text>
        </View>
        <View style={styles.statusBarTrack}>
          <View 
            style={[
              styles.statusBarFill, 
              { 
                width: `${barWidth}%`, 
                backgroundColor: getStatusColor(status) 
              }
            ]} 
          />
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Reports...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports & Analytics</Text>
        <TouchableOpacity style={styles.exportButton}>
          <Ionicons name="download-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodContainer}>
        <PeriodButton title="Today" value="today" isActive={selectedPeriod === 'today'} />
        <PeriodButton title="This Week" value="week" isActive={selectedPeriod === 'week'} />
        <PeriodButton title="This Month" value="month" isActive={selectedPeriod === 'month'} />
        <PeriodButton title="This Year" value="year" isActive={selectedPeriod === 'year'} />
      </ScrollView>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {reportData && (
          <>
            {/* Summary Cards */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <View style={styles.summaryGrid}>
                <SummaryCard
                  title="Total Jobs"
                  value={reportData.summary.totalJobs}
                  icon="briefcase"
                  color={colors.primary}
                />
                <SummaryCard
                  title="Completed"
                  value={reportData.summary.completedJobs}
                  icon="checkmark-circle"
                  color={colors.success}
                />
                <SummaryCard
                  title="Pending"
                  value={reportData.summary.pendingJobs}
                  icon="time"
                  color={colors.warning}
                />
                <SummaryCard
                  title="Active Drivers"
                  value={`${reportData.summary.activeDrivers}/${reportData.summary.totalDrivers}`}
                  icon="people"
                  color={colors.info}
                />
              </View>
            </View>

            {/* Key Metrics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Key Metrics</Text>
              <View style={styles.metricsGrid}>
                <MetricCard
                  title="Avg Jobs/Driver"
                  value={reportData.metrics.avgJobsPerDriver}
                  icon="bar-chart"
                />
                <MetricCard
                  title="Avg Duration"
                  value={reportData.metrics.avgJobDuration}
                  icon="time"
                />
                <MetricCard
                  title="On-Time Rate"
                  value={`${reportData.summary.onTimeDeliveryRate}%`}
                  icon="checkmark-done"
                />
                <MetricCard
                  title="Cost/Job"
                  value={reportData.metrics.costPerJob}
                  icon="calculator"
                />
              </View>
            </View>

            {/* Job Status Distribution */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Job Status Distribution</Text>
              <View style={styles.statusSection}>
                {reportData.performance.jobsByStatus.map((item, index) => (
                  <StatusBar
                    key={index}
                    status={item.status}
                    count={item.count}
                    percentage={item.percentage}
                    total={reportData.summary.totalJobs}
                  />
                ))}
              </View>
            </View>

            {/* Top Performers */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Top Performing Drivers</Text>
                <TouchableOpacity>
                  <Text style={styles.sectionLink}>View All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.driversSection}>
                {reportData.performance.topDrivers.map((driver, index) => (
                  <DriverRow key={index} driver={driver} index={index} />
                ))}
              </View>
            </View>

            {/* Performance Chart Placeholder */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Hourly Job Distribution</Text>
              <View style={styles.chartContainer}>
                <Text style={styles.chartPlaceholder}>
                  📊 Chart visualization would go here
                </Text>
                <Text style={styles.chartDescription}>
                  Peak hours: 12:00 PM - 2:00 PM ({reportData.performance.hourlyDistribution[3]?.jobs} jobs)
                </Text>
              </View>
            </View>

            {/* Additional Metrics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Metrics</Text>
              <View style={styles.additionalMetrics}>
                <View style={styles.metricRow}>
                  <Text style={styles.metricRowLabel}>Total Distance Covered</Text>
                  <Text style={styles.metricRowValue}>{reportData.metrics.totalDistance}</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricRowLabel}>Fleet Fuel Efficiency</Text>
                  <Text style={styles.metricRowValue}>{reportData.metrics.fuelEfficiency}</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricRowLabel}>Customer Satisfaction</Text>
                  <Text style={styles.metricRowValue}>{reportData.metrics.customerSatisfaction}/5.0</Text>
                </View>
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
  exportButton: {
    padding: spacing.xs,
  },
  periodContainer: {
    paddingLeft: spacing.lg,
    marginBottom: spacing.md,
  },
  periodButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    marginRight: spacing.sm,
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    color: colors.gray[600],
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: colors.white,
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
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
  },
  summaryCard: {
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
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  summaryContent: {
    flex: 1,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.dark,
  },
  summaryTitle: {
    fontSize: 12,
    color: colors.gray[600],
    marginTop: 2,
  },
  summarySubtitle: {
    fontSize: 10,
    color: colors.gray[500],
    marginTop: 1,
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
    alignItems: 'center',
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
    marginTop: spacing.sm,
  },
  metricTitle: {
    fontSize: 12,
    color: colors.gray[600],
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  statusSection: {
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
  statusBarContainer: {
    marginBottom: spacing.md,
  },
  statusBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusLabel: {
    fontSize: 14,
    color: colors.dark,
    fontWeight: '500',
  },
  statusCount: {
    fontSize: 14,
    color: colors.gray[600],
  },
  statusBarTrack: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  statusBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  driversSection: {
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
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  driverRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.white,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark,
  },
  driverJobs: {
    fontSize: 12,
    color: colors.gray[600],
    marginTop: 2,
  },
  driverStats: {
    flexDirection: 'row',
  },
  statItem: {
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.dark,
  },
  statLabel: {
    fontSize: 10,
    color: colors.gray[600],
    marginTop: 2,
  },
  chartContainer: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartPlaceholder: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  chartDescription: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
  },
  additionalMetrics: {
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
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  metricRowLabel: {
    fontSize: 14,
    color: colors.gray[600],
  },
  metricRowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark,
  },
});

export default DispatcherReportsScreen;
