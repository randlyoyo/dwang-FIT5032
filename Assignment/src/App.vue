<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { authMiddleware } from './middleware/auth.js'

const router = useRouter()

// Use ref to force reactive updates
const authState = ref(0)

const currentUser = computed(() => {
  // Depend on authState to trigger recalculation
  authState.value
  return authMiddleware.getCurrentUser()
})

const isAuthenticated = computed(() => {
  // Depend on authState to trigger recalculation
  authState.value
  return authMiddleware.isAuthenticated()
})

const isAdmin = computed(() => {
  // Depend on authState to trigger recalculation
  authState.value
  const adminStatus = authMiddleware.isAdmin()
  const currentUser = authMiddleware.getCurrentUser()
  console.log('App.vue - isAdmin check:', {
    adminStatus,
    userRole: currentUser?.role,
    currentUser,
  })
  return adminStatus
})

// Force update authentication state
const refreshAuthState = () => {
  authState.value++
}

// Accessibility feature state - add keyboard control and reading functions
const accessibilityState = ref({
  accessibilityMode: false, // Main accessibility mode switch
  textToSpeech: false, // Text-to-speech function
  keyboardNavigation: false, // Keyboard navigation function
})

// Keyboard navigation state
const keyboardNavState = ref({
  currentIndex: -1,
  focusableElements: [],
  isActive: false,
})

// Text-to-speech function
const speechSynthesis = ref(null)
const isSpeaking = ref(false)

// Toggle accessibility mode - simplified version
const toggleAccessibilityMode = () => {
  accessibilityState.value.accessibilityMode = !accessibilityState.value.accessibilityMode

  if (accessibilityState.value.accessibilityMode) {
    // Enable accessibility mode
    enableAccessibilityMode()
  } else {
    // Disable accessibility mode
    disableAccessibilityMode()
  }

  // Save to localStorage
  localStorage.setItem('accessibility-mode', accessibilityState.value.accessibilityMode.toString())

  // Screen reader announcement
  announceToScreenReader(
    accessibilityState.value.accessibilityMode
      ? 'Accessibility mode enabled'
      : 'Accessibility mode disabled',
  )
}

// Enable accessibility mode - add keyboard control and reading functions
const enableAccessibilityMode = () => {
  // Enable all accessibility features
  accessibilityState.value.textToSpeech = true
  accessibilityState.value.keyboardNavigation = true

  // Apply CSS classes
  document.body.classList.add('large-text', 'high-contrast', 'keyboard-nav', 'focus-indicator')

  // Initialize keyboard navigation
  initializeKeyboardNavigation()

  // Initialize text-to-speech
  initializeTextToSpeech()

  // Save settings
  localStorage.setItem('accessibility-large-text', 'true')
  localStorage.setItem('accessibility-high-contrast', 'true')
  localStorage.setItem('accessibility-text-to-speech', 'true')
  localStorage.setItem('accessibility-keyboard-navigation', 'true')
}

// Disable accessibility mode - add keyboard control and reading functions
const disableAccessibilityMode = () => {
  // Disable all accessibility features
  accessibilityState.value.textToSpeech = false
  accessibilityState.value.keyboardNavigation = false

  // Remove CSS classes
  document.body.classList.remove('large-text', 'high-contrast', 'keyboard-nav', 'focus-indicator')

  // Stop text-to-speech
  stopTextToSpeech()

  // Disable keyboard navigation
  disableKeyboardNavigation()

  // Clear settings
  localStorage.removeItem('accessibility-large-text')
  localStorage.removeItem('accessibility-high-contrast')
  localStorage.removeItem('accessibility-text-to-speech')
  localStorage.removeItem('accessibility-keyboard-navigation')
}

// Text-to-speech function
const initializeTextToSpeech = () => {
  if ('speechSynthesis' in window) {
    speechSynthesis.value = window.speechSynthesis
    console.log('Text-to-speech initialized')
  }
}

