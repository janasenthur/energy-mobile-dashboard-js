// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Web-specific configurations
config.resolver.platforms = ['web', 'native', 'ios', 'android'];

// Handle React Native modules that don't work on web
config.resolver.alias = {
  ...(config.resolver.alias || {}),
  // Maps and Location
  'react-native-maps': path.resolve(__dirname, 'src/components/WebCompatibleMap.js'),
  
  // Vector Icons
  'react-native-vector-icons/MaterialIcons': path.resolve(__dirname, 'src/components/WebCompatibleIcons.js'),
  'react-native-vector-icons/Ionicons': path.resolve(__dirname, 'src/components/WebCompatibleIcons.js'),
  'react-native-vector-icons/FontAwesome': path.resolve(__dirname, 'src/components/WebCompatibleIcons.js'),
  'react-native-vector-icons': path.resolve(__dirname, 'src/components/WebCompatibleIcons.js'),
  '@react-native-vector-icons/material-design-icons': path.resolve(__dirname, 'src/components/WebCompatibleIcons.js'),
  
  // Gesture Handler
  'react-native-gesture-handler': path.resolve(__dirname, 'src/components/WebCompatibleGestureHandler.js'),
  
  // Reanimated
  'react-native-reanimated': path.resolve(__dirname, 'src/components/WebCompatibleReanimated.js'),
  
  // SVG
  'react-native-svg': path.resolve(__dirname, 'src/components/WebCompatibleSVG.js'),
  
  // Platform and utilities with all possible paths
  'react-native/Libraries/Utilities/Platform': path.resolve(__dirname, 'src/polyfills/Platform.js'),
  '../Utilities/Platform': path.resolve(__dirname, 'src/polyfills/Platform.js'),
  '../../Utilities/Platform': path.resolve(__dirname, 'src/polyfills/Platform.js'),
  '../../../Utilities/Platform': path.resolve(__dirname, 'src/polyfills/Platform.js'),
  
  // Other problematic internal modules
  '../DevToolsSettings/DevToolsSettingsManager': path.resolve(__dirname, 'src/polyfills/DevToolsSettingsManager.js'),
  './BaseViewConfig': path.resolve(__dirname, 'src/polyfills/BaseViewConfig.js'),
  './RCTNetworking': path.resolve(__dirname, 'src/polyfills/RCTNetworking.js'),
  './PlatformColorValueTypes': path.resolve(__dirname, 'src/polyfills/PlatformColorValueTypes.js'),
  '../Components/AccessibilityInfo/legacySendAccessibilityEvent': path.resolve(__dirname, 'src/polyfills/legacySendAccessibilityEvent.js'),
  '../Utilities/BackHandler': path.resolve(__dirname, 'src/polyfills/BackHandler.js'),
  '../../Image/Image': path.resolve(__dirname, 'src/polyfills/Image.js'),
  
  // Third-party library polyfills
  'color': path.resolve(__dirname, 'src/polyfills/color.js'),
  'query-string': path.resolve(__dirname, 'src/polyfills/query-string.js'),
};

// Exclude problematic modules on web
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Add support for additional file extensions
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'web.js',
  'web.ts',
  'web.tsx',
];

module.exports = config;
