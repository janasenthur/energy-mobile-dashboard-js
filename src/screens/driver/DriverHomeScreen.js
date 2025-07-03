import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useLocation } from '../../context/LocationContext';
import { colors, spacing, borderRadius } from '../../theme/theme';
import CustomerAvatarComponent from '../../../assets/customer-avatar.png.js';
import AnnouncementDriverComponent from '../../../assets/announcement-driver.png.js';
import DriverAvatarComponent from '../../../assets/driver-avatar.png.js';

const DriverHomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const { currentLocation, startTracking, stopTracking } = useLocation();
  const [refreshing, setRefreshing] = useState(false);
  const [todayOverview, setTodayOverview] = useState(null);
  const [workDetails, setWorkDetails] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [isPunchedIn, setIsPunchedIn] = useState(false);

  useEffect(() => {
    loadDriverData();
  }, []);

  const loadDriverData = async () => {
    try {
      // This would be replaced with actual API calls
      setTodayOverview({
        date: 'June 01, 2025 - Monday',
        punchIn: '10:00 AM',
        punchOut: '07:00 PM',
        totalHours: '9 hrs',
      });

      setWorkDetails([
        {
          id: 1,
          jobNumber: '#3245687',
          status: 'Start trip',
          route: {
            from: 'Texas',
            to: 'Illinois',
            fromDate: '31.05.2025',
            toDate: '01.06.2025',
            duration: '8hrs',
          },
          customer: {
            name: 'John Abraham',
            avatar: 'customer-avatar-component',
          },
        },
      ]);

      setAnnouncements([
        {
          id: 1,
          title: 'Thank You 10000 Followers',
          image: 'announcement-driver-component',
        },
      ]);
    } catch (error) {
      console.error('Error loading driver data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDriverData();
    setRefreshing(false);
  };

  const handlePunchIn = () => {
    setIsPunchedIn(true);
    startTracking();
    // API call to record punch in
  };

  const handlePunchOut = () => {
    setIsPunchedIn(false);
    stopTracking();
    // API call to record punch out
  };

  const handleStartTrip = (jobId) => {
    navigation.navigate('DriverTracking', { jobId });
  };

  const handleContactCustomer = (contactType, customer) => {
    if (contactType === 'call') {
      // Handle phone call
      console.log('Calling customer:', customer.name);
    } else if (contactType === 'message') {
      // Handle messaging
      console.log('Messaging customer:', customer.name);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <DriverAvatarComponent width={50} height={50} />
              </View>
              <Text style={styles.welcomeText}>Welcome, {user?.name || 'John'}</Text>
            </View>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color={colors.white} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.headerTitle}>Today's Overview</Text>

          {/* Today's Overview Card */}
          {todayOverview && (
            <View style={styles.overviewCard}>
              <View style={styles.overviewHeader}>
                <View style={styles.timeInfo}>
                  <Text style={styles.timeText}>10:00 AM</Text>
                  <Text style={styles.dateText}>{todayOverview.date}</Text>
                </View>
                <View style={styles.hoursInfo}>
                  <Ionicons name="time-outline" size={20} color={colors.primary} />
                  <View style={styles.hoursText}>
                    <Text style={styles.hoursLabel}>Total hours</Text>
                    <Text style={styles.hoursValue}>{todayOverview.totalHours}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.punchContainer}>
                <TouchableOpacity
                  style={styles.punchButton}
                  onPress={isPunchedIn ? handlePunchOut : handlePunchIn}
                >
                  <Ionicons
                    name={isPunchedIn ? "log-out-outline" : "log-in-outline"}
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={styles.punchText}>
                    {isPunchedIn ? 'Punch out' : 'Punch in'}
                  </Text>
                  <Text style={styles.punchTime}>
                    {isPunchedIn ? todayOverview.punchOut : todayOverview.punchIn}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.punchButton}
                  onPress={isPunchedIn ? handlePunchIn : handlePunchOut}
                >
                  <Ionicons
                    name={isPunchedIn ? "log-in-outline" : "log-out-outline"}
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={styles.punchText}>
                    {isPunchedIn ? 'Punch in' : 'Punch out'}
                  </Text>
                  <Text style={styles.punchTime}>
                    {isPunchedIn ? todayOverview.punchIn : todayOverview.punchOut}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </LinearGradient>

        {/* Work Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Work Details</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Jobs')}>
              <Text style={styles.viewAllText}>view all</Text>
            </TouchableOpacity>
          </View>

          {workDetails.map((job) => (
            <View key={job.id} style={styles.jobCard}>
              <View style={styles.jobHeader}>
                <View style={styles.jobInfo}>
                  <Ionicons name="briefcase-outline" size={20} color={colors.dark} />
                  <Text style={styles.jobNumber}>{job.jobNumber}</Text>
                </View>
                <TouchableOpacity
                  style={styles.startTripButton}
                  onPress={() => handleStartTrip(job.id)}
                >
                  <Text style={styles.startTripText}>{job.status}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.routeInfo}>
                <View style={styles.routeHeader}>
                  <Text style={styles.routeFrom}>{job.route.from}</Text>
                  <View style={styles.routeProgress}>
                    <View style={styles.progressLine} />
                    <Ionicons name="truck" size={16} color={colors.dark} />
                    <View style={styles.progressLine} />
                  </View>
                  <Text style={styles.routeTo}>{job.route.to}</Text>
                </View>
                <View style={styles.routeDates}>
                  <Text style={styles.routeDate}>{job.route.fromDate}</Text>
                  <Text style={styles.routeDuration}>Duration {job.route.duration}</Text>
                  <Text style={styles.routeDate}>{job.route.toDate}</Text>
                </View>
              </View>

              <View style={styles.customerInfo}>
                <View style={styles.customerAvatar}>
                  <CustomerAvatarComponent width={40} height={40} />
                </View>
                <View style={styles.customerDetails}>
                  <Text style={styles.customerName}>{job.customer.name}</Text>
                  <Text style={styles.customerRole}>Customer</Text>
                </View>
                <View style={styles.customerActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleContactCustomer('message', job.customer)}
                  >
                    <Ionicons name="chatbubble-ellipses" size={20} color={colors.dark} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleContactCustomer('call', job.customer)}
                  >
                    <Ionicons name="call" size={20} color={colors.dark} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Announcements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📢 Announcements</Text>
          </View>
          
          {announcements.map((announcement) => (
            <TouchableOpacity key={announcement.id} style={styles.announcementCard}>
              <View style={styles.announcementImage}>
                <AnnouncementDriverComponent width="100%" height="100%" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
  notificationButton: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.lg,
  },
  overviewCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: -spacing.sm,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  timeInfo: {
    flex: 1,
  },
  timeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: spacing.xs,
  },
  dateText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  hoursInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hoursText: {
    marginLeft: spacing.sm,
    alignItems: 'flex-end',
  },
  hoursLabel: {
    fontSize: 12,
    color: colors.gray[600],
  },
  hoursValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
  },
  punchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  punchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.xs,
  },
  punchText: {
    fontSize: 14,
    color: colors.dark,
    fontWeight: '500',
  },
  punchTime: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  section: {
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.dark,
  },
  viewAllText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  jobCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  jobInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark,
    marginLeft: spacing.sm,
  },
  startTripButton: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  startTripText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  routeInfo: {
    marginBottom: spacing.lg,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  routeFrom: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark,
  },
  routeTo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark,
  },
  routeProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: spacing.md,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.gray[300],
    marginHorizontal: spacing.sm,
  },
  routeDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeDate: {
    fontSize: 12,
    color: colors.gray[600],
  },
  routeDuration: {
    fontSize: 12,
    color: colors.gray[600],
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  customerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: spacing.sm,
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark,
  },
  customerRole: {
    fontSize: 12,
    color: colors.gray[600],
  },
  customerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  announcementCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  announcementImage: {
    width: '100%',
    height: 150,
  },
});

export default DriverHomeScreen;
