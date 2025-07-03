// legacySendAccessibilityEvent polyfill
// This resolves React Native internal accessibility errors

export default function legacySendAccessibilityEvent(reactTag, eventType, eventData) {
  // On web, we can use the Web Accessibility API
  if (typeof window !== 'undefined' && window.document) {
    const element = window.document.querySelector(`[data-reactroot] [data-react-tag="${reactTag}"]`);
    
    if (element) {
      switch (eventType) {
        case 'focus':
          element.focus();
          break;
        case 'click':
          element.click();
          break;
        case 'announcement':
          // Create a live region for announcements
          const announcement = window.document.createElement('div');
          announcement.setAttribute('aria-live', 'polite');
          announcement.setAttribute('aria-atomic', 'true');
          announcement.style.position = 'absolute';
          announcement.style.left = '-10000px';
          announcement.style.width = '1px';
          announcement.style.height = '1px';
          announcement.style.overflow = 'hidden';
          announcement.textContent = eventData?.announcement || '';
          
          window.document.body.appendChild(announcement);
          
          // Remove after a short delay
          setTimeout(() => {
            if (announcement.parentNode) {
              announcement.parentNode.removeChild(announcement);
            }
          }, 1000);
          break;
        default:
          // No-op for unknown event types
          break;
      }
    }
  }
}
