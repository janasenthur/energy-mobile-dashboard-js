// Platform polyfill for React Native internal modules
// This resolves the "Can't resolve '../../Utilities/Platform'" errors

export default {
  OS: 'web',
  Version: 'unknown',
  
  select: (obj) => {
    return obj.web || obj.default || obj.native;
  },
  
  isTV: false,
  isTVOS: false,
  isTesting: false,
  
  // Additional methods that some React Native modules expect
  constants: {},
  
  // Backwards compatibility
  get constants() {
    return {};
  },
};

// Also export as named export for compatibility
export const Platform = {
  OS: 'web',
  Version: 'unknown',
  select: (obj) => obj.web || obj.default || obj.native,
  isTV: false,
  isTVOS: false,
  isTesting: false,
  constants: {},
};
