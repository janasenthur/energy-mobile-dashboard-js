import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';

// Customer Screens
import CustomerHomeScreen from '../screens/customer/CustomerHomeScreen';
import BookingScreen from '../screens/customer/BookingScreen';
import TrackingScreen from '../screens/customer/TrackingScreen';
import CustomerBookingsScreen from '../screens/customer/CustomerBookingsScreen';
import CustomerProfileScreen from '../screens/customer/CustomerProfileScreen';
import CustomerChatScreen from '../screens/customer/CustomerChatScreen';

// Driver Screens
import DriverHomeScreen from '../screens/driver/DriverHomeScreen';
import DriverJobsScreen from '../screens/driver/DriverJobsScreen';
import DriverTrackingScreen from '../screens/driver/DriverTrackingScreen';
import DriverReportsScreen from '../screens/driver/DriverReportsScreen';
import DriverProfileScreen from '../screens/driver/DriverProfileScreen';
import DriverRegistrationScreen from '../screens/driver/DriverRegistrationScreen';

// Dispatcher Screens
import DispatcherHomeScreen from '../screens/dispatcher/DispatcherHomeScreen';
import JobQueueScreen from '../screens/dispatcher/JobQueueScreen';
import DriverManagementScreen from '../screens/dispatcher/DriverManagementScreen';
import DispatcherReportsScreen from '../screens/dispatcher/DispatcherReportsScreen';

// Admin Screens
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import AdminJobsScreen from '../screens/admin/AdminJobsScreen';
import AdminDriversScreen from '../screens/admin/AdminDriversScreen';
import AdminReportsScreen from '../screens/admin/AdminReportsScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';

// Shared Screens
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import SettingsScreen from '../screens/shared/SettingsScreen';
import HelpScreen from '../screens/shared/HelpScreen';

import { colors } from '../theme/theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Auth Stack
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="DriverRegistration" component={DriverRegistrationScreen} />
  </Stack.Navigator>
);

// Customer Tab Navigator
const CustomerTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        
        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Bookings') {
          iconName = focused ? 'calendar' : 'calendar-outline';
        } else if (route.name === 'Tracking') {
          iconName = focused ? 'location' : 'location-outline';
        } else if (route.name === 'Messages') {
          iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }
        
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.gray[600],
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home" component={CustomerHomeScreen} />
    <Tab.Screen name="Bookings" component={CustomerBookingsScreen} />
    <Tab.Screen name="Tracking" component={TrackingScreen} />
    <Tab.Screen name="Messages" component={CustomerChatScreen} />
    <Tab.Screen name="Profile" component={CustomerProfileScreen} />
  </Tab.Navigator>
);

// Driver Tab Navigator
const DriverTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        
        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Jobs') {
          iconName = focused ? 'list' : 'list-outline';
        } else if (route.name === 'Tracking') {
          iconName = focused ? 'navigate' : 'navigate-outline';
        } else if (route.name === 'Reports') {
          iconName = focused ? 'document-text' : 'document-text-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }
        
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.gray[600],
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home" component={DriverHomeScreen} />
    <Tab.Screen name="Jobs" component={DriverJobsScreen} />
    <Tab.Screen name="Tracking" component={DriverTrackingScreen} />
    <Tab.Screen name="Reports" component={DriverReportsScreen} />
    <Tab.Screen name="Profile" component={DriverProfileScreen} />
  </Tab.Navigator>
);

// Dispatcher Tab Navigator
const DispatcherTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        
        if (route.name === 'Dashboard') {
          iconName = focused ? 'grid' : 'grid-outline';
        } else if (route.name === 'JobQueue') {
          iconName = focused ? 'list-circle' : 'list-circle-outline';
        } else if (route.name === 'Drivers') {
          iconName = focused ? 'people' : 'people-outline';
        } else if (route.name === 'Reports') {
          iconName = focused ? 'analytics' : 'analytics-outline';
        }
        
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.gray[600],
      headerShown: false,
    })}
  >
    <Tab.Screen name="Dashboard" component={DispatcherHomeScreen} />
    <Tab.Screen name="JobQueue" component={JobQueueScreen} />
    <Tab.Screen name="Drivers" component={DriverManagementScreen} />
    <Tab.Screen name="Reports" component={DispatcherReportsScreen} />
  </Tab.Navigator>
);

// Admin Tab Navigator
const AdminTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        
        if (route.name === 'Dashboard') {
          iconName = focused ? 'speedometer' : 'speedometer-outline';
        } else if (route.name === 'Jobs') {
          iconName = focused ? 'briefcase' : 'briefcase-outline';
        } else if (route.name === 'Drivers') {
          iconName = focused ? 'car' : 'car-outline';
        } else if (route.name === 'Reports') {
          iconName = focused ? 'bar-chart' : 'bar-chart-outline';
        } else if (route.name === 'Settings') {
          iconName = focused ? 'settings' : 'settings-outline';
        }
        
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.gray[600],
      headerShown: false,
    })}
  >
    <Tab.Screen name="Dashboard" component={AdminHomeScreen} />
    <Tab.Screen name="Jobs" component={AdminJobsScreen} />
    <Tab.Screen name="Drivers" component={AdminDriversScreen} />
    <Tab.Screen name="Reports" component={AdminReportsScreen} />
    <Tab.Screen name="Settings" component={AdminSettingsScreen} />
  </Tab.Navigator>
);

// Main App Navigator
const AppNavigator = () => {
  const { isAuthenticated, userRole, loading } = useAuth();

  if (loading) {
    return null; // You can add a loading screen here
  }

  if (!isAuthenticated) {
    return <AuthStack />;
  }

  // Return appropriate navigator based on user role
  const getMainNavigator = () => {
    switch (userRole) {
      case 'customer':
        return (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="CustomerMain" component={CustomerTabs} />
            <Stack.Screen name="Booking" component={BookingScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Help" component={HelpScreen} />
          </Stack.Navigator>
        );
      
      case 'driver':
        return (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="DriverMain" component={DriverTabs} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Help" component={HelpScreen} />
          </Stack.Navigator>
        );
      
      case 'dispatcher':
        return (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="DispatcherMain" component={DispatcherTabs} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Help" component={HelpScreen} />
          </Stack.Navigator>
        );
      
      case 'admin':
        return (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AdminMain" component={AdminTabs} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Help" component={HelpScreen} />
          </Stack.Navigator>
        );
      
      default:
        return <AuthStack />;
    }
  };

  return getMainNavigator();
};

export default AppNavigator;