const startTextToSpeech = () => {
  if (speechSynthesis.value && !isSpeaking.value) {
    const text = document.body.innerText || document.body.textContent || ''
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.8
    utterance.pitch = 1
    utterance.volume = 0.8

    utterance.onstart = () => {
      isSpeaking.value = true
    }

    utterance.onend = () => {
      isSpeaking.value = false
    }

    speechSynthesis.value.speak(utterance)
  }
}

const stopTextToSpeech = () => {
  if (speechSynthesis.value) {
    speechSynthesis.value.cancel()
    isSpeaking.value = false
  }
}

// Keyboard navigation function
const initializeKeyboardNavigation = () => {
  keyboardNavState.value.isActive = true
  updateFocusableElements()

  // Set initial focus
  if (keyboardNavState.value.focusableElements.length > 0) {
    keyboardNavState.value.currentIndex = 0
    const firstElement = keyboardNavState.value.focusableElements[0]
    firstElement.classList.add('keyboard-focus')
  }

  // Add keyboard event listener
  document.addEventListener('keydown', handleKeyboardNavigation)

  console.log(
    'Keyboard navigation initialized with',
    keyboardNavState.value.focusableElements.length,
    'focusable elements',
  )
}

const disableKeyboardNavigation = () => {
  keyboardNavState.value.isActive = false
  document.removeEventListener('keydown', handleKeyboardNavigation)

  // Remove all focus indicators
  document.querySelectorAll('.keyboard-focus').forEach((el) => {
    el.classList.remove('keyboard-focus')
  })
}

const updateFocusableElements = () => {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[role="button"]',
    '[role="link"]',
    '[role="menuitem"]',
    '[role="tab"]',
    '.nav-link',
    '.dropdown-item',
    '.btn',
    '.form-control',
    '.form-select',
  ]

  keyboardNavState.value.focusableElements = Array.from(
    document.querySelectorAll(focusableSelectors.join(', ')),
  ).filter((el) => {
    const style = window.getComputedStyle(el)
    const rect = el.getBoundingClientRect()
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      rect.width > 0 &&
      rect.height > 0 &&
      !el.hasAttribute('disabled')
    )
  })

  console.log('Updated focusable elements:', keyboardNavState.value.focusableElements.length)
}

const handleKeyboardNavigation = (event) => {
  if (!keyboardNavState.value.isActive) return

  const { key } = event
  console.log('Keyboard navigation key pressed:', key)

  // Arrow key navigation
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
    event.preventDefault()
    event.stopPropagation()

    const currentIndex = keyboardNavState.value.currentIndex
    const elements = keyboardNavState.value.focusableElements
    let newIndex = currentIndex

    switch (key) {
      case 'ArrowDown':
      case 'ArrowRight':
        newIndex = currentIndex < elements.length - 1 ? currentIndex + 1 : 0
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        newIndex = currentIndex > 0 ? currentIndex - 1 : elements.length - 1
        break
    }

    console.log('Navigating from index', currentIndex, 'to', newIndex)

    if (newIndex !== currentIndex && elements.length > 0) {
      // Remove current focus indicator
      if (currentIndex >= 0 && elements[currentIndex]) {
        elements[currentIndex].classList.remove('keyboard-focus')
      }

      // Add new focus indicator
      keyboardNavState.value.currentIndex = newIndex
      const targetElement = elements[newIndex]

      if (targetElement) {
        targetElement.classList.add('keyboard-focus')
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' })

        // Force focus to element
        targetElement.focus()

        // Read element content
        if (accessibilityState.value.textToSpeech && speechSynthesis.value) {
          const text =
            targetElement.textContent ||
            targetElement.getAttribute('aria-label') ||
            targetElement.getAttribute('title') ||
            targetElement.getAttribute('alt') ||
            ''
          if (text.trim()) {
            speechSynthesis.value.cancel() // Stop previous reading
            const utterance = new SpeechSynthesisUtterance(text.trim())
            utterance.rate = 0.8
            utterance.pitch = 1
            utterance.volume = 0.8
            speechSynthesis.value.speak(utterance)
          }
        }

        console.log(
          'Focused element:',
          targetElement.tagName,
          targetElement.textContent?.substring(0, 50),
        )
      }
    }
  }

  // Enter key to activate element
  if (key === 'Enter' && keyboardNavState.value.currentIndex >= 0) {
    event.preventDefault()
    event.stopPropagation()

    const targetElement =
      keyboardNavState.value.focusableElements[keyboardNavState.value.currentIndex]
    if (targetElement) {
      console.log('Activating element:', targetElement)
      targetElement.click()
    }
  }

  // Space key to activate element (for buttons)
  if (key === ' ' && keyboardNavState.value.currentIndex >= 0) {
    event.preventDefault()
    event.stopPropagation()

    const targetElement =
      keyboardNavState.value.focusableElements[keyboardNavState.value.currentIndex]
    if (
      targetElement &&
      (targetElement.tagName === 'BUTTON' || targetElement.getAttribute('role') === 'button')
    ) {
      console.log('Activating button:', targetElement)
      targetElement.click()
    }
  }

  // Escape key to exit keyboard navigation
  if (key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    disableKeyboardNavigation()
    announceToScreenReader('Keyboard navigation disabled')
  }

  // R key to start/stop reading
  if (key === 'r' || key === 'R') {
    event.preventDefault()
    event.stopPropagation()
    if (accessibilityState.value.textToSpeech) {
      if (isSpeaking.value) {
        stopTextToSpeech()
        announceToScreenReader('Reading stopped')
      } else {
        startTextToSpeech()
        announceToScreenReader('Reading started')
      }
    }
  }
}

