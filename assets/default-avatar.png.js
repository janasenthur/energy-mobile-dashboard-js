import React from 'react';
import { View, Text } from 'react-native';

const DefaultAvatar = ({ style, width = 50, height = 50 }) => (
  <View style={[{
    width,
    height,
    backgroundColor: '#9E9E9E',
    borderRadius: width / 2,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  }, style]}>
    <Text style={{ color: 'white', fontSize: width * 0.4, fontWeight: 'bold' }}>👤</Text>
  </View>
);

export default DefaultAvatar;
