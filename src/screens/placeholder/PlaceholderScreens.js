// Dispatcher screens
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors, spacing } from '../../theme/theme';

const createPlaceholderScreen = (title, subtitle) => () => (
  <SafeAreaView style={styles.container}>
    <View style={styles.content}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.dark, marginBottom: spacing.md },
  subtitle: { fontSize: 16, color: colors.gray[600], textAlign: 'center' },
});

export const DispatcherHomeScreen = createPlaceholderScreen('Dispatcher Dashboard', 'Dispatcher operations dashboard');
export const JobQueueScreen = createPlaceholderScreen('Job Queue', 'Manage incoming job requests');
export const DriverManagementScreen = createPlaceholderScreen('Driver Management', 'Manage and assign drivers');
export const DispatcherReportsScreen = createPlaceholderScreen('Dispatcher Reports', 'Operational reports and analytics');

// Admin screens
export const AdminHomeScreen = createPlaceholderScreen('Admin Dashboard', 'System administration dashboard');
export const AdminJobsScreen = createPlaceholderScreen('Admin Jobs', 'Manage all jobs in the system');
export const AdminDriversScreen = createPlaceholderScreen('Admin Drivers', 'Manage all drivers and vehicles');
export const AdminReportsScreen = createPlaceholderScreen('Admin Reports', 'Comprehensive business reports');
export const AdminSettingsScreen = createPlaceholderScreen('Admin Settings', 'System configuration and settings');

// Shared screens
export const NotificationsScreen = createPlaceholderScreen('Notifications', 'View and manage notifications');
export const SettingsScreen = createPlaceholderScreen('Settings', 'App settings and preferences');
export const HelpScreen = createPlaceholderScreen('Help & Support', 'Get help and contact support');

// Individual exports for navigation
export default {
  DispatcherHomeScreen,
  JobQueueScreen,
  DriverManagementScreen,
  DispatcherReportsScreen,
  AdminHomeScreen,
  AdminJobsScreen,
  AdminDriversScreen,
  AdminReportsScreen,
  AdminSettingsScreen,
  NotificationsScreen,
  SettingsScreen,
  HelpScreen,
};
