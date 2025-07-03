import React from 'react';
import { View, Text } from 'react-native';

const Truck1 = ({ style, width = 120, height = 80 }) => (
  <View style={[{
    width,
    height,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  }, style]}>
    <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>🚛</Text>
    <Text style={{ color: 'white', fontSize: 10 }}>TRUCK 1</Text>
    <Text style={{ color: 'white', fontSize: 8 }}>Fuel Delivery</Text>
  </View>
);

export default Truck1;
