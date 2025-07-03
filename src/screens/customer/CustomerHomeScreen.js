import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  FlatList,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { apiService } from '../../services/apiService';
import { colors, spacing, borderRadius } from '../../theme/theme';
import Truck1Component from '../../../assets/truck1.png.js';
import Truck2Component from '../../../assets/truck2.png.js';
import Truck3Component from '../../../assets/truck3.png.js';
import Announcement1Component from '../../../assets/announcement1.png.js';
import DefaultAvatarComponent from '../../../assets/default-avatar.png.js';

const CustomerHomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const [popularTrucks, setPopularTrucks] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load popular trucks, recent bookings, and announcements
      // This would be replaced with actual API calls
      setPopularTrucks([
        {
          id: 1,
          name: 'Freightliner',
          specs: '7L x 4.8W x 4.8H',
          price: '$1599',
          image: Truck1Component,
        },
        {
          id: 2,
          name: 'Western Star 49',
          specs: 'L x 4.8W x 4.8H',
          price: '$2099',
          image: Truck2Component,
        },
        {
          id: 3,
          name: 'Peterbilt 589',
          specs: '7L x 4.8W x 4.8H',
          price: '$1799',
          image: Truck3Component,
        },
      ]);

      setAnnouncements([
        {
          id: 1,
          title: '10% Cashback for new users',
          image: Announcement1Component,
        },
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleBookNow = () => {
    navigation.navigate('Booking');
  };

  const renderTruckItem = ({ item }) => (
    <TouchableOpacity style={styles.truckCard}>
      <View style={styles.truckImageContainer}>
        <item.image width={120} height={80} />
      </View>
      <View style={styles.truckInfo}>
        <Text style={styles.truckName}>{item.name}</Text>
        <Text style={styles.truckSpecs}>{item.specs}</Text>
        <Text style={styles.truckPrice}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

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
              <DefaultAvatarComponent width={50} height={50} />
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

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Need Truck Service? Book Now</Text>
            <Text style={styles.headerSubtitle}>Fast, Reliable, Hassle-Free!</Text>
          </View>

          {/* Booking Form */}
          <View style={styles.bookingForm}>
            <TouchableOpacity style={styles.locationInput}>
              <Ionicons name="location-outline" size={20} color={colors.gray[500]} />
              <Text style={styles.locationPlaceholder}>Add your pickup location</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.locationInput}>
              <Ionicons name="location-outline" size={20} color={colors.gray[500]} />
              <Text style={styles.locationPlaceholder}>Locate your drop location</Text>
              <Ionicons name="add" size={24} color={colors.primary} />
            </TouchableOpacity>

            <View style={styles.dateTimeContainer}>
              <TouchableOpacity style={styles.dateTimeInput}>
                <Text style={styles.dateTimeText}>June 12, 2025</Text>
                <Text style={styles.dateTimeText}>01:30 PM</Text>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
                <Text style={styles.bookButtonText}>Book Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Announcements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Announcements</Text>
          {announcements.map((announcement) => (
            <TouchableOpacity key={announcement.id} style={styles.announcementCard}>
              <Image
                source={announcement.image}
                style={styles.announcementImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Popular Trucks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Truck</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>view all</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={popularTrucks}
            renderItem={renderTruckItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trucksContainer}
          />
        </View>
      </ScrollView>

      {/* Bottom Navigation would be handled by the Tab Navigator */}
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
  headerContent: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
  },
  bookingForm: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: -spacing.sm,
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  locationPlaceholder: {
    flex: 1,
    marginLeft: spacing.sm,
    color: colors.gray[600],
    fontSize: 16,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dateTimeInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  dateTimeText: {
    color: colors.dark,
    fontSize: 14,
  },
  bookButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookButtonText: {
    color: colors.white,
    fontSize: 16,
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
  announcementCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  announcementImage: {
    width: '100%',
    height: 150,
  },
  trucksContainer: {
    paddingHorizontal: spacing.sm,
  },
  truckCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginRight: spacing.md,
    width: 160,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  truckImage: {
    width: '100%',
    height: 100,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  truckInfo: {
    alignItems: 'flex-start',
  },
  truckName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: spacing.xs,
  },
  truckSpecs: {
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  truckPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
});

export default CustomerHomeScreen;
