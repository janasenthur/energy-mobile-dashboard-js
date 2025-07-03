import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FF8C00', // Orange color from mockups
    accent: '#FFA500',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#333333',
    placeholder: '#999999',
    disabled: '#CCCCCC',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    onSurface: '#000000',
    notification: '#FF3B30',
  },
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'System',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100',
    },
  },
};

export const colors = {
  primary: '#FF8C00',
  secondary: '#FFA500',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  light: '#F8F9FA',
  dark: '#343A40',
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    100: '#F8F9FA',
    200: '#E9ECEF',
    300: '#DEE2E6',
    400: '#CED4DA',
    500: '#ADB5BD',
    600: '#6C757D',
    700: '#495057',
    800: '#343A40',
    900: '#212529',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Typography styles
export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 34,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 30,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: 22,
  },
  caption: {
    fontSize: 14,
    fontWeight: 'normal',
    lineHeight: 18,
  },
  small: {
    fontSize: 12,
    fontWeight: 'normal',
    lineHeight: 16,
  },
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 50,
};
