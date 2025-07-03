import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme/theme';
import Button from './Button';

const ConfirmationModal = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'default', // default, warning, danger
  icon,
}) => {
  const getIconColor = () => {
    switch (type) {
      case 'warning':
        return colors.warning;
      case 'danger':
        return colors.error;
      default:
        return colors.primary;
    }
  };

  const getDefaultIcon = () => {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'danger':
        return 'trash';
      default:
        return 'checkmark-circle';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={icon || getDefaultIcon()} 
              size={48} 
              color={getIconColor()} 
            />
          </View>
          
          <Text style={styles.title}>{title}</Text>
          {message && <Text style={styles.message}>{message}</Text>}
          
          <View style={styles.buttonContainer}>
            <Button
              title={cancelText}
              onPress={onCancel}
              variant="outline"
              style={styles.button}
            />
            <Button
              title={confirmText}
              onPress={onConfirm}
              variant={type === 'danger' ? 'danger' : 'primary'}
              style={styles.button}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.large,
    margin: spacing.large,
    minWidth: 300,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing.medium,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.small,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.large,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.medium,
    width: '100%',
  },
  button: {
    flex: 1,
  },
});

export default ConfirmationModal;
