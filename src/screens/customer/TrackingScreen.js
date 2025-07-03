import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { MapView, Marker, Polyline } from '../../components/WebCompatibleMap';
import { Ionicons } from '@expo/vector-icons';
import { useLocation } from '../../context/LocationContext';
import { colors, spacing, borderRadius } from '../../theme/theme';

const { width, height } = Dimensions.get('window');

const TrackingScreen = ({ navigation }) => {
  const { currentLocation, tracking } = useLocation();
  const [region, setRegion] = useState({
    latitude: 39.8283,
    longitude: -98.5795,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    if (currentLocation) {
      setRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, [currentLocation]);

  const mockRoute = [
    { latitude: 39.8283, longitude: -98.5795 },
    { latitude: 40.7128, longitude: -74.0060 },
    { latitude: 41.8781, longitude: -87.6298 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live Tracking</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, tracking && styles.activeStatus]} />
          <Text style={styles.statusText}>
            {tracking ? 'Live Tracking' : 'Tracking Disabled'}
          </Text>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={region}
          showsUserLocation={true}
          showsMyLocationButton={true}
          followsUserLocation={tracking}
        >
          {currentLocation && (
            <Marker
              coordinate={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }}
              title="Current Location"
              description="You are here"
            >
              <View style={styles.markerContainer}>
                <Ionicons name="location" size={24} color={colors.primary} />
              </View>
            </Marker>
          )}

          <Polyline
            coordinates={mockRoute}
            strokeColor={colors.primary}
            strokeWidth={3}
            lineDashPattern={[5, 5]}
          />
        </MapView>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Delivery Status</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Driver:</Text>
          <Text style={styles.infoValue}>John Doe</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Vehicle:</Text>
          <Text style={styles.infoValue}>Freightliner eCascadia</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>ETA:</Text>
          <Text style={styles.infoValue}>2 hours 30 minutes</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Distance Remaining:</Text>
          <Text style={styles.infoValue}>145 miles</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.dark,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[400],
    marginRight: spacing.xs,
  },
  activeStatus: {
    backgroundColor: colors.success,
  },
  statusText: {
    fontSize: 12,
    color: colors.gray[600],
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: width,
    height: '100%',
  },
  markerContainer: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.xs,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  infoContainer: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  infoLabel: {
    fontSize: 14,
    color: colors.gray[600],
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.dark,
  },
});

export default TrackingScreen;
