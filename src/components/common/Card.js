import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme/theme';

const Card = ({ 
  title, 
  subtitle, 
  children, 
  onPress, 
  style = {},
  headerStyle = {},
  icon,
  actionIcon,
  onActionPress,
  elevation = 2,
}) => {
  const CardContainer = onPress ? TouchableOpacity : View;
  
  return (
    <CardContainer
      style={[styles.container, { elevation }, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {(title || subtitle || icon || actionIcon) && (
        <View style={[styles.header, headerStyle]}>
          <View style={styles.headerContent}>
            {icon && (
              <View style={styles.iconContainer}>
                <Ionicons name={icon} size={20} color={colors.primary} />
              </View>
            )}
            <View style={styles.titleContainer}>
              {title && <Text style={styles.title}>{title}</Text>}
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          </View>
          {actionIcon && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onActionPress}
            >
              <Ionicons name={actionIcon} size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      )}
      {children && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.small,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.subtitle,
    color: colors.text,
    fontWeight: '600',
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionButton: {
    padding: spacing.small,
  },
  content: {
    padding: spacing.medium,
  },
});

export default Card;
