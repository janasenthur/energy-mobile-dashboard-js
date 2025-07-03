// Web-compatible Gesture Handler
import React from 'react';
import { View, PanResponder } from 'react-native';

// Base gesture components
export const GestureHandlerRootView = ({ children, style, ...props }) => (
  <View style={[{ flex: 1 }, style]} {...props}>
    {children}
  </View>
);

export const PanGestureHandler = ({ children, onGestureEvent, ...props }) => {
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      if (onGestureEvent) {
        onGestureEvent({
          nativeEvent: {
            translationX: gestureState.dx,
            translationY: gestureState.dy,
            velocityX: gestureState.vx,
            velocityY: gestureState.vy,
          },
        });
      }
    },
  });

  return (
    <View {...panResponder.panHandlers} {...props}>
      {children}
    </View>
  );
};

export const TapGestureHandler = ({ children, onHandlerStateChange, ...props }) => {
  const handlePress = () => {
    if (onHandlerStateChange) {
      onHandlerStateChange({ nativeEvent: { state: 'ENDED' } });
    }
  };

  return React.cloneElement(children, {
    onPress: handlePress,
    ...props,
  });
};

export const LongPressGestureHandler = ({ children, onHandlerStateChange, ...props }) => {
  const handleLongPress = () => {
    if (onHandlerStateChange) {
      onHandlerStateChange({ nativeEvent: { state: 'ACTIVE' } });
    }
  };

  return React.cloneElement(children, {
    onLongPress: handleLongPress,
    ...props,
  });
};

// Gesture states
export const State = {
  UNDETERMINED: 0,
  FAILED: 1,
  BEGAN: 2,
  CANCELLED: 3,
  ACTIVE: 4,
  END: 5,
  ENDED: 5,
};

// Directions
export const Directions = {
  RIGHT: 1,
  LEFT: 2,
  UP: 4,
  DOWN: 8,
};

export default {
  GestureHandlerRootView,
  PanGestureHandler,
  TapGestureHandler,
  LongPressGestureHandler,
  State,
  Directions,
};
