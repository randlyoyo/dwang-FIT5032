/**
 * Accessibility Service
 * Provides utilities for WCAG 2.1 AA compliance
 */

import { ref, watch } from 'vue'
import accessibilityConfig from '../config/accessibility.js'

class AccessibilityService {
  constructor() {
    this.currentTheme = ref('default')
    this.fontSize = ref(accessibilityConfig.fontSize.default)
    this.highContrastEnabled = ref(false)
    this.reducedMotionEnabled = ref(false)
    this.announcements = ref([])

    // Check user's system preferences
    this.checkSystemPreferences()

    // Watch for theme changes
    watch(this.currentTheme, (newTheme) => {
      this.applyTheme(newTheme)
    })

    // Watch for font size changes
    watch(this.fontSize, (newSize) => {
      this.applyFontSize(newSize)
    })
  }

  /**
   * Check system accessibility preferences
   */
  checkSystemPreferences() {
    // Check for prefers-reduced-motion
    if (window.matchMedia) {
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      this.reducedMotionEnabled.value = reducedMotionQuery.matches

      reducedMotionQuery.addEventListener('change', (e) => {
        this.reducedMotionEnabled.value = e.matches
        this.applyReducedMotion(e.matches)
      })
    }

    // Check for prefers-contrast
    if (window.matchMedia) {
      const highContrastQuery = window.matchMedia('(prefers-contrast: high)')
      if (highContrastQuery.matches) {
        this.enableHighContrast()
      }
    }

    // Check for prefers-color-scheme
    if (window.matchMedia) {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
      if (darkModeQuery.matches) {
        console.log('Dark mode preference detected')
      }
    }
  }

  /**
   * Apply a theme
   */
  applyTheme(themeName) {
    const theme = accessibilityConfig.themes[themeName]
    if (!theme) {
      console.error(`Theme "${themeName}" not found`)
      return
    }

    const root = document.documentElement

    // Apply theme colors as CSS variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--a11y-${key}`, value)
    })

    // Store preference
    localStorage.setItem('accessibility-theme', themeName)
    this.announce(`Theme changed to ${theme.name}`)

    console.log(`✅ Applied theme: ${theme.name}`)
  }

  /**
   * Enable high contrast mode
   */
  enableHighContrast() {
    this.highContrastEnabled.value = true
    this.currentTheme.value = 'highContrast'
    document.body.classList.add('high-contrast')
    this.announce('High contrast mode enabled')
  }

  /**
   * Disable high contrast mode
   */
  disableHighContrast() {
    this.highContrastEnabled.value = false
    this.currentTheme.value = 'default'
    document.body.classList.remove('high-contrast')
    this.announce('High contrast mode disabled')
  }

  /**
   * Toggle high contrast mode
   */
  toggleHighContrast() {
    if (this.highContrastEnabled.value) {
      this.disableHighContrast()
    } else {
      this.enableHighContrast()
    }
  }

  /**
   * Increase font size
   */
  increaseFontSize() {
    const newSize = Math.min(
      this.fontSize.value + accessibilityConfig.fontSize.step,
      accessibilityConfig.fontSize.max,
    )
    if (newSize !== this.fontSize.value) {
      this.fontSize.value = newSize
      this.announce(`Font size increased to ${newSize} pixels`)
    }
  }

  /**
   * Decrease font size
   */
  decreaseFontSize() {
    const newSize = Math.max(
      this.fontSize.value - accessibilityConfig.fontSize.step,
      accessibilityConfig.fontSize.min,
    )
    if (newSize !== this.fontSize.value) {
      this.fontSize.value = newSize
      this.announce(`Font size decreased to ${newSize} pixels`)
    }
  }

  /**
   * Reset font size to default
   */
  resetFontSize() {
    this.fontSize.value = accessibilityConfig.fontSize.default
    this.announce(`Font size reset to default`)
  }

  /**
   * Apply font size
   */
  applyFontSize(size) {
    document.documentElement.style.setProperty('--base-font-size', `${size}px`)
    localStorage.setItem('accessibility-font-size', size)
  }

  /**
   * Apply reduced motion
   */
  applyReducedMotion(enabled) {
    if (enabled) {
      document.body.classList.add('reduced-motion')
      this.announce('Reduced motion enabled')
    } else {
      document.body.classList.remove('reduced-motion')
      this.announce('Reduced motion disabled')
    }
  }

  /**
   * Skip to main content
   */
  skipToMain() {
    const mainContent = document.getElementById('main-content')
    if (mainContent) {
      mainContent.focus()
      mainContent.scrollIntoView({ behavior: 'smooth' })
      this.announce('Skipped to main content')
    }
  }

  /**
   * Announce message to screen readers
   */
  announce(message, priority = 'polite') {
    const announcement = {
      id: Date.now(),
      message,
      priority,
      timestamp: new Date(),
    }

    this.announcements.value.push(announcement)

    // Create live region if it doesn't exist
    let liveRegion = document.getElementById(`aria-live-${priority}`)
    if (!liveRegion) {
      liveRegion = document.createElement('div')
      liveRegion.id = `aria-live-${priority}`
      liveRegion.setAttribute('aria-live', priority)
      liveRegion.setAttribute('aria-atomic', 'true')
      liveRegion.className = 'sr-only'
      document.body.appendChild(liveRegion)
    }

    // Update live region
    liveRegion.textContent = message

    // Clear after a delay
    setTimeout(() => {
      liveRegion.textContent = ''
      this.announcements.value = this.announcements.value.filter((a) => a.id !== announcement.id)
    }, 3000)

    console.log(`📢 Announcement (${priority}): ${message}`)
  }

  /**
   * Focus trap for modals
   */
  trapFocus(element) {
    const focusableElements = element.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }

    element.addEventListener('keydown', handleTabKey)

    // Focus first element
    firstElement?.focus()

    // Return cleanup function
    return () => {
      element.removeEventListener('keydown', handleTabKey)
    }
  }

  /**
   * Check color contrast ratio
   */
  checkContrast(foreground, background) {
    const getLuminance = (color) => {
      const rgb = color.match(/\d+/g).map(Number)
      const [r, g, b] = rgb.map((c) => {
        c = c / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }

    const l1 = getLuminance(foreground)
    const l2 = getLuminance(background)
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)

    return {
      ratio: ratio.toFixed(2),
      aa: ratio >= 4.5,
      aaa: ratio >= 7,
    }
  }

  /**
   * Restore saved preferences
   */
  restorePreferences() {
    // Restore theme
    const savedTheme = localStorage.getItem('accessibility-theme')
    if (savedTheme && accessibilityConfig.themes[savedTheme]) {
      this.currentTheme.value = savedTheme
    }

    // Restore font size
    const savedFontSize = localStorage.getItem('accessibility-font-size')
    if (savedFontSize) {
      this.fontSize.value = parseInt(savedFontSize, 10)
    }

    console.log('✅ Accessibility preferences restored')
  }

  /**
   * Get keyboard shortcuts
   */
  getKeyboardShortcuts() {
    return {
      'Alt + 1': 'Skip to main content',
      'Alt + +': 'Increase font size',
      'Alt + -': 'Decrease font size',
      'Alt + 0': 'Reset font size',
      'Alt + C': 'Toggle high contrast',
      Esc: 'Close modal/dialog',
      Tab: 'Navigate forward',
      'Shift + Tab': 'Navigate backward',
      Enter: 'Activate link/button',
      Space: 'Activate button/checkbox',
      'Arrow Keys': 'Navigate within component',
    }
  }
}

export default new AccessibilityService()



