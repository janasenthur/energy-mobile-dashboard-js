import React, { createContext, useContext, useReducer, useEffect } from 'react';
import Location from '../services/webCompatibleLocation';
import { API_CONFIG } from '../config/config';
import { apiService } from '../services/apiService';

const LocationContext = createContext();

const initialState = {
  currentLocation: null,
  locationPermission: null,
  tracking: false,
  route: [],
  optimizedRoute: null,
  error: null,
};

const locationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOCATION':
      return { ...state, currentLocation: action.payload };
    case 'SET_PERMISSION':
      return { ...state, locationPermission: action.payload };
    case 'SET_TRACKING':
      return { ...state, tracking: action.payload };
    case 'ADD_TO_ROUTE':
      return { ...state, route: [...state.route, action.payload] };
    case 'SET_OPTIMIZED_ROUTE':
      return { ...state, optimizedRoute: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ROUTE':
      return { ...state, route: [], optimizedRoute: null };
    default:
      return state;
  }
};

export const LocationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(locationReducer, initialState);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      dispatch({ type: 'SET_PERMISSION', payload: status });
      
      if (status === 'granted') {
        getCurrentLocation();
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to get location permission' });
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.LocationAccuracy ? Location.LocationAccuracy.High : 1,
      });
      
      const currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp,
      };
      
      dispatch({ type: 'SET_LOCATION', payload: currentLocation });
      return currentLocation;
    } catch (error) {
      console.error('Error getting current location:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to get current location' });
      return null;
    }
  };

  const startTracking = async () => {
    if (state.locationPermission !== 'granted') {
      await requestLocationPermission();
      return;
    }

    try {
      dispatch({ type: 'SET_TRACKING', payload: true });
      
      const locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.LocationAccuracy ? Location.LocationAccuracy.High : 1,
          timeInterval: 10000, // 10 seconds
          distanceInterval: 50, // 50 meters
        },
        (location) => {
          const newLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: location.timestamp,
          };
          
          dispatch({ type: 'SET_LOCATION', payload: newLocation });
          dispatch({ type: 'ADD_TO_ROUTE', payload: newLocation });
          
          // Send location to backend
          updateLocationOnServer(newLocation);
        }
      );

      return locationSubscription;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to start tracking' });
    }
  };

  const stopTracking = (subscription) => {
    if (subscription) {
      subscription.remove();
    }
    dispatch({ type: 'SET_TRACKING', payload: false });
  };

  const updateLocationOnServer = async (location) => {
    try {
      await apiService.post(API_CONFIG.ENDPOINTS.TRACKING.UPDATE_LOCATION, {
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: location.timestamp,
      });
    } catch (error) {
      console.error('Error updating location on server:', error);
    }
  };

  const optimizeRoute = async (destinations) => {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.TRACKING.OPTIMIZE_ROUTE, {
        start: state.currentLocation,
        destinations,
      });
      
      const optimizedRoute = response.data;
      dispatch({ type: 'SET_OPTIMIZED_ROUTE', payload: optimizedRoute });
      return optimizedRoute;
    } catch (error) {
      console.error('Error optimizing route:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to optimize route' });
      return null;
    }
  };

  const clearRoute = () => {
    dispatch({ type: 'CLEAR_ROUTE' });
  };

  const value = {
    ...state,
    requestLocationPermission,
    getCurrentLocation,
    startTracking,
    stopTracking,
    optimizeRoute,
    clearRoute,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