// Announce message to screen reader
const announceToScreenReader = (message) => {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', 'polite')
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

onMounted(() => {
  // Basic authentication check
  if (isAuthenticated.value) {
    console.log('User is authenticated')
  }

  // Load saved accessibility settings
  loadAccessibilitySettings()

  // Listen for authentication state changes
  setInterval(() => {
    refreshAuthState()
  }, 1000)
})

// Load accessibility settings - support keyboard control and reading functions
const loadAccessibilitySettings = () => {
  const accessibilityMode = localStorage.getItem('accessibility-mode') === 'true'
  const textToSpeech = localStorage.getItem('accessibility-text-to-speech') === 'true'
  const keyboardNavigation = localStorage.getItem('accessibility-keyboard-navigation') === 'true'
  const largeText = localStorage.getItem('accessibility-large-text') === 'true'
  const highContrast = localStorage.getItem('accessibility-high-contrast') === 'true'

  if (accessibilityMode) {
    accessibilityState.value.accessibilityMode = true
    accessibilityState.value.textToSpeech = textToSpeech
    accessibilityState.value.keyboardNavigation = keyboardNavigation
    document.body.classList.add('large-text', 'high-contrast', 'keyboard-nav', 'focus-indicator')

    if (textToSpeech) {
      initializeTextToSpeech()
    }
    if (keyboardNavigation) {
      initializeKeyboardNavigation()
    }
  } else {
    // For backward compatibility, if individual settings were saved without main mode
    if (largeText) {
      document.body.classList.add('large-text')
    }
    if (highContrast) {
      document.body.classList.add('high-contrast')
    }
    if (textToSpeech) {
      accessibilityState.value.textToSpeech = true
      initializeTextToSpeech()
    }
    if (keyboardNavigation) {
      accessibilityState.value.keyboardNavigation = true
      document.body.classList.add('keyboard-nav', 'focus-indicator')
      initializeKeyboardNavigation()
    }
  }
}

// This function is now handled directly by the Auth component
// const handleAuthentication = (user) => {
//   if (authMiddleware.login(user)) {
//     router.push({ name: 'Home' })
//   }
// }

const logout = async () => {
  try {
    await authMiddleware.logout()
    refreshAuthState() // Force update authentication state
    router.push({ name: 'Home' })
  } catch (error) {
    console.error('Logout error:', error)
    // Clear local state even if error occurs
    localStorage.removeItem('currentUser')
    refreshAuthState()
    router.push({ name: 'Home' })
  }
}
</script>

<template>
  <div id="app">
    <!-- Skip to main content link for screen readers -->
    <a href="#main-content" class="skip-to-main">Skip to main content</a>

    <!-- Navigation Bar -->
    <nav
      class="navbar navbar-expand-lg navbar-dark bg-dark"
      role="navigation"
      aria-label="Main navigation"
    >
      <div class="container">
        <router-link class="navbar-brand fw-bold d-flex align-items-center" to="/">
          <span class="brand-icon me-2 fs-4">🍽️</span>
          <span class="brand-text">Healthy Recipe Hub</span>
        </router-link>

        <!-- Mobile toggle button -->
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <div class="navbar-nav ms-auto">
            <router-link class="nav-link" to="/">Home</router-link>

            <!-- Logged in user display -->
            <template v-if="isAuthenticated">
              <router-link class="nav-link" to="/recipes">Recipes</router-link>
              <router-link class="nav-link" to="/store-locator">Find Stores</router-link>

              <!-- User info dropdown menu -->
              <div class="nav-item dropdown">
                <a
                  class="nav-link dropdown-toggle d-flex align-items-center user-menu"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i class="bi bi-person-circle me-1"></i>
                  {{ currentUser.fullName || currentUser.email }}
                  <span class="badge bg-light text-dark ms-2">{{ currentUser.role }}</span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end shadow">
                  <li>
                    <router-link class="dropdown-item" to="/email-center">
                      <i class="bi bi-envelope me-2"></i>{{ currentUser.email }}
                    </router-link>
                  </li>
                  <li><hr class="dropdown-divider" /></li>
                  <li>
                    <router-link class="dropdown-item" to="/profile">
                      <i class="bi bi-person me-2"></i>Profile
                    </router-link>
                  </li>
                  <li>
                    <router-link class="dropdown-item" to="/email-center">
                      <i class="bi bi-envelope-paper me-2"></i>Email Center
                    </router-link>
                  </li>
                  <li v-if="isAdmin">
                    <router-link class="dropdown-item" to="/admin">
                      <i class="bi bi-speedometer2 me-2"></i>Admin Dashboard
                    </router-link>
                  </li>
                  <li><hr class="dropdown-divider" /></li>
                  <li>
                    <a class="dropdown-item text-danger" href="#" @click.prevent="logout">
                      <i class="bi bi-box-arrow-right me-2"></i>Logout
                    </a>
                  </li>
                </ul>
              </div>
            </template>

            <!-- Not logged in user display -->
            <template v-else>
              <router-link
                class="btn btn-outline-light btn-sm me-2"
                :to="{ name: 'Auth', query: { mode: 'login' } }"
              >
                <i class="bi bi-box-arrow-in-right me-1"></i>Login
              </router-link>
              <router-link
                class="btn btn-light btn-sm"
                :to="{ name: 'Auth', query: { mode: 'register' } }"
              >
                <i class="bi bi-person-plus me-1"></i>Register
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main role="main" id="main-content">
      <router-view />
    </main>

    <!-- AI Quick Access Button (Fixed Bottom Right) -->
    <router-link
      to="/ai-assistant"
      class="ai-fab"
      role="button"
      aria-label="Open AI Recipe Assistant - Powered by Gemini"
      title="AI Recipe Assistant - Powered by Gemini"
    >
      <i class="bi bi-stars" aria-hidden="true"></i>
    </router-link>

    <!-- Footer -->
    <footer class="bg-dark text-white py-4 mt-5" role="contentinfo">
      <div class="container">
        <div class="row">
          <div class="col-12 text-center">
            <p class="mb-2">Healthy Recipe Hub - Share & Discover Delicious Healthy Recipes</p>
            <p class="small text-muted mb-3">
              <i class="bi bi-check-circle me-1"></i>
              WCAG 2.1 AA Compliant | Firebase Powered | Mapbox Integration
            </p>

            <!-- Accessibility Features - Main Button Only -->
            <div class="accessibility-features text-center">
              <!-- Main Accessibility Toggle Button -->
              <div class="mb-3">
                <button
                  class="btn btn-lg btn-outline-light accessibility-main-btn"
                  @click="toggleAccessibilityMode"
                  :aria-pressed="accessibilityState.accessibilityMode"
                  aria-describedby="accessibility-desc"
                >
                  <i class="bi bi-universal-access me-2" aria-hidden="true"></i>
                  {{
                    accessibilityState.accessibilityMode
                      ? 'Exit Accessibility Mode'
                      : 'Enter Accessibility Mode'
                  }}
                </button>
                <div id="accessibility-desc" class="sr-only">
                  Toggle accessibility mode with enhanced features
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Skip to main content link - only visible on keyboard focus */
.skip-to-main {
  position: absolute;
  top: -40px;
  left: 0;
  background: #1e7e34;
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  font-weight: bold;
  z-index: 9999;
  border-radius: 0 0 4px 0;
}

.skip-to-main:focus {
  top: 0;
  background: #1e7e34;
  color: white;
  outline: 3px solid #ffc107;
  outline-offset: 2px;
}

/* Brand text with sufficient contrast on dark background */
.brand-icon,
.brand-text {
  color: #5edb5e !important;
}

.navbar-brand:hover .brand-icon,
.navbar-brand:hover .brand-text {
  color: #6fff6f !important;
}

.hero-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #d1ecf1 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.hero-image {
  padding: 2rem;
}

