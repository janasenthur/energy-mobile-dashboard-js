import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

// Web-compatible Map component fallback
const WebMapView = ({ style, region, children, ...props }) => (
  <View style={[styles.webMapContainer, style]}>
    <View style={styles.webMapHeader}>
      <Text style={styles.webMapTitle}>Map View</Text>
      <Text style={styles.webMapSubtitle}>
        📍 {region?.latitude?.toFixed(4)}, {region?.longitude?.toFixed(4)}
      </Text>
    </View>
    <View style={styles.webMapContent}>
      <Text style={styles.webMapMessage}>
        🗺️ Interactive map not available on web.{'\n'}
        Use mobile app for full map functionality.
      </Text>
      {children}
    </View>
  </View>
);

const WebMarker = ({ coordinate, title, description, children }) => (
  <View style={styles.webMarker}>
    <Text style={styles.webMarkerText}>
      📍 {title || 'Location'} ({coordinate?.latitude?.toFixed(4)}, {coordinate?.longitude?.toFixed(4)})
    </Text>
    {description && <Text style={styles.webMarkerDesc}>{description}</Text>}
    {children}
  </View>
);

const WebPolyline = ({ coordinates, strokeColor, strokeWidth }) => (
  <View style={styles.webPolyline}>
    <Text style={styles.webPolylineText}>
      🛣️ Route: {coordinates?.length || 0} points
    </Text>
  </View>
);

// Export platform-specific components
const MapView = Platform.OS === 'web' ? WebMapView : require('react-native-maps').default;
const Marker = Platform.OS === 'web' ? WebMarker : require('react-native-maps').Marker;
const Polyline = Platform.OS === 'web' ? WebPolyline : require('react-native-maps').Polyline;

const styles = StyleSheet.create({
  webMapContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    minHeight: 200,
  },
  webMapHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 8,
    marginBottom: 12,
  },
  webMapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  webMapSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  webMapContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  webMapMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  webMarker: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 8,
    margin: 4,
  },
  webMarkerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  webMarkerDesc: {
    color: 'white',
    fontSize: 10,
    marginTop: 2,
  },
  webPolyline: {
    backgroundColor: '#4CAF50',
    padding: 4,
    borderRadius: 4,
    margin: 2,
  },
  webPolylineText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export { MapView, Marker, Polyline };
export default MapView;
