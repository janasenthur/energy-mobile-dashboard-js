import React from 'react';
import { View, Text } from 'react-native';

const Truck3 = ({ style, width = 120, height = 80 }) => (
  <View style={[{
    width,
    height,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  }, style]}>
    <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>🚛</Text>
    <Text style={{ color: 'white', fontSize: 10 }}>TRUCK 3</Text>
    <Text style={{ color: 'white', fontSize: 8 }}>Heavy Duty</Text>
  </View>
);

export default Truck3;
