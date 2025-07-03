// Web-compatible Reanimated
import { useRef, useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';

// Shared values
export const useSharedValue = (initialValue) => {
  const animatedValue = useRef(new Animated.Value(initialValue)).current;
  return {
    value: initialValue,
    _value: animatedValue,
    setValue: (newValue) => {
      animatedValue.setValue(newValue);
    },
  };
};

// Animated styles
export const useAnimatedStyle = (styleFunction, dependencies = []) => {
  const [animatedStyle, setAnimatedStyle] = useState({});
  
  useEffect(() => {
    try {
      const newStyle = styleFunction();
      setAnimatedStyle(newStyle);
    } catch (error) {
      console.warn('useAnimatedStyle error:', error);
    }
  }, dependencies);
  
  return animatedStyle;
};

// Derived values
export const useDerivedValue = (derivedFunction, dependencies = []) => {
  const [derivedValue, setDerivedValue] = useState(() => {
    try {
      return derivedFunction();
    } catch {
      return 0;
    }
  });
  
  useEffect(() => {
    try {
      const newValue = derivedFunction();
      setDerivedValue(newValue);
    } catch (error) {
      console.warn('useDerivedValue error:', error);
    }
  }, dependencies);
  
  return { value: derivedValue };
};

// Animated gesture handler
export const useAnimatedGestureHandler = (handlers) => {
  return (event) => {
    try {
      if (handlers.onStart) handlers.onStart(event);
      if (handlers.onActive) handlers.onActive(event);
      if (handlers.onEnd) handlers.onEnd(event);
    } catch (error) {
      console.warn('useAnimatedGestureHandler error:', error);
    }
  };
};

// Animated props
export const useAnimatedProps = (propsFunction, dependencies = []) => {
  const [animatedProps, setAnimatedProps] = useState({});
  
  useEffect(() => {
    try {
      const newProps = propsFunction();
      setAnimatedProps(newProps);
    } catch (error) {
      console.warn('useAnimatedProps error:', error);
    }
  }, dependencies);
  
  return animatedProps;
};

// Spring animation
export const withSpring = (value, config = {}) => {
  return {
    toValue: value,
    ...config,
  };
};

// Timing animation
export const withTiming = (value, config = {}) => {
  return {
    toValue: value,
    duration: config.duration || 300,
    easing: config.easing || Easing.ease,
    ...config,
  };
};

// Repeat animation
export const withRepeat = (animation, numberOfReps = -1, reverse = false) => {
  return {
    ...animation,
    iterations: numberOfReps,
    reverse,
  };
};

// Sequence animation
export const withSequence = (...animations) => {
  return animations;
};

// Delay animation
export const withDelay = (delay, animation) => {
  return {
    ...animation,
    delay,
  };
};

// Run on JS
export const runOnJS = (func) => {
  return (...args) => {
    // Run function on next tick to simulate JS thread
    setTimeout(() => func(...args), 0);
  };
};

// Run on UI (fallback to JS on web)
export const runOnUI = (func) => {
  return runOnJS(func);
};

// Worklets (no-op on web)
export const worklet = (func) => func;

// Interpolate
export const interpolate = (value, inputRange, outputRange, extrapolate = 'clamp') => {
  if (typeof value === 'object' && value.value !== undefined) {
    value = value.value;
  }
  
  // Simple linear interpolation for web
  if (inputRange.length >= 2 && outputRange.length >= 2) {
    const input0 = inputRange[0];
    const input1 = inputRange[1];
    const output0 = outputRange[0];
    const output1 = outputRange[1];
    
    if (value <= input0) return output0;
    if (value >= input1) return output1;
    
    const ratio = (value - input0) / (input1 - input0);
    return output0 + ratio * (output1 - output0);
  }
  
  return value;
};

// Extrapolate
export const Extrapolate = {
  EXTEND: 'extend',
  CLAMP: 'clamp',
  IDENTITY: 'identity',
};

// Easing functions
export const EasingNode = Easing;

// Configuration check
export const isConfigured = () => true;

// Default export
export default {
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useAnimatedGestureHandler,
  useAnimatedProps,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  runOnJS,
  runOnUI,
  worklet,
  interpolate,
  Extrapolate,
  Easing: EasingNode,
  isConfigured,
};
