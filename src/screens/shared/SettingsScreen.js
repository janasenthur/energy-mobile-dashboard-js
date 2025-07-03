import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const SettingsScreen = () => {
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState({
    notifications: {
      pushNotifications: true,
      emailNotifications: true,
      smsNotifications: false,
      jobAlerts: true,
      paymentAlerts: true,
      systemAlerts: true,
    },
    privacy: {
      locationTracking: true,
      dataSharing: false,
      analytics: true,
    },
    preferences: {
      darkMode: false,
      language: 'English',
      units: 'Imperial',
      autoRefresh: true,
    },
  });

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const handleChangePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    // TODO: Implement password change API call
    Alert.alert('Success', 'Password changed successfully');
    setPasswordModalVisible(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data and may require you to re-download some content.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement cache clearing
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const SettingItem = ({ title, subtitle, value, onValueChange, type = 'switch' }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.surface}
        />
      )}
      {type === 'arrow' && (
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      )}
    </View>
  );

  const SectionHeader = ({ title, icon }) => (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your app preferences</Text>
      </View>

      {/* Profile Section */}
      <SectionHeader title="Profile" icon="person" />
      <View style={styles.section}>
        <View style={styles.profileInfo}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={32} color={colors.primary} />
          </View>
          <View style={styles.profileDetails}>
            <Text style={styles.profileName}>{user?.name || 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
            <Text style={styles.profileRole}>{user?.role || 'Driver'}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.changePasswordButton}
          onPress={() => setPasswordModalVisible(true)}
        >
          <Text style={styles.changePasswordText}>Change Password</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Notifications Section */}
      <SectionHeader title="Notifications" icon="notifications" />
      <View style={styles.section}>
        <SettingItem
          title="Push Notifications"
          subtitle="Receive notifications on your device"
          value={settings.notifications.pushNotifications}
          onValueChange={(value) => handleSettingChange('notifications', 'pushNotifications', value)}
        />
        <SettingItem
          title="Email Notifications"
          subtitle="Receive notifications via email"
          value={settings.notifications.emailNotifications}
          onValueChange={(value) => handleSettingChange('notifications', 'emailNotifications', value)}
        />
        <SettingItem
          title="SMS Notifications"
          subtitle="Receive notifications via SMS"
          value={settings.notifications.smsNotifications}
          onValueChange={(value) => handleSettingChange('notifications', 'smsNotifications', value)}
        />
        <SettingItem
          title="Job Alerts"
          subtitle="Get notified about new jobs and updates"
          value={settings.notifications.jobAlerts}
          onValueChange={(value) => handleSettingChange('notifications', 'jobAlerts', value)}
        />
        <SettingItem
          title="Payment Alerts"
          subtitle="Get notified about payments and invoices"
          value={settings.notifications.paymentAlerts}
          onValueChange={(value) => handleSettingChange('notifications', 'paymentAlerts', value)}
        />
      </View>

      {/* Privacy Section */}
      <SectionHeader title="Privacy & Security" icon="shield-checkmark" />
      <View style={styles.section}>
        <SettingItem
          title="Location Tracking"
          subtitle="Allow app to track your location"
          value={settings.privacy.locationTracking}
          onValueChange={(value) => handleSettingChange('privacy', 'locationTracking', value)}
        />
        <SettingItem
          title="Data Sharing"
          subtitle="Share usage data for app improvement"
          value={settings.privacy.dataSharing}
          onValueChange={(value) => handleSettingChange('privacy', 'dataSharing', value)}
        />
        <SettingItem
          title="Analytics"
          subtitle="Help improve the app with usage analytics"
          value={settings.privacy.analytics}
          onValueChange={(value) => handleSettingChange('privacy', 'analytics', value)}
        />
      </View>

      {/* Preferences Section */}
      <SectionHeader title="Preferences" icon="settings" />
      <View style={styles.section}>
        <SettingItem
          title="Dark Mode"
          subtitle="Use dark theme"
          value={settings.preferences.darkMode}
          onValueChange={(value) => handleSettingChange('preferences', 'darkMode', value)}
        />
        <SettingItem
          title="Auto Refresh"
          subtitle="Automatically refresh data"
          value={settings.preferences.autoRefresh}
          onValueChange={(value) => handleSettingChange('preferences', 'autoRefresh', value)}
        />
      </View>

      {/* App Section */}
      <SectionHeader title="App" icon="phone-portrait" />
      <View style={styles.section}>
        <TouchableOpacity style={styles.settingItem} onPress={handleClearCache}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Clear Cache</Text>
            <Text style={styles.settingSubtitle}>Free up storage space</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>App Version</Text>
            <Text style={styles.settingSubtitle}>1.0.0</Text>
          </View>
        </View>
      </View>

      {/* Logout Section */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Change Password Modal */}
      <Modal
        visible={passwordModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity
                onPress={() => setPasswordModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Input
              placeholder="Current Password"
              value={passwordData.currentPassword}
              onChangeText={(text) => setPasswordData(prev => ({ ...prev, currentPassword: text }))}
              secureTextEntry
              style={styles.modalInput}
            />

            <Input
              placeholder="New Password"
              value={passwordData.newPassword}
              onChangeText={(text) => setPasswordData(prev => ({ ...prev, newPassword: text }))}
              secureTextEntry
              style={styles.modalInput}
            />

            <Input
              placeholder="Confirm New Password"
              value={passwordData.confirmPassword}
              onChangeText={(text) => setPasswordData(prev => ({ ...prev, confirmPassword: text }))}
              secureTextEntry
              style={styles.modalInput}
            />

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setPasswordModalVisible(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Change Password"
                onPress={handleChangePassword}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.large,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.small,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    backgroundColor: colors.background,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginLeft: spacing.small,
    fontWeight: '600',
  },
  section: {
    backgroundColor: colors.surface,
    marginBottom: spacing.small,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  settingSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.medium,
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    ...typography.subtitle,
    color: colors.text,
    fontWeight: '600',
  },
  profileEmail: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  profileRole: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 2,
    fontWeight: '500',
  },
  changePasswordButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  changePasswordText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.medium,
    paddingHorizontal: spacing.large,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.medium,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutText: {
    ...typography.body,
    color: colors.error,
    marginLeft: spacing.small,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    margin: spacing.large,
    borderRadius: 16,
    padding: spacing.large,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.large,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
  },
  modalCloseButton: {
    padding: spacing.small,
  },
  modalInput: {
    marginBottom: spacing.medium,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.medium,
    marginTop: spacing.medium,
  },
  modalButton: {
    flex: 1,
  },
});

export default SettingsScreen;
