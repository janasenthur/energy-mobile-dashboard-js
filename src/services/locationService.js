import Location from './webCompatibleLocation';
import { Alert } from 'react-native';
import { API_CONFIG } from '../config/config';
import { apiService } from './apiService';

class LocationService {
  constructor() {
    this.watchId = null;
    this.currentLocation = null;
    this.isTracking = false;
  }

  async requestPermissions() {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'This app needs location access to track your position and provide navigation.',
          [{ text: 'OK' }]
        );
        return false;
      }

      // For background tracking (drivers)
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      
      return { foreground: foregroundStatus === 'granted', background: backgroundStatus === 'granted' };
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  async getCurrentLocation() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission.foreground) return null;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      this.currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp,
      };

      return this.currentLocation;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  async startTracking(callback) {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission.foreground) return false;

      this.isTracking = true;
      
      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          this.currentLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: location.timestamp,
            speed: location.coords.speed,
            heading: location.coords.heading,
          };

          // Send location to backend
          this.updateLocationOnServer(this.currentLocation);

          // Call the callback with the new location
          if (callback) {
            callback(this.currentLocation);
          }
        }
      );

      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      this.isTracking = false;
      return false;
    }
  }

  stopTracking() {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }
    this.isTracking = false;
  }

  async updateLocationOnServer(location) {
    try {
      await apiService.post(API_CONFIG.ENDPOINTS.TRACKING.UPDATE_LOCATION, {
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: location.timestamp,
        speed: location.speed,
        heading: location.heading,
      });
    } catch (error) {
      console.error('Error updating location on server:', error);
    }
  }

  async getRoute(startLocation, endLocation, waypoints = []) {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.TRACKING.GET_ROUTE, {
        start: startLocation,
        end: endLocation,
        waypoints,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting route:', error);
      // Return mock route for development
      return {
        coordinates: [
          startLocation,
          endLocation,
        ],
        distance: 1000, // meters
        duration: 900, // seconds
        instructions: [
          'Head north on Main St',
          'Turn right on Oak Ave',
          'Continue for 0.5 miles',
          'Destination will be on your right',
        ],
      };
    }
  }

  async optimizeRoute(locations) {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.TRACKING.OPTIMIZE_ROUTE, {
        locations,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error optimizing route:', error);
      // Return original order for development
      return { optimizedOrder: locations };
    }
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  formatDistance(distanceInMeters) {
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)} m`;
    } else {
      return `${(distanceInMeters / 1000).toFixed(1)} km`;
    }
  }

  formatDuration(durationInSeconds) {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  async reverseGeocode(latitude, longitude) {
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      
      if (result.length > 0) {
        const address = result[0];
        return {
          street: address.street,
          city: address.city,
          region: address.region,
          postalCode: address.postalCode,
          country: address.country,
          formattedAddress: `${address.street}, ${address.city}, ${address.region} ${address.postalCode}`,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  async geocode(address) {
    try {
      const result = await Location.geocodeAsync(address);
      
      if (result.length > 0) {
        return {
          latitude: result[0].latitude,
          longitude: result[0].longitude,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error geocoding:', error);
      return null;
    }
  }
}

export const locationService = new LocationService();
