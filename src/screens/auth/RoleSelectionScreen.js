import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme/theme';
import TruckIconComponent from '../../../assets/truck-icon.png.js';

const { width, height } = Dimensions.get('window');

const RoleSelectionScreen = ({ navigation }) => {
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: 'customer',
      title: 'Customer',
      subtitle: 'Book truck services',
      icon: 'person-outline',
      color: colors.primary,
      features: [
        'Create job requests',
        'Track deliveries',
        'View past jobs',
        'Real-time notifications',
      ],
    },
    {
      id: 'driver',
      title: 'Driver',
      subtitle: 'Drive and deliver',
      icon: 'car-outline',
      color: colors.info,
      features: [
        'Receive job alerts',
        'Update job status',
        'GPS tracking',
        'Generate reports',
      ],
    },
    {
      id: 'dispatcher',
      title: 'Dispatcher',
      subtitle: 'Manage operations',
      icon: 'radio-outline',
      color: colors.success,
      features: [
        'Manage job queue',
        'Assign drivers',
        'Track operations',
        'Monitor performance',
      ],
    },
    {
      id: 'admin',
      title: 'Admin',
      subtitle: 'System management',
      icon: 'settings-outline',
      color: colors.warning,
      features: [
        'Full system access',
        'User management',
        'Reports & analytics',
        'System configuration',
      ],
    },
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
  };

  const handleContinue = () => {
    if (selectedRole) {
      if (selectedRole === 'driver') {
        navigation.navigate('DriverRegistration');
      } else {
        navigation.navigate('Login', { role: selectedRole });
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <TruckIconComponent style={{ width: 60, height: 60 }} />
          </View>
          <Text style={styles.title}>Energy Dashboard</Text>
          <Text style={styles.subtitle}>Choose your role to continue</Text>
        </View>

        <View style={styles.rolesContainer}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              style={[
                styles.roleCard,
                selectedRole === role.id && styles.selectedRole,
              ]}
              onPress={() => handleRoleSelect(role.id)}
              activeOpacity={0.8}
            >
              <View style={styles.roleHeader}>
                <View style={[styles.iconContainer, { backgroundColor: role.color }]}>
                  <Ionicons name={role.icon} size={24} color={colors.white} />
                </View>
                <View style={styles.roleInfo}>
                  <Text style={styles.roleTitle}>{role.title}</Text>
                  <Text style={styles.roleSubtitle}>{role.subtitle}</Text>
                </View>
                {selectedRole === role.id && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                )}
              </View>
              
              <View style={styles.featuresContainer}>
                {role.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons name="checkmark" size={16} color={role.color} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedRole && styles.disabledButton,
            ]}
            onPress={handleContinue}
            disabled={!selectedRole}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: colors.white,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logo: {
    width: 50,
    height: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
  },
  rolesContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  roleCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedRole: {
    borderWidth: 2,
    borderColor: colors.success,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 2,
  },
  roleSubtitle: {
    fontSize: 14,
    color: colors.gray[600],
  },
  featuresContainer: {
    marginTop: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  featureText: {
    fontSize: 14,
    color: colors.gray[700],
    marginLeft: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  continueButton: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginRight: spacing.sm,
  },
});

export default RoleSelectionScreen;
