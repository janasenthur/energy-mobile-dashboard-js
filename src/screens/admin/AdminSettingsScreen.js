import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme/theme';
import { useNavigation } from '@react-navigation/native';

const AdminSettingsScreen = () => {
  const navigation = useNavigation();
  const [settings, setSettings] = useState({
    system: {
      maintenanceMode: false,
      autoBackup: true,
      debugMode: false,
      logRetention: 30,
      sessionTimeout: 60,
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
      jobAlerts: true,
      maintenanceAlerts: true,
      lowFuelAlerts: true,
      driverAlerts: true,
    },
    business: {
      currency: 'USD',
      timezone: 'America/Chicago',
      businessHours: {
        start: '08:00',
        end: '18:00',
      },
      defaultJobPriority: 'medium',
      autoAssignJobs: false,
      requireCustomerSignature: true,
    },
    security: {
      twoFactorAuth: true,
      passwordExpiry: 90,
      lockoutAttempts: 5,
      encryptData: true,
      auditLogs: true,
    },
    integrations: {
      gpsTracking: true,
      weatherService: true,
      trafficService: true,
      fuelCardIntegration: false,
      accountingSystem: false,
      customerPortal: true,
    },
  });
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const updateNestedSetting = (category, nestedKey, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [nestedKey]: {
          ...prev[category][nestedKey],
          [key]: value,
        },
      },
    }));
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to defaults? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => {
          // Reset to default values
          Alert.alert('Settings Reset', 'All settings have been reset to defaults');
        }},
      ]
    );
  };

  const exportSettings = () => {
    Alert.alert(
      'Export Settings',
      'Export current settings configuration?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => {
          // Export functionality
          Alert.alert('Export Complete', 'Settings exported successfully');
        }},
      ]
    );
  };

  const SettingSection = ({ title, children }) => (
    <View style={styles.settingSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const SettingRow = ({ title, subtitle, value, onToggle, type = 'switch', onPress }) => (
    <TouchableOpacity 
      style={styles.settingRow} 
      onPress={type === 'button' ? onPress : undefined}
      disabled={type === 'switch'}
    >
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: colors.gray[300], true: colors.primary }}
          thumbColor={value ? colors.white : colors.gray[500]}
        />
      )}
      {type === 'button' && (
        <Ionicons name="chevron-forward" size={20} color={colors.gray[600]} />
      )}
      {type === 'value' && (
        <Text style={styles.settingValue}>{value}</Text>
      )}
    </TouchableOpacity>
  );

  const QuickActionCard = ({ title, subtitle, icon, color, onPress }) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color={colors.white} />
      </View>
      <View style={styles.quickActionContent}>
        <Text style={styles.quickActionTitle}>{title}</Text>
        <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  const BackupModal = () => (
    <Modal
      visible={showBackupModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowBackupModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Backup & Recovery</Text>
          <TouchableOpacity onPress={() => setShowBackupModal(false)}>
            <Ionicons name="close" size={24} color={colors.dark} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.backupSection}>
            <Text style={styles.backupSectionTitle}>Automatic Backups</Text>
            <SettingRow
              title="Daily Backups"
              subtitle="Automatically backup data every 24 hours"
              value={settings.system.autoBackup}
              onToggle={(value) => updateSetting('system', 'autoBackup', value)}
            />
            <Text style={styles.backupInfo}>
              Last backup: January 15, 2024 at 3:00 AM
            </Text>
          </View>

          <View style={styles.backupSection}>
            <Text style={styles.backupSectionTitle}>Manual Backup</Text>
            <TouchableOpacity style={styles.backupButton}>
              <Ionicons name="cloud-upload-outline" size={20} color={colors.white} />
              <Text style={styles.backupButtonText}>Create Backup Now</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.backupSection}>
            <Text style={styles.backupSectionTitle}>Recovery Options</Text>
            <TouchableOpacity style={[styles.backupButton, { backgroundColor: colors.warning }]}>
              <Ionicons name="cloud-download-outline" size={20} color={colors.white} />
              <Text style={styles.backupButtonText}>Restore from Backup</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.backupSection}>
            <Text style={styles.backupSectionTitle}>Storage Info</Text>
            <View style={styles.storageInfo}>
              <Text style={styles.storageText}>Total Storage Used: 2.3 GB</Text>
              <Text style={styles.storageText}>Available Storage: 47.7 GB</Text>
              <Text style={styles.storageText}>Backup Size: 156 MB</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const UserManagementModal = () => (
    <Modal
      visible={showUserModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowUserModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>User Management</Text>
          <TouchableOpacity onPress={() => setShowUserModal(false)}>
            <Ionicons name="close" size={24} color={colors.dark} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.userSection}>
            <Text style={styles.userSectionTitle}>Quick Actions</Text>
            <TouchableOpacity style={styles.userActionButton}>
              <Ionicons name="person-add-outline" size={20} color={colors.primary} />
              <Text style={styles.userActionText}>Add New User</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.userActionButton}>
              <Ionicons name="people-outline" size={20} color={colors.primary} />
              <Text style={styles.userActionText}>Manage Roles & Permissions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.userActionButton}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
              <Text style={styles.userActionText}>Security Audit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.userSection}>
            <Text style={styles.userSectionTitle}>User Statistics</Text>
            <View style={styles.userStats}>
              <Text style={styles.userStatText}>Total Users: 34</Text>
              <Text style={styles.userStatText}>Active Sessions: 12</Text>
              <Text style={styles.userStatText}>Admin Users: 3</Text>
              <Text style={styles.userStatText}>Last Login: 2 minutes ago</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>System Settings</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={exportSettings}>
            <Ionicons name="download-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={resetToDefaults}>
            <Ionicons name="refresh-outline" size={20} color={colors.warning} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionCard
              title="Backup & Recovery"
              subtitle="Manage data backups"
              icon="cloud-outline"
              color={colors.primary}
              onPress={() => setShowBackupModal(true)}
            />
            <QuickActionCard
              title="User Management"
              subtitle="Manage users & roles"
              icon="people-outline"
              color={colors.success}
              onPress={() => setShowUserModal(true)}
            />
            <QuickActionCard
              title="System Logs"
              subtitle="View system activity"
              icon="document-text-outline"
              color={colors.info}
              onPress={() => Alert.alert('System Logs', 'View system logs functionality')}
            />
            <QuickActionCard
              title="API Settings"
              subtitle="Configure integrations"
              icon="settings-outline"
              color={colors.warning}
              onPress={() => Alert.alert('API Settings', 'API configuration panel')}
            />
          </View>
        </View>

        {/* System Settings */}
        <SettingSection title="System Configuration">
          <SettingRow
            title="Maintenance Mode"
            subtitle="Temporarily disable system for maintenance"
            value={settings.system.maintenanceMode}
            onToggle={(value) => updateSetting('system', 'maintenanceMode', value)}
          />
          <SettingRow
            title="Automatic Backups"
            subtitle="Enable daily automated backups"
            value={settings.system.autoBackup}
            onToggle={(value) => updateSetting('system', 'autoBackup', value)}
          />
          <SettingRow
            title="Debug Mode"
            subtitle="Enable detailed logging for troubleshooting"
            value={settings.system.debugMode}
            onToggle={(value) => updateSetting('system', 'debugMode', value)}
          />
          <SettingRow
            title="Log Retention"
            subtitle="Days to keep system logs"
            value={`${settings.system.logRetention} days`}
            type="value"
          />
          <SettingRow
            title="Session Timeout"
            subtitle="Minutes before automatic logout"
            value={`${settings.system.sessionTimeout} minutes`}
            type="value"
          />
        </SettingSection>

        {/* Notification Settings */}
        <SettingSection title="Notification Settings">
          <SettingRow
            title="Email Notifications"
            subtitle="Send notifications via email"
            value={settings.notifications.emailNotifications}
            onToggle={(value) => updateSetting('notifications', 'emailNotifications', value)}
          />
          <SettingRow
            title="SMS Notifications"
            subtitle="Send critical alerts via SMS"
            value={settings.notifications.smsNotifications}
            onToggle={(value) => updateSetting('notifications', 'smsNotifications', value)}
          />
          <SettingRow
            title="Push Notifications"
            subtitle="Send mobile push notifications"
            value={settings.notifications.pushNotifications}
            onToggle={(value) => updateSetting('notifications', 'pushNotifications', value)}
          />
          <SettingRow
            title="Job Alerts"
            subtitle="Notify about job status changes"
            value={settings.notifications.jobAlerts}
            onToggle={(value) => updateSetting('notifications', 'jobAlerts', value)}
          />
          <SettingRow
            title="Maintenance Alerts"
            subtitle="Notify about vehicle maintenance"
            value={settings.notifications.maintenanceAlerts}
            onToggle={(value) => updateSetting('notifications', 'maintenanceAlerts', value)}
          />
          <SettingRow
            title="Driver Alerts"
            subtitle="Notify about driver status changes"
            value={settings.notifications.driverAlerts}
            onToggle={(value) => updateSetting('notifications', 'driverAlerts', value)}
          />
        </SettingSection>

        {/* Business Settings */}
        <SettingSection title="Business Configuration">
          <SettingRow
            title="Currency"
            subtitle="Default currency for pricing"
            value={settings.business.currency}
            type="value"
          />
          <SettingRow
            title="Timezone"
            subtitle="System timezone"
            value={settings.business.timezone}
            type="value"
          />
          <SettingRow
            title="Business Hours"
            subtitle="Operating hours"
            value={`${settings.business.businessHours.start} - ${settings.business.businessHours.end}`}
            type="value"
          />
          <SettingRow
            title="Auto-Assign Jobs"
            subtitle="Automatically assign jobs to available drivers"
            value={settings.business.autoAssignJobs}
            onToggle={(value) => updateSetting('business', 'autoAssignJobs', value)}
          />
          <SettingRow
            title="Require Customer Signature"
            subtitle="Mandate digital signature for deliveries"
            value={settings.business.requireCustomerSignature}
            onToggle={(value) => updateSetting('business', 'requireCustomerSignature', value)}
          />
        </SettingSection>

        {/* Security Settings */}
        <SettingSection title="Security & Privacy">
          <SettingRow
            title="Two-Factor Authentication"
            subtitle="Require 2FA for admin accounts"
            value={settings.security.twoFactorAuth}
            onToggle={(value) => updateSetting('security', 'twoFactorAuth', value)}
          />
          <SettingRow
            title="Data Encryption"
            subtitle="Encrypt sensitive data at rest"
            value={settings.security.encryptData}
            onToggle={(value) => updateSetting('security', 'encryptData', value)}
          />
          <SettingRow
            title="Audit Logs"
            subtitle="Log all user actions for security"
            value={settings.security.auditLogs}
            onToggle={(value) => updateSetting('security', 'auditLogs', value)}
          />
          <SettingRow
            title="Password Expiry"
            subtitle="Days before password expires"
            value={`${settings.security.passwordExpiry} days`}
            type="value"
          />
          <SettingRow
            title="Account Lockout"
            subtitle="Failed login attempts before lockout"
            value={`${settings.security.lockoutAttempts} attempts`}
            type="value"
          />
        </SettingSection>

        {/* Integration Settings */}
        <SettingSection title="Third-Party Integrations">
          <SettingRow
            title="GPS Tracking Service"
            subtitle="Real-time vehicle location tracking"
            value={settings.integrations.gpsTracking}
            onToggle={(value) => updateSetting('integrations', 'gpsTracking', value)}
          />
          <SettingRow
            title="Weather Service"
            subtitle="Weather data for route planning"
            value={settings.integrations.weatherService}
            onToggle={(value) => updateSetting('integrations', 'weatherService', value)}
          />
          <SettingRow
            title="Traffic Service"
            subtitle="Real-time traffic data"
            value={settings.integrations.trafficService}
            onToggle={(value) => updateSetting('integrations', 'trafficService', value)}
          />
          <SettingRow
            title="Fuel Card Integration"
            subtitle="Connect with fuel card providers"
            value={settings.integrations.fuelCardIntegration}
            onToggle={(value) => updateSetting('integrations', 'fuelCardIntegration', value)}
          />
          <SettingRow
            title="Accounting System"
            subtitle="Sync with external accounting software"
            value={settings.integrations.accountingSystem}
            onToggle={(value) => updateSetting('integrations', 'accountingSystem', value)}
          />
          <SettingRow
            title="Customer Portal"
            subtitle="Enable customer self-service portal"
            value={settings.integrations.customerPortal}
            onToggle={(value) => updateSetting('integrations', 'customerPortal', value)}
          />
        </SettingSection>

        {/* Save Button */}
        <View style={styles.saveSection}>
          <TouchableOpacity 
            style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
            onPress={saveSettings}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save All Settings'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BackupModal />
      <UserManagementModal />
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
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.dark,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    marginHorizontal: '1%',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.dark,
  },
  quickActionSubtitle: {
    fontSize: 10,
    color: colors.gray[600],
    marginTop: 2,
  },
  settingSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionContent: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    borderRadius: 12,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.dark,
  },
  settingSubtitle: {
    fontSize: 12,
    color: colors.gray[600],
    marginTop: 2,
  },
  settingValue: {
    fontSize: 14,
    color: colors.gray[600],
  },
  saveSection: {
    padding: spacing.lg,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.gray[400],
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.dark,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  backupSection: {
    marginBottom: spacing.lg,
  },
  backupSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark,
    marginBottom: spacing.md,
  },
  backupInfo: {
    fontSize: 12,
    color: colors.gray[600],
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  backupButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  backupButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  storageInfo: {
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: 8,
  },
  storageText: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  userSection: {
    marginBottom: spacing.lg,
  },
  userSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark,
    marginBottom: spacing.md,
  },
  userActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  userActionText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: spacing.md,
    fontWeight: '500',
  },
  userStats: {
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: 8,
  },
  userStatText: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
});

export default AdminSettingsScreen;
