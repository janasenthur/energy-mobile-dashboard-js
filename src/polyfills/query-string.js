// Query string polyfill for web compatibility
// This fixes the "export 'stringify' was not found in 'query-string'" warnings

export const parse = (queryString, options = {}) => {
  if (!queryString || typeof queryString !== 'string') {
    return {};
  }
  
  // Remove leading ? if present
  const cleanQuery = queryString.replace(/^\?/, '');
  
  if (!cleanQuery) {
    return {};
  }
  
  const params = {};
  const pairs = cleanQuery.split('&');
  
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    if (key) {
      const decodedKey = decodeURIComponent(key);
      const decodedValue = value ? decodeURIComponent(value) : '';
      
      // Handle arrays (multiple values for same key)
      if (params[decodedKey]) {
        if (Array.isArray(params[decodedKey])) {
          params[decodedKey].push(decodedValue);
        } else {
          params[decodedKey] = [params[decodedKey], decodedValue];
        }
      } else {
        params[decodedKey] = decodedValue;
      }
    }
  }
  
  return params;
};

export const stringify = (object, options = {}) => {
  if (!object || typeof object !== 'object') {
    return '';
  }
  
  const pairs = [];
  
  for (const [key, value] of Object.entries(object)) {
    if (value === null || value === undefined) {
      continue;
    }
    
    const encodedKey = encodeURIComponent(key);
    
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== null && item !== undefined) {
          pairs.push(`${encodedKey}=${encodeURIComponent(String(item))}`);
        }
      }
    } else {
      pairs.push(`${encodedKey}=${encodeURIComponent(String(value))}`);
    }
  }
  
  return pairs.join('&');
};

// Default export for compatibility
export default {
  parse,
  stringify,
};
