// Authentication middleware - provides secure authentication features, supports Firebase Auth
import firebaseAuthService from '../services/firebaseAuth.js'

export const authMiddleware = {
  // Check if user is authenticated (supports Firebase)
  isAuthenticated() {
    // First check Firebase authentication status
    if (firebaseAuthService.isAuthenticated()) {
      return true
    }

    // Fallback to local storage check
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null')
    return !!currentUser
  },

  // Get current user information (supports Firebase)
  getCurrentUser() {
    // Get user information from local storage (already saved complete information on login)
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null')
    console.log('authMiddleware.getCurrentUser - returning:', currentUser)
    return currentUser
  },

  // Check user role
  hasRole(requiredRole) {
    const currentUser = this.getCurrentUser()
    if (!currentUser) return false

    // Role hierarchy check
    const roleHierarchy = {
      guest: 0,
      user: 1,
      admin: 2,
    }

    const userLevel = roleHierarchy[currentUser.role] || 0
    const requiredLevel = roleHierarchy[requiredRole] || 0

    return userLevel >= requiredLevel
  },

  // Check if user is admin
  isAdmin() {
    return this.hasRole('admin')
  },

  // Check if user is regular user
  isUser() {
    return this.hasRole('user')
  },

  // Simplified login
  login(userData) {
    try {
      console.log('authMiddleware.login - received userData:', userData)

      // Validate user data
      if (!this.validateUserData(userData)) {
        console.error('authMiddleware.login - validation failed for:', userData)
        throw new Error('Invalid user data provided')
      }

      // Store user data
      localStorage.setItem('currentUser', JSON.stringify(userData))

      // Verify storage
      const stored = JSON.parse(localStorage.getItem('currentUser'))
      console.log('authMiddleware.login - stored userData:', stored)

      // Log login event
      this.logSecurityEvent('user_login', {
        username: userData.username,
        role: userData.role,
        timestamp: new Date().toISOString(),
      })

      return true
    } catch (error) {
      console.error('Login error:', error)
      this.logSecurityEvent('login_failed', {
        error: error.message,
        timestamp: new Date().toISOString(),
      })
      return false
    }
  },

  // Secure logout (supports Firebase)
  async logout() {
    const currentUser = this.getCurrentUser()
    if (currentUser) {
      // Log logout event
      this.logSecurityEvent('user_logout', {
        username: currentUser.username,
        role: currentUser.role,
        timestamp: new Date().toISOString(),
      })
    }

    // Firebase logout
    if (firebaseAuthService.isAuthenticated()) {
      try {
        await firebaseAuthService.signOut()
      } catch (error) {
        console.error('Firebase logout error:', error)
      }
    }

    // Clear local user data
    localStorage.removeItem('currentUser')

    // Clear other related data
    localStorage.removeItem('userPreferences')
    localStorage.removeItem('savedRecipes')
    localStorage.removeItem('favoriteRecipes')
  },

  // Update user activity time (simplified version)
  updateActivity() {
    // Simplified version, no complex activity tracking
    return true
  },

  // Validate user data
  validateUserData(userData) {
    if (!userData || typeof userData !== 'object') return false

    const requiredFields = ['username', 'email', 'role']
    for (const field of requiredFields) {
      if (!userData[field] || typeof userData[field] !== 'string') {
        return false
      }
    }

    // Validate role
    const validRoles = ['user', 'admin']
    if (!validRoles.includes(userData.role)) {
      return false
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userData.email)) {
      return false
    }

    return true
  },

  // Generate simple ID (simplified version)
  generateSessionId() {
    return 'user_' + Date.now()
  },

  // Log security event
  logSecurityEvent(eventType, data) {
    const securityLog = {
      eventType,
      data,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    }

    console.log('Security Event:', securityLog)

    // In a real application, this should be sent to a security log server
    // this.sendToSecurityServer(securityLog)
  },

  // Simplified session check
  isSessionValid() {
    const currentUser = this.getCurrentUser()
    return !!currentUser
  },

  // Simplified session refresh
  refreshSession() {
    const currentUser = this.getCurrentUser()
    if (currentUser) {
      this.updateActivity()
      return true
    }
    return false
  },

  // Firebase related helper methods
  // Send password reset email
  async sendPasswordReset(email) {
    try {
      const result = await firebaseAuthService.sendPasswordReset(email)
      return result
    } catch (error) {
      console.error('Password reset error:', error)
      return {
        success: false,
        error: 'Failed to send password reset email',
      }
    }
  },
}

// Permission check decorator
export const requireAuth = (to, from, next) => {
  if (!authMiddleware.isAuthenticated()) {
    next({ name: 'Auth', query: { redirect: to.fullPath } })
  } else {
    next()
  }
}

// Admin permission check decorator
export const requireAdmin = (to, from, next) => {
  if (!authMiddleware.isAdmin()) {
    next({ name: 'Home' })
  } else {
    next()
  }
}

// Role permission check decorator
export const requireRole = (role) => {
  return (to, from, next) => {
    if (!authMiddleware.hasRole(role)) {
      next({ name: 'Home' })
    } else {
      next()
    }
  }
}
