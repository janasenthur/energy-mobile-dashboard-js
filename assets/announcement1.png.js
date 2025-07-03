import React from 'react';
import { View, Text } from 'react-native';

const Announcement1 = ({ style, width = 300, height = 120 }) => (
  <View style={[{
    width,
    height,
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundColor: '#667eea',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    padding: 15,
  }, style]}>
    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>📢</Text>
    <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold', textAlign: 'center' }}>FAST & RELIABLE</Text>
    <Text style={{ color: 'white', fontSize: 12, textAlign: 'center' }}>Energy Delivery Service</Text>
    <Text style={{ color: 'white', fontSize: 10, textAlign: 'center' }}>Book now for same-day delivery!</Text>
  </View>
);

export default Announcement1;
