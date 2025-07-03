import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme/theme';
import DriverAvatarComponent from '../../../assets/driver-avatar.png.js';
import Truck1Component from '../../../assets/truck1.png.js';

const CustomerBookingsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('In-transit');
  const [bookings, setBookings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const tabs = ['In-transit', 'Completed', 'Cancelled'];

  useEffect(() => {
    loadBookings();
  }, [activeTab]);

  const loadBookings = async () => {
    try {
      // This would be replaced with actual API call
      const mockBookings = [
        {
          id: 1,
          truckName: 'Freightliner eCascadia',
          truckNumber: 'AXN 8675',
          carrier: 'UPS',
          status: 'On route',
          route: {
            from: 'Texas',
            to: 'Illinois',
            fromDate: '31.05.2025',
            toDate: '01.06.2025',
            duration: '8hrs',
          },
          customer: 'John',
          pickupLocation: '456 Oak Ave SW, Strasburg, OH 44680, USA',
          dropLocation: '500 N Lake Shore Dr, Chicago, IL 60611, United States',
          miles: '928 Miles',
          pricing: {
            hourlyRate: '$1500/hr x 8',
            total: '$12000',
            tolls: '$3000',
            discount: '$1000',
            finalTotal: '$14000',
          },
          driver: {
            name: 'Abhram',
            avatar: 'driver-avatar-component',
          },
          tracking: [
            {
              id: 1,
              status: 'Booking placed',
              timestamp: '31.05.2025 at 5:40 PM',
              completed: true,
            },
            {
              id: 2,
              status: 'Booking accepted',
              timestamp: '31.05.2025 at 8:40 PM',
              completed: true,
            },
            {
              id: 3,
              status: 'Booking inprogress',
              timestamp: '31.05.2025 at 9:40 PM',
              completed: true,
              subSteps: [
                {
                  id: 1,
                  status: 'Reached pickup point',
                  location: '456 Oak Ave SW, Strasburg, OH 44680, USA',
                  timestamp: '31.05.2025 at 10:00 PM',
                  completed: true,
                },
                {
                  id: 2,
                  status: 'Loading inprogress',
                  timestamp: '31.05.2025 at 10:30 PM',
                  completed: true,
                },
                {
                  id: 3,
                  status: 'Truck started',
                  note: 'loading completed',
                  timestamp: '31.05.2025 at 10:30 PM',
                  completed: true,
                },
                {
                  id: 4,
                  status: 'Reached destination',
                  location: '500 N Lake Shore Dr, Chicago, IL 60611, United States',
                  timestamp: '01.06.2025 at 10:30 PM',
                  completed: false,
                },
              ],
            },
            {
              id: 4,
              status: 'Booking completed',
              timestamp: '01.06.2025 at 11:45 PM',
              completed: false,
            },
          ],
        },
      ];
      
      setBookings(mockBookings);
      if (mockBookings.length > 0) {
        setSelectedBooking(mockBookings[0]);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const renderBookingCard = (booking) => (
    <View key={booking.id} style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.bookingInfo}>
          <View style={styles.truckImage}>
            <Truck1Component width={60} height={40} />
          </View>
          <View style={styles.truckDetails}>
            <Text style={styles.truckName}>{booking.truckName}</Text>
            <Text style={styles.truckNumber}>Truck No. {booking.truckNumber}</Text>
            <Text style={styles.carrier}>Carrier: {booking.carrier}</Text>
          </View>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{booking.status}</Text>
        </View>
      </View>

      <View style={styles.routeInfo}>
        <View style={styles.routeHeader}>
          <Text style={styles.routeFrom}>{booking.route.from}</Text>
          <View style={styles.routeProgress}>
            <View style={styles.progressLine} />
            <Ionicons name="truck" size={16} color={colors.dark} />
            <View style={styles.progressLine} />
          </View>
          <Text style={styles.routeTo}>{booking.route.to}</Text>
        </View>
        <View style={styles.routeDates}>
          <Text style={styles.routeDate}>{booking.route.fromDate}</Text>
          <Text style={styles.routeDuration}>Duration {booking.route.duration}</Text>
          <Text style={styles.routeDate}>{booking.route.toDate}</Text>
        </View>
      </View>

      <View style={styles.bookingTabs}>
        <TouchableOpacity
          style={[styles.tab, styles.activeTab]}
          onPress={() => setSelectedBooking(booking)}
        >
          <Text style={[styles.tabText, styles.activeTabText]}>Load info</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Tracking</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Payment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mapViewButton}>
          <Text style={styles.mapViewText}>Map view</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBookingDetails = () => {
    if (!selectedBooking) return null;

    return (
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Pickup date:</Text>
          <Text style={styles.detailValue}>May 30, 2025</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Delivery date:</Text>
          <Text style={styles.detailValue}>May 30, 2025</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Pickup Location:</Text>
          <Text style={styles.detailValue}>{selectedBooking.pickupLocation}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Drop Location:</Text>
          <Text style={styles.detailValue}>{selectedBooking.dropLocation}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Customer:</Text>
          <Text style={styles.detailValue}>{selectedBooking.customer}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Carrier:</Text>
          <Text style={styles.detailValue}>{selectedBooking.carrier}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Truck Name:</Text>
          <Text style={styles.detailValue}>{selectedBooking.truckName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Truck No:</Text>
          <Text style={styles.detailValue}>{selectedBooking.truckNumber}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Miles:</Text>
          <Text style={styles.detailValue}>{selectedBooking.miles}</Text>
        </View>
      </View>
    );
  };

  const renderTrackingDetails = () => {
    if (!selectedBooking) return null;

    return (
      <View style={styles.trackingContainer}>
        {selectedBooking.tracking.map((step, index) => (
          <View key={step.id} style={styles.trackingStep}>
            <View style={styles.timelineContainer}>
              <View style={[
                styles.timelineDot,
                step.completed && styles.completedDot
              ]} />
              {index < selectedBooking.tracking.length - 1 && (
                <View style={[
                  styles.timelineLine,
                  step.completed && styles.completedLine
                ]} />
              )}
            </View>
            <View style={styles.stepContent}>
              <View style={styles.stepHeader}>
                <Text style={[
                  styles.stepTitle,
                  step.completed && styles.completedStep
                ]}>
                  {step.status}
                </Text>
                {step.status === 'Booking accepted' && selectedBooking.driver && (
                  <View style={styles.driverInfo}>
                    <View style={styles.driverAvatar}>
                      <DriverAvatarComponent width={40} height={40} />
                    </View>
                    <View>
                      <Text style={styles.driverName}>{selectedBooking.driver.name}</Text>
                      <Text style={styles.driverRole}>Driver</Text>
                    </View>
                    <View style={styles.driverActions}>
                      <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="chatbubble-ellipses" size={20} color={colors.dark} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="call" size={20} color={colors.dark} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
              <Text style={styles.stepTimestamp}>{step.timestamp}</Text>
              
              {step.subSteps && (
                <View style={styles.subStepsContainer}>
                  {step.subSteps.map((subStep, subIndex) => (
                    <View key={subStep.id} style={styles.subStep}>
                      <View style={[
                        styles.subStepDot,
                        subStep.completed && styles.completedSubStepDot
                      ]} />
                      <View style={styles.subStepContent}>
                        <Text style={[
                          styles.subStepTitle,
                          subStep.completed && styles.completedSubStep
                        ]}>
                          {subStep.status}
                        </Text>
                        {subStep.location && (
                          <Text style={styles.subStepLocation}>{subStep.location}</Text>
                        )}
                        {subStep.note && (
                          <Text style={styles.subStepNote}>{subStep.note}</Text>
                        )}
                        <Text style={styles.subStepTimestamp}>{subStep.timestamp}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderPaymentDetails = () => {
    if (!selectedBooking) return null;

    return (
      <View style={styles.paymentContainer}>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>{selectedBooking.pricing.hourlyRate}</Text>
          <Text style={styles.paymentValue}>{selectedBooking.pricing.total}</Text>
        </View>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Tolls</Text>
          <Text style={styles.paymentValue}>{selectedBooking.pricing.tolls}</Text>
        </View>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Discount</Text>
          <Text style={styles.paymentValue}>{selectedBooking.pricing.discount}</Text>
        </View>
        <View style={styles.paymentTotalRow}>
          <Text style={styles.paymentTotalLabel}>Total</Text>
          <Text style={styles.paymentTotalValue}>{selectedBooking.pricing.finalTotal}</Text>
          <TouchableOpacity style={styles.payNowButton}>
            <Text style={styles.payNowText}>Pay now</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.downloadInvoiceButton}>
          <Text style={styles.downloadInvoiceText}>Click here to download your invoice</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookings</Text>
      </View>

      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === tab && styles.activeTabButtonText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {bookings.map(renderBookingCard)}
        
        {activeTab === 'In-transit' && selectedBooking && (
          <View style={styles.detailsSection}>
            <View style={styles.detailTabs}>
              <TouchableOpacity style={[styles.detailTab, styles.activeDetailTab]}>
                <Text style={[styles.detailTabText, styles.activeDetailTabText]}>
                  Load info
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.detailTab}>
                <Text style={styles.detailTabText}>Tracking</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.detailTab}>
                <Text style={styles.detailTabText}>Payment</Text>
              </TouchableOpacity>
            </View>
            
            {renderBookingDetails()}
            {/* Uncomment based on active detail tab */}
            {/* {renderTrackingDetails()} */}
            {/* {renderPaymentDetails()} */}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.dark,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  tabButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  activeTabButton: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 16,
    color: colors.gray[600],
  },
  activeTabButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  bookingCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  bookingInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  truckImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
  },
  truckDetails: {
    flex: 1,
  },
  truckName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: spacing.xs,
  },
  truckNumber: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  carrier: {
    fontSize: 14,
    color: colors.gray[600],
  },
  statusBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
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
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
  },
  routeTo: {
    fontSize: 18,
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
    fontSize: 14,
    color: colors.gray[600],
  },
  routeDuration: {
    fontSize: 14,
    color: colors.gray[600],
  },
  bookingTabs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.md,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  mapViewButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginLeft: 'auto',
  },
  mapViewText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  detailsSection: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  detailTabs: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  detailTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.md,
  },
  activeDetailTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  detailTabText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  activeDetailTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  detailsContainer: {
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  detailLabel: {
    fontSize: 14,
    color: colors.gray[600],
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: colors.dark,
    flex: 2,
    textAlign: 'right',
  },
  // Tracking styles
  trackingContainer: {
    paddingVertical: spacing.md,
  },
  trackingStep: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  timelineContainer: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.gray[300],
  },
  completedDot: {
    backgroundColor: colors.primary,
  },
  timelineLine: {
    width: 2,
    height: 40,
    backgroundColor: colors.gray[300],
    marginTop: spacing.xs,
  },
  completedLine: {
    backgroundColor: colors.primary,
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    marginBottom: spacing.xs,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[600],
  },
  completedStep: {
    color: colors.dark,
  },
  stepTimestamp: {
    fontSize: 12,
    color: colors.gray[500],
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
  },
  driverAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: spacing.sm,
  },
  driverName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark,
  },
  driverRole: {
    fontSize: 12,
    color: colors.gray[600],
  },
  driverActions: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  actionButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  // Payment styles
  paymentContainer: {
    paddingVertical: spacing.md,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  paymentLabel: {
    fontSize: 14,
    color: colors.gray[600],
  },
  paymentValue: {
    fontSize: 14,
    color: colors.dark,
    fontWeight: '600',
  },
  paymentTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    marginTop: spacing.sm,
  },
  paymentTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark,
  },
  paymentTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  payNowButton: {
    backgroundColor: colors.info,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  payNowText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  downloadInvoiceButton: {
    marginTop: spacing.md,
  },
  downloadInvoiceText: {
    color: colors.primary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  subStepsContainer: {
    marginTop: spacing.md,
    marginLeft: spacing.md,
  },
  subStep: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  subStepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[300],
    marginRight: spacing.sm,
    marginTop: spacing.xs,
  },
  completedSubStepDot: {
    backgroundColor: colors.primary,
  },
  subStepContent: {
    flex: 1,
  },
  subStepTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[600],
  },
  completedSubStep: {
    color: colors.dark,
  },
  subStepLocation: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
  subStepNote: {
    fontSize: 12,
    color: colors.gray[500],
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  subStepTimestamp: {
    fontSize: 11,
    color: colors.gray[400],
    marginTop: spacing.xs,
  },
});

export default CustomerBookingsScreen;
