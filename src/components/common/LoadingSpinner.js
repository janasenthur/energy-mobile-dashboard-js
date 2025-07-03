import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme/theme';

const LoadingSpinner = ({ 
  size = 'large', 
  color = colors.primary, 
  text = '', 
  style = {},
  overlay = false 
}) => {
  const Container = overlay ? View : React.Fragment;
  const containerStyle = overlay ? [styles.overlay, style] : style;

  return (
    <Container style={containerStyle}>
      <View style={styles.container}>
        <ActivityIndicator size={size} color={color} />
        {text ? <Text style={styles.text}>{text}</Text> : null}
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.large,
  },
  text: {
    ...typography.body,
    color: colors.text,
    marginTop: spacing.medium,
    textAlign: 'center',
  },
});

export default LoadingSpinner;
