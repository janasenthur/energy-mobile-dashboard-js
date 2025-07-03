import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme/theme';
import { useNotification } from '../../context/NotificationContext';

const NotificationsScreen = () => {
  const { notifications, markAsRead, clearNotification, refreshNotifications } = useNotification();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, read

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const handleNotificationPress = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    // Navigate to relevant screen based on notification type
    // This would be implemented based on your navigation structure
  };

  const handleClearNotification = (notificationId) => {
    Alert.alert(
      'Clear Notification',
      'Are you sure you want to remove this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => clearNotification(notificationId),
        },
      ]
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'job':
        return 'briefcase';
      case 'message':
        return 'chatbubble';
      case 'system':
        return 'settings';
      case 'emergency':
        return 'warning';
      case 'payment':
        return 'card';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'emergency':
        return colors.error;
      case 'job':
        return colors.primary;
      case 'payment':
        return colors.success;
      default:
        return colors.text;
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadNotification]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Ionicons
            name={getNotificationIcon(item.type)}
            size={24}
            color={getNotificationColor(item.type)}
          />
          <View style={styles.notificationInfo}>
            <Text style={[styles.notificationTitle, !item.read && styles.unreadText]}>
              {item.title}
            </Text>
            <Text style={styles.notificationTime}>{item.timestamp}</Text>
          </View>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => handleClearNotification(item.id)}
          >
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        {!item.read && <View style={styles.unreadIndicator} />}
      </View>
    </TouchableOpacity>
  );

  const FilterButton = ({ filterType, label }) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === filterType && styles.activeFilter]}
      onPress={() => setFilter(filterType)}
    >
      <Text style={[styles.filterText, filter === filterType && styles.activeFilterText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.filterContainer}>
          <FilterButton filterType="all" label="All" />
          <FilterButton filterType="unread" label="Unread" />
          <FilterButton filterType="read" label="Read" />
        </View>
      </View>

      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No notifications</Text>
            <Text style={styles.emptySubtext}>
              {filter === 'unread' ? 'All caught up!' : 'You\'ll see notifications here when they arrive'}
            </Text>
          </View>
        }
      />
    </View>
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
    marginBottom: spacing.medium,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: spacing.small,
  },
  filterButton: {
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeFilter: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  activeFilterText: {
    color: colors.surface,
    fontWeight: '600',
  },
  listContainer: {
    flexGrow: 1,
  },
  notificationItem: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.medium,
    marginVertical: spacing.small,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  notificationContent: {
    padding: spacing.medium,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.small,
  },
  notificationInfo: {
    flex: 1,
    marginLeft: spacing.medium,
  },
  notificationTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: 2,
  },
  unreadText: {
    fontWeight: '600',
  },
  notificationTime: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  clearButton: {
    padding: spacing.small,
  },
  notificationMessage: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  unreadIndicator: {
    position: 'absolute',
    top: spacing.medium,
    right: spacing.medium,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.large,
    marginTop: 100,
  },
  emptyText: {
    ...typography.h3,
    color: colors.textSecondary,
    marginTop: spacing.medium,
    marginBottom: spacing.small,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default NotificationsScreen;
