// Web-compatible SVG components
import React from 'react';
import { View, Text } from 'react-native';

// Base SVG component
export const Svg = ({ width = 100, height = 100, viewBox, children, style, ...props }) => (
  <View
    style={[
      {
        width: typeof width === 'string' ? width : `${width}px`,
        height: typeof height === 'string' ? height : `${height}px`,
        overflow: 'hidden',
      },
      style,
    ]}
    {...props}
  >
    {children}
  </View>
);

// Circle component
export const Circle = ({ cx = 0, cy = 0, r = 10, fill = '#000', stroke, strokeWidth, ...props }) => (
  <View
    style={{
      position: 'absolute',
      left: cx - r,
      top: cy - r,
      width: r * 2,
      height: r * 2,
      borderRadius: r,
      backgroundColor: fill,
      borderColor: stroke,
      borderWidth: strokeWidth || 0,
    }}
    {...props}
  />
);

// Rectangle component
export const Rect = ({ x = 0, y = 0, width = 10, height = 10, fill = '#000', stroke, strokeWidth, ...props }) => (
  <View
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width,
      height,
      backgroundColor: fill,
      borderColor: stroke,
      borderWidth: strokeWidth || 0,
    }}
    {...props}
  />
);

// Line component
export const Line = ({ x1 = 0, y1 = 0, x2 = 10, y2 = 10, stroke = '#000', strokeWidth = 1, ...props }) => {
  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
  
  return (
    <View
      style={{
        position: 'absolute',
        left: x1,
        top: y1,
        width: length,
        height: strokeWidth,
        backgroundColor: stroke,
        transformOrigin: '0 0',
        transform: [{ rotate: `${angle}deg` }],
      }}
      {...props}
    />
  );
};

// Path component (simplified)
export const Path = ({ d, fill = '#000', stroke, strokeWidth, ...props }) => (
  <View
    style={{
      backgroundColor: fill,
      borderColor: stroke,
      borderWidth: strokeWidth || 0,
    }}
    {...props}
  >
    <Text style={{ fontSize: 12, color: '#666' }}>SVG Path</Text>
  </View>
);

// Text component
export const SvgText = ({ x = 0, y = 0, children, fontSize = 12, fill = '#000', ...props }) => (
  <Text
    style={{
      position: 'absolute',
      left: x,
      top: y - fontSize,
      fontSize,
      color: fill,
    }}
    {...props}
  >
    {children}
  </Text>
);

// Group component
export const G = ({ children, transform, ...props }) => (
  <View style={{ position: 'relative' }} {...props}>
    {children}
  </View>
);

// Defs component
export const Defs = ({ children, ...props }) => (
  <View style={{ display: 'none' }} {...props}>
    {children}
  </View>
);

// LinearGradient component
export const LinearGradient = ({ children, ...props }) => (
  <View {...props}>
    {children}
  </View>
);

// Stop component
export const Stop = ({ offset, stopColor, stopOpacity, ...props }) => null;

// Polygon component
export const Polygon = ({ points, fill = '#000', stroke, strokeWidth, ...props }) => (
  <View
    style={{
      backgroundColor: fill,
      borderColor: stroke,
      borderWidth: strokeWidth || 0,
    }}
    {...props}
  >
    <Text style={{ fontSize: 10, color: '#666' }}>Polygon</Text>
  </View>
);

// Polyline component
export const Polyline = ({ points, fill = 'none', stroke = '#000', strokeWidth = 1, ...props }) => (
  <View
    style={{
      backgroundColor: fill !== 'none' ? fill : 'transparent',
      borderColor: stroke,
      borderWidth: strokeWidth,
    }}
    {...props}
  >
    <Text style={{ fontSize: 10, color: '#666' }}>Polyline</Text>
  </View>
);

// Ellipse component
export const Ellipse = ({ cx = 0, cy = 0, rx = 10, ry = 5, fill = '#000', stroke, strokeWidth, ...props }) => (
  <View
    style={{
      position: 'absolute',
      left: cx - rx,
      top: cy - ry,
      width: rx * 2,
      height: ry * 2,
      borderRadius: rx,
      backgroundColor: fill,
      borderColor: stroke,
      borderWidth: strokeWidth || 0,
    }}
    {...props}
  />
);

// Export all components
export default {
  Svg,
  Circle,
  Rect,
  Line,
  Path,
  Text: SvgText,
  G,
  Defs,
  LinearGradient,
  Stop,
  Polygon,
  Polyline,
  Ellipse,
};
