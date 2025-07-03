// Web-compatible Vector Icons
import React from 'react';
import { Text, View } from 'react-native';

// Icon mapping for common icons
const iconMap = {
  // Material Icons
  'home': '🏠',
  'person': '👤',
  'location-on': '📍',
  'notification': '🔔',
  'settings': '⚙️',
  'menu': '☰',
  'search': '🔍',
  'add': '➕',
  'edit': '✏️',
  'delete': '🗑️',
  'check': '✓',
  'close': '✕',
  'arrow-back': '←',
  'arrow-forward': '→',
  'phone': '📞',
  'email': '📧',
  'camera': '📷',
  'image': '🖼️',
  'star': '⭐',
  'favorite': '❤️',
  'share': '🔗',
  'download': '⬇️',
  'upload': '⬆️',
  'refresh': '🔄',
  'visibility': '👁️',
  'visibility-off': '🙈',
  'lock': '🔒',
  'unlock': '🔓',
  'calendar': '📅',
  'time': '⏰',
  'truck': '🚛',
  'car': '🚗',
  'map': '🗺️',
  'gps': '🎯',
  
  // Ionicons
  'md-home': '🏠',
  'md-person': '👤',
  'md-notifications': '🔔',
  'md-settings': '⚙️',
  'md-menu': '☰',
  'md-search': '🔍',
  'md-add': '➕',
  'md-checkmark': '✓',
  'md-close': '✕',
  'md-arrow-back': '←',
  'md-arrow-forward': '→',
  'md-call': '📞',
  'md-mail': '📧',
  'md-camera': '📷',
  'md-image': '🖼️',
  'md-star': '⭐',
  'md-heart': '❤️',
  'md-share': '🔗',
  'md-download': '⬇️',
  'md-refresh': '🔄',
  'md-eye': '👁️',
  'md-lock': '🔒',
  'md-calendar': '📅',
  'md-time': '⏰',
  'md-car': '🚗',
  'md-locate': '🎯',
};

// Base Icon component
const WebIcon = ({ name, size = 24, color = '#000', style, ...props }) => {
  const emoji = iconMap[name] || iconMap[name?.toLowerCase()] || '⚫';
  
  return (
    <Text
      style={[
        {
          fontSize: size,
          color: color,
          lineHeight: size,
          textAlign: 'center',
          width: size,
          height: size,
        },
        style,
      ]}
      {...props}
    >
      {emoji}
    </Text>
  );
};

// Material Icons component
export const MaterialIcons = WebIcon;

// Ionicons component  
export const Ionicons = WebIcon;

// FontAwesome component
export const FontAwesome = WebIcon;

// AntDesign component
export const AntDesign = WebIcon;

// Entypo component
export const Entypo = WebIcon;

// Feather component
export const Feather = WebIcon;

// MaterialCommunityIcons component
export const MaterialCommunityIcons = WebIcon;

// Default export
export default {
  MaterialIcons,
  Ionicons,
  FontAwesome,
  AntDesign,
  Entypo,
  Feather,
  MaterialCommunityIcons,
  createIconSet: () => WebIcon,
  createIconSetFromFontello: () => WebIcon,
  createIconSetFromIcoMoon: () => WebIcon,
};
