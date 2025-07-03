// BaseViewConfig polyfill for React Native internal modules

export default {
  uiViewClassName: 'RCTView',
  bubblingEventTypes: {},
  directEventTypes: {},
  validAttributes: {
    style: true,
    testID: true,
    accessible: true,
    accessibilityLabel: true,
    accessibilityHint: true,
    accessibilityRole: true,
    accessibilityState: true,
    accessibilityValue: true,
    onLayout: true,
    pointerEvents: true,
  },
};