.navbar-nav .nav-link.active {
  font-weight: 600;
  border-bottom: 2px solid white;
}

/* Button styles */
.btn-outline-light:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: white;
}

.btn-light:hover {
  background-color: #e9ecef;
  border-color: #dee2e6;
}

/* User dropdown styles */
.user-menu {
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

.user-menu:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.dropdown-menu {
  border: none;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  border-radius: 10px;
  padding: 0.5rem 0;
  margin-top: 0.5rem;
  min-width: 220px;
}

.dropdown-header {
  font-size: 0.875rem;
  color: #6c757d;
  padding: 0.5rem 1rem;
  margin-bottom: 0;
}

.dropdown-item {
  padding: 0.5rem 1rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  padding-left: 1.5rem;
}

.dropdown-item.text-danger:hover {
  background-color: #fff5f5;
  color: #dc3545 !important;
}

.dropdown-divider {
  margin: 0.5rem 0;
}

.badge {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

/* AI Floating Action Button (FAB) */
.ai-fab {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  z-index: 1000;
  transition: all 0.3s ease;
  text-decoration: none;
}

.ai-fab:hover {
  transform: translateY(-5px) scale(1.05) rotate(10deg);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  color: white;
}

.ai-fab:focus-visible {
  outline: 4px solid #667eea;
  outline-offset: 4px;
}

.ai-fab:active {
  transform: translateY(-2px) scale(1.02);
}

/* No auto-animation for AI button - only animate on hover */

/* Footer links */
footer a {
  transition: all 0.2s ease;
}

footer a:hover {
  text-decoration: underline !important;
  transform: translateX(3px);
}

/* Accessibility Features - Main Button Only */
.accessibility-features {
  margin-top: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Main Accessibility Button */
.accessibility-main-btn {
  font-size: 1.1rem;
  font-weight: 600;
  padding: 1rem 2rem;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  transition: all 0.3s ease;
  min-width: 300px;
}

.accessibility-main-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.accessibility-main-btn:focus {
  outline: 3px solid #ffc107;
  outline-offset: 3px;
}

.accessibility-main-btn:active {
  transform: translateY(0);
}

/* Screen Reader Only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* High Contrast Mode */
.high-contrast {
  filter: contrast(150%) brightness(120%);
}

.high-contrast .navbar {
  background-color: #000 !important;
  border-bottom: 2px solid #fff;
}

.high-contrast .btn {
  border-width: 2px;
  font-weight: bold;
}

.high-contrast .card {
  border: 2px solid #000;
  background-color: #fff;
  color: #000;
}

.high-contrast .text-muted {
  color: #000 !important;
  font-weight: bold;
}

/* Large Text Mode */
.large-text {
  font-size: 1.2em;
}

.large-text .navbar-brand {
  font-size: 1.5rem;
}

.large-text .nav-link {
  font-size: 1.1rem;
  padding: 0.75rem 1rem;
}

.large-text .btn {
  font-size: 1.1rem;
  padding: 0.75rem 1.5rem;
}

.large-text .card-title {
  font-size: 1.3rem;
}

.large-text .card-text {
  font-size: 1.1rem;
  line-height: 1.6;
}

.large-text .form-control {
  font-size: 1.1rem;
  padding: 0.75rem;
}

.large-text .form-label {
  font-size: 1.1rem;
  font-weight: 600;
}

/* Focus indicators for accessibility */
*:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

.btn:focus,
.nav-link:focus,
.dropdown-item:focus {
  outline: 3px solid #ffc107;
  outline-offset: 2px;
}

/* Accessibility Section Styling */
.accessibility-section {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.02);
}

.accessibility-section h7 {
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Status Indicators */
.accessibility-status .badge {
  font-size: 0.75rem;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
}

/* Reduced motion support - System preference */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .ai-fab:hover {
    transform: none;
  }

  .accessibility-btn:hover {
    transform: none;
  }
}

/* Reduced motion support - User preference */
.reduced-motion * {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}

.reduced-motion .ai-fab:hover {
  transform: none;
}

.reduced-motion .accessibility-btn:hover {
  transform: none;
}

.reduced-motion .dropdown-item:hover {
  padding-left: 1rem;
}

/* Enhanced focus indicators for WCAG compliance */
*:focus-visible {
  outline: 3px solid #007bff;
  outline-offset: 2px;
  border-radius: 2px;
}

.btn:focus-visible,
.nav-link:focus-visible,
.dropdown-item:focus-visible {
  outline: 3px solid #ffc107;
  outline-offset: 2px;
}

/* High contrast mode enhancements */
.high-contrast .accessibility-features {
  border: 2px solid #fff;
  background: #000;
}

.high-contrast .accessibility-btn {
  border: 2px solid #fff;
  font-weight: bold;
}

.high-contrast .accessibility-btn:hover {
  background: #fff;
  color: #000;
}

/* Large text mode enhancements */
.large-text .accessibility-features {
  font-size: 1.1em;
}

.large-text .accessibility-btn {
  font-size: 1.1em;
  padding: 0.8rem 1.2rem;
}

.large-text .accessibility-section h7 {
  font-size: 1rem;
}

/* Simplified focus indicator */
*:focus {
  outline: 2px solid #007bff !important;
  outline-offset: 2px !important;
}

/* Enhanced Large Text Mode */
.large-text {
  font-size: 1.3em !important;
}

.large-text .navbar-brand {
  font-size: 1.8rem !important;
}

.large-text .nav-link {
  font-size: 1.2rem !important;
  padding: 0.8rem 1.2rem !important;
}

.large-text .btn {
  font-size: 1.2rem !important;
  padding: 0.8rem 1.8rem !important;
}

.large-text .card-title {
  font-size: 1.5rem !important;
}

.large-text .card-text {
  font-size: 1.2rem !important;
  line-height: 1.7 !important;
}

.large-text .form-control {
  font-size: 1.2rem !important;
  padding: 0.8rem !important;
}

.large-text .form-label {
  font-size: 1.2rem !important;
  font-weight: 600 !important;
}

.large-text .accessibility-features {
  font-size: 1.2em !important;
}

.large-text .accessibility-main-btn {
  font-size: 1.3rem !important;
  padding: 1.2rem 2.5rem !important;
}

.large-text .accessibility-btn {
  font-size: 1.2em !important;
  padding: 0.9rem 1.4rem !important;
}

/* Keyboard navigation styles */
.keyboard-nav .keyboard-focus {
  outline: 3px solid #ffc107 !important;
  outline-offset: 3px !important;
  background-color: rgba(255, 193, 7, 0.1) !important;
  border-radius: 4px !important;
  box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.3) !important;
  position: relative !important;
}

.keyboard-nav .keyboard-focus::before {
  content: '🔍';
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ffc107;
  color: #000;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  z-index: 1000;
}

/* Focus indicator */
.focus-indicator *:focus {
  outline: 3px solid #007bff !important;
  outline-offset: 3px !important;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.3) !important;
}

