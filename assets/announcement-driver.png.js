import React from 'react';
import { View, Text } from 'react-native';

const AnnouncementDriver = ({ style, width = 300, height = 120 }) => (
  <View style={[{
    width,
    height,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    padding: 15,
  }, style]}>
    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>🚛</Text>
    <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold', textAlign: 'center' }}>DRIVE WITH US</Text>
    <Text style={{ color: 'white', fontSize: 12, textAlign: 'center' }}>Professional Opportunities</Text>
    <Text style={{ color: 'white', fontSize: 10, textAlign: 'center' }}>Join our fleet of expert drivers!</Text>
  </View>
);

export default AnnouncementDriver;
