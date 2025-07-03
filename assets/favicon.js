// Simple favicon component as fallback
import React from 'react';
import { View, Text } from 'react-native';

export default function FaviconComponent() {
  return (
    <View
      style={{
        width: 32,
        height: 32,
        backgroundColor: '#FF6B35',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          color: 'white',
          fontSize: 18,
          fontWeight: 'bold',
        }}
      >
        E
      </Text>
    </View>
  );
}