.focus-indicator *:focus-visible {
  outline: 3px solid #28a745 !important;
  outline-offset: 3px !important;
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.3) !important;
}

/* Responsive adjustments */
/* Large tablets and small desktops */
@media (max-width: 992px) {
  .navbar-brand {
    font-size: 1.1rem;
  }

  .navbar-nav .nav-link {
    font-size: 0.9rem;
    padding: 0.5rem 0.8rem;
  }

  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

/* Tablets */
@media (max-width: 768px) {
  /* Navbar */
  .navbar-brand {
    font-size: 1rem;
  }

  .navbar-nav {
    margin-top: 1rem;
    width: 100%;
  }

  .navbar-nav .nav-link {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .navbar-nav .btn {
    width: 100%;
    margin: 0.5rem 0;
  }

  .dropdown-menu {
    width: 100%;
    position: static !important;
    transform: none !important;
    margin-top: 0.5rem;
  }

  /* AI FAB */
  .ai-fab {
    width: 55px;
    height: 55px;
    font-size: 26px;
    bottom: 20px;
    right: 20px;
  }

  /* Footer */
  footer {
    padding: 2rem 0 !important;
  }

  footer p {
    font-size: 0.9rem;
  }

  /* User menu badge */
  .user-menu .badge {
    display: block;
    margin-top: 0.25rem;
    margin-left: 0 !important;
  }
}

/* Mobile phones */
@media (max-width: 576px) {
  /* Navbar */
  .navbar {
    padding: 0.5rem 1rem;
  }

  .navbar-brand {
    font-size: 0.95rem;
  }

  .navbar-brand .fs-4 {
    font-size: 1.25rem !important;
  }

  .navbar-toggler {
    padding: 0.25rem 0.5rem;
    font-size: 1rem;
  }

  .navbar-nav .nav-link {
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
  }

  .navbar-nav .btn-sm {
    font-size: 0.85rem;
    padding: 0.5rem 1rem;
  }

  /* User dropdown */
  .user-menu {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }

  .dropdown-item {
    font-size: 0.9rem;
    padding: 0.6rem 1rem;
  }

  /* AI FAB */
  .ai-fab {
    width: 50px;
    height: 50px;
    font-size: 24px;
    bottom: 15px;
    right: 15px;
  }

  .ai-fab:hover {
    transform: translateY(-3px) scale(1.03);
  }

  /* Footer */
  footer {
    padding: 1.5rem 0 !important;
  }

  footer .mb-2 {
    font-size: 0.85rem;
    margin-bottom: 0.75rem !important;
  }

  footer .small {
    font-size: 0.75rem !important;
  }

  /* Container spacing */
  .container {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }

  /* Badges */
  .badge {
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
  }
}

/* Extra small phones */
@media (max-width: 375px) {
  .navbar-brand span {
    font-size: 0.85rem;
  }

  .navbar-brand .fs-4 {
    font-size: 1.1rem !important;
  }

  .ai-fab {
    width: 45px;
    height: 45px;
    font-size: 22px;
    bottom: 12px;
    right: 12px;
  }

  .dropdown-menu {
    min-width: 200px;
  }

  footer .mb-2 {
    font-size: 0.8rem;
  }

  footer .small {
    font-size: 0.7rem !important;
  }
}

/* Landscape orientation on mobile */
@media (max-height: 500px) and (orientation: landscape) {
  .ai-fab {
    width: 45px;
    height: 45px;
    font-size: 22px;
    bottom: 10px;
    right: 10px;
  }

  .navbar {
    padding: 0.3rem 1rem;
  }

  footer {
    padding: 1rem 0 !important;
  }
}
</style>
