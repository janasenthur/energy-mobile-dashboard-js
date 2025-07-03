import React from 'react';
import { View } from 'react-native';

// Simple favicon placeholder component for web
const FaviconComponent = ({ width = 32, height = 32 }) => (
  <View style={{
    width,
    height,
    backgroundColor: '#FF8C00',
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <View style={{
      fontSize: 16,
      color: 'white',
      fontWeight: 'bold',
    }}>
      E
    </View>
  </View>
);

export default FaviconComponent;
