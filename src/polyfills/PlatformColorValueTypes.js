// PlatformColorValueTypes polyfill
// This resolves React Native internal color processing errors

export const normalizeColorObject = (color) => {
  if (typeof color === 'string') {
    return color;
  }
  
  if (typeof color === 'object' && color !== null) {
    // Handle React Native color objects
    if (color.semantic) {
      return color.semantic;
    }
    if (color.dynamic) {
      return color.dynamic.light || color.dynamic.dark || '#000000';
    }
    if (color.resource_paths) {
      return '#000000'; // Default fallback
    }
  }
  
  return color;
};

export const processColorObject = (color) => {
  return normalizeColorObject(color);
};
