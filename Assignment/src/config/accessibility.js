/**
 * Accessibility Configuration
 * WCAG 2.1 AA Compliance
 */

export const accessibilityConfig = {
  // WCAG 2.1 AA Color Contrast Ratios
  colorContrast: {
    normalText: 4.5, // Minimum ratio for normal text
    largeText: 3, // Minimum ratio for large text (18pt+ or 14pt+ bold)
    uiComponents: 3, // Minimum ratio for UI components
  },

  // Keyboard Navigation Settings
  keyboard: {
    focusVisibleClass: 'focus-visible',
    skipLinkId: 'skip-to-main',
    trapFocusInModals: true,
    enableArrowKeyNavigation: true,
  },

  // Screen Reader Settings
  screenReader: {
    announcePageChanges: true,
    announceFormErrors: true,
    announceLoadingStates: true,
    liveRegionPoliteness: 'polite', // 'polite' | 'assertive'
  },

  // High Contrast Themes
  themes: {
    default: {
      name: 'Default',
      colors: {
        primary: '#198754',
        secondary: '#6c757d',
        background: '#ffffff',
        text: '#212529',
        border: '#dee2e6',
        focus: '#0d6efd',
      },
    },
    highContrast: {
      name: 'High Contrast',
      colors: {
        primary: '#000000',
        secondary: '#ffffff',
        background: '#ffffff',
        text: '#000000',
        border: '#000000',
        focus: '#ff0000',
      },
    },
    darkHighContrast: {
      name: 'Dark High Contrast',
      colors: {
        primary: '#ffffff',
        secondary: '#000000',
        background: '#000000',
        text: '#ffffff',
        border: '#ffffff',
        focus: '#ffff00',
      },
    },
  },

  // Font Size Settings
  fontSize: {
    min: 12,
    default: 16,
    max: 24,
    step: 2,
  },

  // Animation Settings
  animation: {
    respectPrefersReducedMotion: true,
    defaultDuration: 300, // milliseconds
    disableAnimations: false,
  },

  // Touch Target Sizes (WCAG 2.1 AA)
  touchTarget: {
    minSize: 44, // minimum 44x44 pixels
    recommended: 48, // recommended 48x48 pixels
  },
}

export default accessibilityConfig



