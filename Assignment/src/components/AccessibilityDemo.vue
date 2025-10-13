<template>
  <div class="container-fluid mt-4 accessibility-demo">
    <!-- Skip to main content link -->
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <!-- Header -->
    <header role="banner">
      <div class="row">
        <div class="col-12">
          <h1 class="mb-4" tabindex="-1">
            <i class="bi bi-universal-access-circle me-2" aria-hidden="true"></i>
            <span>Accessibility Features</span>
          </h1>
          <p class="lead" role="doc-subtitle">
            WCAG 2.1 AA Compliant - Enhanced user experience for everyone
          </p>
        </div>
      </div>
    </header>

    <!-- Accessibility Controls Panel -->
    <section class="card mb-4 shadow-sm" aria-labelledby="controls-heading" role="region">
      <div class="card-header bg-primary text-white">
        <h2 id="controls-heading" class="h5 mb-0">
          <i class="bi bi-sliders me-2" aria-hidden="true"></i>
          Accessibility Controls
        </h2>
      </div>
      <div class="card-body">
        <div class="row g-3">
          <!-- Font Size Controls -->
          <div class="col-md-6">
            <fieldset>
              <legend class="h6">Font Size</legend>
              <div class="btn-group" role="group" aria-label="Font size controls">
                <button
                  @click="decreaseFontSize"
                  class="btn btn-outline-secondary"
                  :disabled="fontSize <= config.fontSize.min"
                  aria-label="Decrease font size"
                  title="Decrease font size (Alt + -)"
                >
                  <i class="bi bi-dash-circle" aria-hidden="true"></i>
                  <span class="ms-1">A-</span>
                </button>
                <button
                  @click="resetFontSize"
                  class="btn btn-outline-secondary"
                  aria-label="Reset font size to default"
                  title="Reset font size (Alt + 0)"
                >
                  <span>{{ fontSize }}px</span>
                </button>
                <button
                  @click="increaseFontSize"
                  class="btn btn-outline-secondary"
                  :disabled="fontSize >= config.fontSize.max"
                  aria-label="Increase font size"
                  title="Increase font size (Alt + +)"
                >
                  <i class="bi bi-plus-circle" aria-hidden="true"></i>
                  <span class="ms-1">A+</span>
                </button>
              </div>
              <div class="form-text">
                Current size: {{ fontSize }}px (Min: {{ config.fontSize.min }}px, Max:
                {{ config.fontSize.max }}px)
              </div>
            </fieldset>
          </div>

          <!-- High Contrast Toggle -->
          <div class="col-md-6">
            <fieldset>
              <legend class="h6">Display Mode</legend>
              <div class="form-check form-switch">
                <input
                  class="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="highContrastToggle"
                  v-model="highContrastEnabled"
                  @change="toggleHighContrast"
                  aria-describedby="highContrastHelp"
                />
                <label class="form-check-label" for="highContrastToggle">
                  High Contrast Mode
                  <span v-if="highContrastEnabled" class="badge bg-success ms-2">ON</span>
                  <span v-else class="badge bg-secondary ms-2">OFF</span>
                </label>
              </div>
              <div id="highContrastHelp" class="form-text">
                Increases contrast for better visibility (Alt + C)
              </div>
            </fieldset>
          </div>

          <!-- Theme Selector -->
          <div class="col-md-6">
            <fieldset>
              <legend class="h6">Color Theme</legend>
              <select
                v-model="currentTheme"
                @change="changeTheme"
                class="form-select"
                aria-label="Select color theme"
              >
                <option value="default">Default</option>
                <option value="highContrast">High Contrast (Light)</option>
                <option value="darkHighContrast">High Contrast (Dark)</option>
              </select>
              <div class="form-text">Choose a theme that works best for you</div>
            </fieldset>
          </div>

          <!-- Reduced Motion -->
          <div class="col-md-6">
            <fieldset>
              <legend class="h6">Animation</legend>
              <div class="form-check form-switch">
                <input
                  class="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="reducedMotionToggle"
                  v-model="reducedMotionEnabled"
                  @change="toggleReducedMotion"
                  aria-describedby="reducedMotionHelp"
                />
                <label class="form-check-label" for="reducedMotionToggle"> Reduce Motion </label>
              </div>
              <div id="reducedMotionHelp" class="form-text">
                Minimizes animations for users sensitive to motion
              </div>
            </fieldset>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <main id="main-content" tabindex="-1" role="main">
      <!-- WCAG Features -->
      <section class="mb-4" aria-labelledby="features-heading">
        <h2 id="features-heading" class="mb-3">
          <i class="bi bi-check-circle me-2" aria-hidden="true"></i>
          WCAG 2.1 AA Features Implemented
        </h2>

        <div class="row g-3">
          <div class="col-md-6 col-lg-4" v-for="feature in features" :key="feature.id">
            <article class="card h-100 feature-card" role="article">
              <div class="card-body">
                <h3 class="h5 card-title">
                  <i :class="feature.icon" class="me-2" aria-hidden="true"></i>
                  {{ feature.title }}
                </h3>
                <p class="card-text">{{ feature.description }}</p>
                <div class="mt-2">
                  <span class="badge bg-success" aria-label="Status: Implemented">
                    <i class="bi bi-check-lg" aria-hidden="true"></i>
                    Implemented
                  </span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- Keyboard Shortcuts -->
      <section class="card mb-4" aria-labelledby="shortcuts-heading">
        <div class="card-header bg-info text-white">
          <h2 id="shortcuts-heading" class="h5 mb-0">
            <i class="bi bi-keyboard me-2" aria-hidden="true"></i>
            Keyboard Shortcuts
          </h2>
        </div>
        <div class="card-body">
          <table class="table table-hover" role="table" aria-describedby="shortcuts-heading">
            <caption class="sr-only">
              Available keyboard shortcuts for navigation and accessibility controls
            </caption>
            <thead>
              <tr>
                <th scope="col">Shortcut</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(action, shortcut) in shortcuts" :key="shortcut">
                <td>
                  <kbd>{{ shortcut }}</kbd>
                </td>
                <td>{{ action }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Live Announcements Demo -->
      <section class="card mb-4" aria-labelledby="announcements-heading">
        <div class="card-header bg-warning text-dark">
          <h2 id="announcements-heading" class="h5 mb-0">
            <i class="bi bi-megaphone me-2" aria-hidden="true"></i>
            Screen Reader Announcements
          </h2>
        </div>
        <div class="card-body">
          <p>Test screen reader announcements by clicking the buttons below:</p>
          <div class="btn-group mb-3" role="group" aria-label="Announcement test buttons">
            <button @click="testPoliteAnnouncement" class="btn btn-outline-primary">
              Test Polite Announcement
            </button>
            <button @click="testAssertiveAnnouncement" class="btn btn-outline-danger">
              Test Assertive Announcement
            </button>
          </div>

          <div v-if="announcements.length > 0" class="mt-3">
            <h3 class="h6">Recent Announcements:</h3>
            <ul class="list-group" role="list">
              <li
                v-for="announcement in announcements"
                :key="announcement.id"
                class="list-group-item"
                role="listitem"
              >
                <span class="badge bg-secondary me-2">{{ announcement.priority }}</span>
                {{ announcement.message }}
                <small class="text-muted ms-2">
                  {{ formatTime(announcement.timestamp) }}
                </small>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Accessibility Test Form -->
      <section class="card mb-4" aria-labelledby="form-heading">
        <div class="card-header bg-success text-white">
          <h2 id="form-heading" class="h5 mb-0">
            <i class="bi bi-card-checklist me-2" aria-hidden="true"></i>
            Accessible Form Example
          </h2>
        </div>
        <div class="card-body">
          <form @submit.prevent="handleSubmit" novalidate>
            <!-- Name Input -->
            <div class="mb-3">
              <label for="userName" class="form-label">
                Name <span class="text-danger" aria-label="required">*</span>
              </label>
              <input
                type="text"
                class="form-control"
                id="userName"
                v-model="formData.name"
                :aria-invalid="formErrors.name ? 'true' : 'false'"
                :aria-describedby="formErrors.name ? 'nameError' : 'nameHelp'"
                required
              />
              <div id="nameHelp" class="form-text" v-if="!formErrors.name">
                Enter your full name
              </div>
              <div
                id="nameError"
                class="invalid-feedback d-block"
                v-if="formErrors.name"
                role="alert"
              >
                <i class="bi bi-exclamation-triangle me-1" aria-hidden="true"></i>
                {{ formErrors.name }}
              </div>
            </div>

            <!-- Email Input -->
            <div class="mb-3">
              <label for="userEmail" class="form-label">
                Email <span class="text-danger" aria-label="required">*</span>
              </label>
              <input
                type="email"
                class="form-control"
                id="userEmail"
                v-model="formData.email"
                :aria-invalid="formErrors.email ? 'true' : 'false'"
                :aria-describedby="formErrors.email ? 'emailError' : 'emailHelp'"
                required
              />
              <div id="emailHelp" class="form-text" v-if="!formErrors.email">
                We'll never share your email with anyone else
              </div>
              <div
                id="emailError"
                class="invalid-feedback d-block"
                v-if="formErrors.email"
                role="alert"
              >
                <i class="bi bi-exclamation-triangle me-1" aria-hidden="true"></i>
                {{ formErrors.email }}
              </div>
            </div>

            <!-- Checkbox -->
            <div class="mb-3">
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  id="agreeTerms"
                  v-model="formData.agree"
                  :aria-invalid="formErrors.agree ? 'true' : 'false'"
                  :aria-describedby="formErrors.agree ? 'agreeError' : null"
                />
                <label class="form-check-label" for="agreeTerms">
                  I agree to the terms and conditions
                  <span class="text-danger" aria-label="required">*</span>
                </label>
                <div
                  id="agreeError"
                  class="invalid-feedback d-block"
                  v-if="formErrors.agree"
                  role="alert"
                >
                  <i class="bi bi-exclamation-triangle me-1" aria-hidden="true"></i>
                  {{ formErrors.agree }}
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              <span v-if="isSubmitting">
                <span
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                <span>Submitting...</span>
              </span>
              <span v-else>Submit Form</span>
            </button>
          </form>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="mt-5 pt-3 border-top" role="contentinfo">
      <p class="text-muted text-center">
        <i class="bi bi-info-circle me-2" aria-hidden="true"></i>
        This page implements WCAG 2.1 AA accessibility standards
      </p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import accessibilityService from '../services/accessibilityService.js'
import accessibilityConfig from '../config/accessibility.js'

// Configuration
const config = accessibilityConfig

// Accessibility state
const fontSize = accessibilityService.fontSize
const currentTheme = accessibilityService.currentTheme
const highContrastEnabled = accessibilityService.highContrastEnabled
const reducedMotionEnabled = accessibilityService.reducedMotionEnabled
const announcements = accessibilityService.announcements

// Features list
const features = ref([
  {
    id: 1,
    title: 'Keyboard Navigation',
    description: 'Full keyboard support with visible focus indicators and logical tab order',
    icon: 'bi bi-keyboard',
  },
  {
    id: 2,
    title: 'Screen Reader Support',
    description: 'ARIA labels, roles, and live regions for screen reader compatibility',
    icon: 'bi bi-soundwave',
  },
  {
    id: 3,
    title: 'High Contrast Mode',
    description: 'Multiple high contrast themes for users with visual impairments',
    icon: 'bi bi-brightness-high',
  },
  {
    id: 4,
    title: 'Adjustable Font Size',
    description: 'User-controlled font size from 12px to 24px',
    icon: 'bi bi-fonts',
  },
  {
    id: 5,
    title: 'Reduced Motion',
    description: 'Respects prefers-reduced-motion setting for motion-sensitive users',
    icon: 'bi bi-pause-circle',
  },
  {
    id: 6,
    title: 'Focus Management',
    description: 'Proper focus trapping in modals and logical focus flow',
    icon: 'bi bi-bullseye',
  },
  {
    id: 7,
    title: 'Color Contrast',
    description: 'WCAG AA compliant color contrast ratios (4.5:1 minimum)',
    icon: 'bi bi-palette',
  },
  {
    id: 8,
    title: 'Skip Links',
    description: 'Skip to main content links for keyboard and screen reader users',
    icon: 'bi bi-skip-forward',
  },
  {
    id: 9,
    title: 'Form Validation',
    description: 'Clear error messages with ARIA live regions and proper labeling',
    icon: 'bi bi-check2-square',
  },
])

// Keyboard shortcuts
const shortcuts = computed(() => accessibilityService.getKeyboardShortcuts())

// Form state
const formData = ref({
  name: '',
  email: '',
  agree: false,
})

const formErrors = ref({})
const isSubmitting = ref(false)

// Methods
const increaseFontSize = () => {
  accessibilityService.increaseFontSize()
}

const decreaseFontSize = () => {
  accessibilityService.decreaseFontSize()
}

const resetFontSize = () => {
  accessibilityService.resetFontSize()
}

const toggleHighContrast = () => {
  accessibilityService.toggleHighContrast()
}

const changeTheme = () => {
  accessibilityService.applyTheme(currentTheme.value)
}

const toggleReducedMotion = () => {
  accessibilityService.applyReducedMotion(reducedMotionEnabled.value)
}

const testPoliteAnnouncement = () => {
  accessibilityService.announce(
    'This is a polite announcement. It will not interrupt the screen reader.',
    'polite',
  )
}

const testAssertiveAnnouncement = () => {
  accessibilityService.announce(
    'This is an assertive announcement. It will interrupt the screen reader.',
    'assertive',
  )
}

const formatTime = (timestamp) => {
  return timestamp.toLocaleTimeString()
}

const handleSubmit = () => {
  formErrors.value = {}

  // Validate
  if (!formData.value.name.trim()) {
    formErrors.value.name = 'Name is required'
  }

  if (!formData.value.email.trim()) {
    formErrors.value.email = 'Email is required'
  } else if (!/\S+@\S+\.\S+/.test(formData.value.email)) {
    formErrors.value.email = 'Please enter a valid email address'
  }

  if (!formData.value.agree) {
    formErrors.value.agree = 'You must agree to the terms and conditions'
  }

  // Check if there are errors
  if (Object.keys(formErrors.value).length > 0) {
    accessibilityService.announce(
      'Form has errors. Please correct them and try again.',
      'assertive',
    )
    return
  }

  // Submit
  isSubmitting.value = true
  setTimeout(() => {
    isSubmitting.value = false
    accessibilityService.announce('Form submitted successfully!', 'polite')
    // Reset form
    formData.value = { name: '', email: '', agree: false }
  }, 2000)
}

// Keyboard shortcuts handler
const handleKeyboardShortcuts = (e) => {
  if (e.altKey) {
    switch (e.key) {
      case '1':
        e.preventDefault()
        accessibilityService.skipToMain()
        break
      case '+':
      case '=':
        e.preventDefault()
        increaseFontSize()
        break
      case '-':
        e.preventDefault()
        decreaseFontSize()
        break
      case '0':
        e.preventDefault()
        resetFontSize()
        break
      case 'c':
      case 'C':
        e.preventDefault()
        toggleHighContrast()
        break
    }
  }
}

// Lifecycle
onMounted(() => {
  accessibilityService.restorePreferences()
  window.addEventListener('keydown', handleKeyboardShortcuts)
  accessibilityService.announce('Accessibility demo page loaded', 'polite')
  console.log('✅ Accessibility Demo component mounted')
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboardShortcuts)
})
</script>

<style scoped>
/* Skip link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 9999;
}

.skip-link:focus {
  top: 0;
}

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Feature cards */
.feature-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.feature-card:focus-within {
  outline: 3px solid var(--bs-primary);
  outline-offset: 2px;
}

/* Reduced motion */
:global(body.reduced-motion) .feature-card {
  transition: none;
}

:global(body.reduced-motion) .feature-card:hover {
  transform: none;
}

/* High contrast mode */
:global(body.high-contrast) {
  background: var(--a11y-background);
  color: var(--a11y-text);
}

:global(body.high-contrast) .card {
  border-color: var(--a11y-border);
  border-width: 2px;
}

:global(body.high-contrast) .btn {
  border-width: 2px;
}

/* Focus visible */
*:focus-visible {
  outline: 3px solid var(--bs-primary);
  outline-offset: 2px;
}

/* Keyboard shortcut styling */
kbd {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 3px;
  padding: 2px 6px;
  font-family: monospace;
  font-size: 0.9em;
}

/* Loading spinner */
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
  border-width: 0.2em;
}

/* Responsive font size */
@media (max-width: 768px) {
  h1 {
    font-size: 1.75rem;
  }

  h2 {
    font-size: 1.5rem;
  }
}
</style>



