// DevToolsSettings polyfill
// This resolves React Native internal DevToolsSettings errors

export default {
  reload: () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  },
  
  openDebugger: () => {
    // No-op on web
  },
  
  toggleElementInspector: () => {
    // No-op on web
  },
  
  togglePerformanceMonitor: () => {
    // No-op on web
  },
  
  // Add any other DevToolsSettings methods that might be needed
  setIsShakeToShowDevMenuEnabled: () => {},
  setIsDebuggingRemotely: () => {},
  setIsProfilingEnabled: () => {},
};
