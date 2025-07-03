// BackHandler polyfill for web
// React Native BackHandler doesn't exist on web, so we provide a no-op implementation

export default {
  addEventListener: (eventName, handler) => {
    // On web, we can listen to browser back button
    if (eventName === 'hardwareBackPress') {
      const handlePopState = () => {
        return handler();
      };
      
      window.addEventListener('popstate', handlePopState);
      
      return {
        remove: () => {
          window.removeEventListener('popstate', handlePopState);
        },
      };
    }
    
    return {
      remove: () => {},
    };
  },
  
  removeEventListener: (eventName, handler) => {
    // No-op on web
  },
  
  exitApp: () => {
    // Can't exit web app, but we can close the tab/window if allowed
    if (window.close) {
      window.close();
    }
  },
};
