// RCTNetworking polyfill for XMLHttpRequest
// This provides a fallback for React Native's networking layer

const RCTNetworking = {
  sendRequest: (method, trackingName, url, headers, data, responseType, incrementalUpdates, timeout, callback) => {
    // Use fetch API as fallback
    const fetchRequest = async () => {
      try {
        const response = await fetch(url, {
          method,
          headers,
          body: data,
        });
        
        const responseText = await response.text();
        callback(0, null, responseText, response.headers);
      } catch (error) {
        callback(1, error.message, null, null);
      }
    };
    
    fetchRequest();
  },
  
  abortRequest: (requestId) => {
    // No-op for web
  },
  
  clearCookies: (callback) => {
    // No-op for web
    callback();
  },
};

export default RCTNetworking;
