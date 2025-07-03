// Web-compatible Platform utilities
import { Platform as RNPlatform } from 'react-native';

// Enhanced Platform object for web compatibility
export const Platform = {
  ...RNPlatform,
  OS: RNPlatform.OS,
  Version: RNPlatform.Version,
  
  // Web-specific additions
  select: (obj) => {
    if (RNPlatform.OS === 'web') {
      return obj.web || obj.default || obj.native;
    }
    return obj[RNPlatform.OS] || obj.default || obj.native;
  },
  
  isTV: false,
  isTesting: process.env.NODE_ENV === 'test',
  
  // Additional web-specific methods
  isWeb: RNPlatform.OS === 'web',
  isMobile: RNPlatform.OS === 'ios' || RNPlatform.OS === 'android',
  isNative: RNPlatform.OS !== 'web',
};

export default Platform;
