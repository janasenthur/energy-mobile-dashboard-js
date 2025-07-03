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

const AdminReportsScreen = () => {
  const navigation = useNavigation();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [reportData, setReportData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      // Mock comprehensive admin data
      const mockData = {
        financial: {
          totalRevenue: 892450.75,
          totalCosts: 624780.25,
          netProfit: 267670.50,
          profitMargin: 30.0,
          revenueGrowth: 15.3,
          avgJobValue: 285.60,
          fuelCosts: 145670.30,
          maintenanceCosts: 89540.20,
          payrollCosts: 389569.75,
        },
        operational: {
          totalJobs: 3125,
          completedJobs: 2943,
          cancelledJobs: 89,
          pendingJobs: 93,
          completionRate: 94.2,
          onTimeDeliveryRate: 96.7,
          avgJobDuration: 2.4,
          totalDistance: 125670,
          fuelEfficiency: 6.8,
          vehicleUtilization: 87.3,
        },
        workforce: {
          totalDrivers: 25,
          activeDrivers: 22,
          avgDriverRating: 4.7,
          totalJobsPerDriver: 125,
          driverRetentionRate: 94.0,
          trainingHours: 340,
          safetyIncidents: 2,
          avgDriverSalary: 62700,
          totalPayroll: 1568250,
        },
        customer: {
          totalCustomers: 156,
          activeCustomers: 89,
          newCustomers: 12,
          customerRetentionRate: 87.5,
          avgCustomerRating: 4.6,
          repeatCustomerRate: 72.3,
          customerComplaintRate: 1.8,
          avgResponseTime: 12,
        },
        fleet: {
          totalVehicles: 22,
          activeVehicles: 19,
          maintenanceScheduled: 8,
          maintenanceOverdue: 2,
          avgVehicleAge: 3.2,
          totalMiles: 125670,
          avgMPG: 6.8,
          maintenanceCostPerMile: 0.15,
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

  const exportReport = (reportType) => {
    Alert.alert(
      'Export Report',
      `Export ${reportType} report as PDF or Excel?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'PDF', onPress: () => console.log(`Exporting ${reportType} as PDF`) },
        { text: 'Excel', onPress: () => console.log(`Exporting ${reportType} as Excel`) },
      ]
    );
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

  const ReportCard = ({ title, onExport, children }) => (
    <View style={styles.reportCard}>
      <View style={styles.reportCardHeader}>
        <Text style={styles.reportCardTitle}>{title}</Text>
        <TouchableOpacity 
          style={styles.exportButton}
          onPress={() => onExport(title.toLowerCase().replace(' ', '_'))}
        >
          <Ionicons name="download-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
      {children}
    </View>
  );

  const MetricRow = ({ label, value, trend, isCurrency = false, isPercentage = false }) => {
    const formatValue = (val) => {
      if (isCurrency) return `$${val.toLocaleString()}`;
      if (isPercentage) return `${val}%`;
      return typeof val === 'number' ? val.toLocaleString() : val;
    };

    return (
      <View style={styles.metricRow}>
        <Text style={styles.metricLabel}>{label}</Text>
        <View style={styles.metricValueContainer}>
          <Text style={styles.metricValue}>{formatValue(value)}</Text>
          {trend !== undefined && (
            <View style={styles.trendContainer}>
              <Ionicons 
                name={trend > 0 ? 'trending-up' : trend < 0 ? 'trending-down' : 'remove'} 
                size={14} 
                color={trend > 0 ? colors.success : trend < 0 ? colors.error : colors.gray[500]} 
              />
              <Text style={[
                styles.trendText, 
                { color: trend > 0 ? colors.success : trend < 0 ? colors.error : colors.gray[500] }
              ]}>
                {Math.abs(trend)}%
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const SummaryCard = ({ title, value, icon, color, subtitle }) => (
    <View style={styles.summaryCard}>
      <View style={styles.summaryContent}>
        <View style={[styles.summaryIcon, { backgroundColor: color }]}>
          <Ionicons name={icon} size={20} color={colors.white} />
        </View>
        <View style={styles.summaryTextContainer}>
          <Text style={styles.summaryValue}>{value}</Text>
          <Text style={styles.summaryTitle}>{title}</Text>
          {subtitle && <Text style={styles.summarySubtitle}>{subtitle}</Text>}
        </View>
      </View>
    </View>
  );

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
        <Text style={styles.headerTitle}>Business Reports</Text>
        <TouchableOpacity 
          style={styles.headerExportButton}
          onPress={() => exportReport('comprehensive')}
        >
          <Ionicons name="document-text-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodContainer}>
        <PeriodButton title="This Week" value="week" isActive={selectedPeriod === 'week'} />
        <PeriodButton title="This Month" value="month" isActive={selectedPeriod === 'month'} />
        <PeriodButton title="This Quarter" value="quarter" isActive={selectedPeriod === 'quarter'} />
        <PeriodButton title="This Year" value="year" isActive={selectedPeriod === 'year'} />
      </ScrollView>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {reportData && (
          <>
            {/* Executive Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Executive Summary</Text>
              <View style={styles.summaryGrid}>
                <SummaryCard
                  title="Revenue"
                  value={`$${(reportData.financial.totalRevenue / 1000).toFixed(0)}K`}
                  icon="trending-up"
                  color={colors.success}
                  subtitle={`+${reportData.financial.revenueGrowth}% growth`}
                />
                <SummaryCard
                  title="Net Profit"
                  value={`$${(reportData.financial.netProfit / 1000).toFixed(0)}K`}
                  icon="wallet"
                  color={colors.primary}
                  subtitle={`${reportData.financial.profitMargin}% margin`}
                />
                <SummaryCard
                  title="Jobs Completed"
                  value={reportData.operational.completedJobs.toLocaleString()}
                  icon="checkmark-circle"
                  color={colors.info}
                  subtitle={`${reportData.operational.completionRate}% success rate`}
                />
                <SummaryCard
                  title="Customer Satisfaction"
                  value={`${reportData.customer.avgCustomerRating}/5.0`}
                  icon="star"
                  color={colors.warning}
                  subtitle={`${reportData.customer.customerRetentionRate}% retention`}
                />
              </View>
            </View>

            {/* Financial Performance */}
            <ReportCard title="Financial Performance" onExport={exportReport}>
              <MetricRow 
                label="Total Revenue" 
                value={reportData.financial.totalRevenue} 
                trend={reportData.financial.revenueGrowth}
                isCurrency 
              />
              <MetricRow 
                label="Total Costs" 
                value={reportData.financial.totalCosts} 
                isCurrency 
              />
              <MetricRow 
                label="Net Profit" 
                value={reportData.financial.netProfit} 
                isCurrency 
              />
              <MetricRow 
                label="Profit Margin" 
                value={reportData.financial.profitMargin} 
                isPercentage 
              />
              <MetricRow 
                label="Average Job Value" 
                value={reportData.financial.avgJobValue} 
                isCurrency 
              />
              <MetricRow 
                label="Fuel Costs" 
                value={reportData.financial.fuelCosts} 
                isCurrency 
              />
              <MetricRow 
                label="Maintenance Costs" 
                value={reportData.financial.maintenanceCosts} 
                isCurrency 
              />
              <MetricRow 
                label="Payroll Costs" 
                value={reportData.financial.payrollCosts} 
                isCurrency 
              />
            </ReportCard>

            {/* Operational Performance */}
            <ReportCard title="Operational Performance" onExport={exportReport}>
              <MetricRow 
                label="Total Jobs" 
                value={reportData.operational.totalJobs} 
              />
              <MetricRow 
                label="Jobs Completed" 
                value={reportData.operational.completedJobs} 
              />
              <MetricRow 
                label="Completion Rate" 
                value={reportData.operational.completionRate} 
                isPercentage 
              />
              <MetricRow 
                label="On-Time Delivery Rate" 
                value={reportData.operational.onTimeDeliveryRate} 
                isPercentage 
              />
              <MetricRow 
                label="Average Job Duration" 
                value={`${reportData.operational.avgJobDuration} hours`} 
              />
              <MetricRow 
                label="Total Distance Covered" 
                value={`${reportData.operational.totalDistance.toLocaleString()} miles`} 
              />
              <MetricRow 
                label="Fleet Fuel Efficiency" 
                value={`${reportData.operational.fuelEfficiency} MPG`} 
              />
              <MetricRow 
                label="Vehicle Utilization" 
                value={reportData.operational.vehicleUtilization} 
                isPercentage 
              />
            </ReportCard>

            {/* Workforce Analytics */}
            <ReportCard title="Workforce Analytics" onExport={exportReport}>
              <MetricRow 
                label="Total Drivers" 
                value={reportData.workforce.totalDrivers} 
              />
              <MetricRow 
                label="Active Drivers" 
                value={reportData.workforce.activeDrivers} 
              />
              <MetricRow 
                label="Average Driver Rating" 
                value={`${reportData.workforce.avgDriverRating}/5.0`} 
              />
              <MetricRow 
                label="Jobs per Driver" 
                value={reportData.workforce.totalJobsPerDriver} 
              />
              <MetricRow 
                label="Driver Retention Rate" 
                value={reportData.workforce.driverRetentionRate} 
                isPercentage 
              />
              <MetricRow 
                label="Training Hours" 
                value={reportData.workforce.trainingHours} 
              />
              <MetricRow 
                label="Safety Incidents" 
                value={reportData.workforce.safetyIncidents} 
              />
              <MetricRow 
                label="Average Driver Salary" 
                value={reportData.workforce.avgDriverSalary} 
                isCurrency 
              />
            </ReportCard>

            {/* Customer Analytics */}
            <ReportCard title="Customer Analytics" onExport={exportReport}>
              <MetricRow 
                label="Total Customers" 
                value={reportData.customer.totalCustomers} 
              />
              <MetricRow 
                label="Active Customers" 
                value={reportData.customer.activeCustomers} 
              />
              <MetricRow 
                label="New Customers" 
                value={reportData.customer.newCustomers} 
              />
              <MetricRow 
                label="Customer Retention Rate" 
                value={reportData.customer.customerRetentionRate} 
                isPercentage 
              />
              <MetricRow 
                label="Average Customer Rating" 
                value={`${reportData.customer.avgCustomerRating}/5.0`} 
              />
              <MetricRow 
                label="Repeat Customer Rate" 
                value={reportData.customer.repeatCustomerRate} 
                isPercentage 
              />
              <MetricRow 
                label="Complaint Rate" 
                value={reportData.customer.customerComplaintRate} 
                isPercentage 
              />
              <MetricRow 
                label="Avg Response Time" 
                value={`${reportData.customer.avgResponseTime} minutes`} 
              />
            </ReportCard>

            {/* Fleet Management */}
            <ReportCard title="Fleet Management" onExport={exportReport}>
              <MetricRow 
                label="Total Vehicles" 
                value={reportData.fleet.totalVehicles} 
              />
              <MetricRow 
                label="Active Vehicles" 
                value={reportData.fleet.activeVehicles} 
              />
              <MetricRow 
                label="Maintenance Scheduled" 
                value={reportData.fleet.maintenanceScheduled} 
              />
              <MetricRow 
                label="Maintenance Overdue" 
                value={reportData.fleet.maintenanceOverdue} 
              />
              <MetricRow 
                label="Average Vehicle Age" 
                value={`${reportData.fleet.avgVehicleAge} years`} 
              />
              <MetricRow 
                label="Total Miles Driven" 
                value={reportData.fleet.totalMiles.toLocaleString()} 
              />
              <MetricRow 
                label="Average MPG" 
                value={reportData.fleet.avgMPG} 
              />
              <MetricRow 
                label="Maintenance Cost per Mile" 
                value={reportData.fleet.maintenanceCostPerMile} 
                isCurrency 
              />
            </ReportCard>

            {/* Charts Placeholder */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Visual Analytics</Text>
              <View style={styles.chartContainer}>
                <Text style={styles.chartPlaceholder}>📊 Interactive Charts</Text>
                <Text style={styles.chartDescription}>
                  Revenue trends, job completion rates, driver performance, 
                  and fleet utilization charts would be displayed here
                </Text>
                <TouchableOpacity 
                  style={styles.chartButton}
                  onPress={() => Alert.alert('Charts', 'Interactive dashboard with charts coming soon')}
                >
                  <Text style={styles.chartButtonText}>View Interactive Dashboard</Text>
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
  headerExportButton: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.dark,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
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
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryValue: {
    fontSize: 18,
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
  reportCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 12,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  reportCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark,
  },
  exportButton: {
    padding: spacing.xs,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  metricLabel: {
    fontSize: 14,
    color: colors.gray[600],
    flex: 1,
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark,
    marginRight: spacing.sm,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 2,
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
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  chartButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  chartButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AdminReportsScreen;
