// webpack.config.js
const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: [
        // Add React Native modules that need transpilation
        'react-native-paper',
        'react-native-vector-icons',
        'react-native-reanimated',
        '@react-native-async-storage/async-storage',
        'react-native-gesture-handler',
        'react-native-svg',
      ],
    },
  }, argv);

  // Handle missing React Native modules on web with proper aliases
  config.resolve.alias = {
    ...config.resolve.alias,
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
    
    // Platform and utilities
    'react-native/Libraries/Utilities/Platform': path.resolve(__dirname, 'src/polyfills/Platform.js'),
    '../Utilities/Platform': path.resolve(__dirname, 'src/polyfills/Platform.js'),
    '../../Utilities/Platform': path.resolve(__dirname, 'src/polyfills/Platform.js'),
    '../../../Utilities/Platform': path.resolve(__dirname, 'src/polyfills/Platform.js'),
    
    // Image
    'react-native/Libraries/Image/Image': path.resolve(__dirname, 'src/polyfills/Image.js'),
    '../Image/Image': path.resolve(__dirname, 'src/polyfills/Image.js'),
    '../../Image/Image': path.resolve(__dirname, 'src/polyfills/Image.js'),
    
    // BackHandler
    'react-native/Libraries/Utilities/BackHandler': path.resolve(__dirname, 'src/polyfills/BackHandler.js'),
    '../Utilities/BackHandler': path.resolve(__dirname, 'src/polyfills/BackHandler.js'),
    
    // DevToolsSettings
    '../DevToolsSettings/DevToolsSettingsManager': path.resolve(__dirname, 'src/polyfills/DevToolsSettingsManager.js'),
    
    // BaseViewConfig
    './BaseViewConfig': path.resolve(__dirname, 'src/polyfills/BaseViewConfig.js'),
    '../NativeComponent/BaseViewConfig': path.resolve(__dirname, 'src/polyfills/BaseViewConfig.js'),
    
    // RCTNetworking
    './RCTNetworking': path.resolve(__dirname, 'src/polyfills/RCTNetworking.js'),
    
    // PlatformColorValueTypes
    './PlatformColorValueTypes': path.resolve(__dirname, 'src/polyfills/PlatformColorValueTypes.js'),
    
    // AccessibilityInfo
    '../Components/AccessibilityInfo/legacySendAccessibilityEvent': path.resolve(__dirname, 'src/polyfills/legacySendAccessibilityEvent.js'),
    
    // Color library
    'color': path.resolve(__dirname, 'src/polyfills/color.js'),
    
    // Query string library
    'query-string': path.resolve(__dirname, 'src/polyfills/query-string.js'),
    
    // Device info and other utilities
    'react-native-device-info': path.resolve(__dirname, 'src/utils/webCompatibleUtils.js'),
    '@react-native-community/netinfo': path.resolve(__dirname, 'src/utils/webCompatibleUtils.js'),
  };

  // Ignore problematic Node.js modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    fs: false,
    net: false,
    tls: false,
    crypto: false,
    stream: false,
    buffer: false,
    util: false,
    url: false,
    querystring: false,
    path: false,
    os: false,
    assert: false,
    constants: false,
    http: false,
    https: false,
    zlib: false,
  };

  // Add module rules for handling React Native components
  config.module.rules.push({
    test: /\.js$/,
    exclude: /node_modules\/(?!(react-native|@react-native|expo|@expo|react-navigation|@react-navigation))/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['babel-preset-expo'],
        plugins: [
          'react-native-web',
          ['module-resolver', {
            alias: {
              '^react-native$': 'react-native-web',
            },
          }],
        ],
      },
    },
  });

  // Suppress common React Native web warnings and errors
  config.ignoreWarnings = [
    /Failed to parse source map/,
    /Critical dependency: the request of a dependency is an expression/,
    /Can't resolve 'react-native-vector-icons'/,
    /Can't resolve 'react-native-reanimated'/,
    /Can't resolve 'react-native-gesture-handler'/,
    /Module not found.*react-native-/,
    /Could not find MIME for Buffer/,
    /export.*was not found in/,
  ];

  // Handle asset loading issues
  config.module.rules.push({
    test: /\.(png|jpe?g|gif|svg|ico)$/,
    use: [
      {
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'assets/',
          publicPath: '/assets/',
        },
      },
    ],
  });

  return config;
};
