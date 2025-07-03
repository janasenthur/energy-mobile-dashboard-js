module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            // React Native web compatibility aliases
            'react-native-maps': './src/components/WebCompatibleMap.js',
            'react-native-vector-icons/MaterialIcons': './src/components/WebCompatibleIcons.js',
            'react-native-vector-icons/Ionicons': './src/components/WebCompatibleIcons.js',
            'react-native-vector-icons/FontAwesome': './src/components/WebCompatibleIcons.js',
            'react-native-vector-icons': './src/components/WebCompatibleIcons.js',
            '@react-native-vector-icons/material-design-icons': './src/components/WebCompatibleIcons.js',
            'react-native-gesture-handler': './src/components/WebCompatibleGestureHandler.js',
            'react-native-reanimated': './src/components/WebCompatibleReanimated.js',
            'react-native-svg': './src/components/WebCompatibleSVG.js',
            'react-native/Libraries/Utilities/Platform': './src/polyfills/Platform.js',
            'react-native-device-info': './src/utils/webCompatibleUtils.js',
            '@react-native-community/netinfo': './src/utils/webCompatibleUtils.js',
            'color': './src/polyfills/color.js',
            'query-string': './src/polyfills/query-string.js',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
