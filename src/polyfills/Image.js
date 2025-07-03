// Image polyfill for React Native web
import { Image as RNImage } from 'react-native';

// Re-export the React Native web Image component
export default RNImage;

// Add any additional web-specific image functionality if needed
export const ImageBackground = RNImage;
