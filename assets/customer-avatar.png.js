import React from 'react';
import { View, Text } from 'react-native';

const CustomerAvatar = ({ style, width = 50, height = 50 }) => (
  <View style={[{
    width,
    height,
    backgroundColor: '#E91E63',
    borderRadius: width / 2,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    borderWidth: 2,
    borderColor: '#FFF',
  }, style]}>
    <Text style={{ color: 'white', fontSize: width * 0.35, fontWeight: 'bold' }}>👩‍💼</Text>
  </View>
);

export default CustomerAvatar;
