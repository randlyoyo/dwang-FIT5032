/**
 * Cloud Functions Service
 *
 * This service provides methods to interact with Firebase Cloud Functions
 * from the frontend application.
 */

import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions'
import app from '../config/firebase.js'

class CloudFunctionsService {
  constructor() {
    this.functions = getFunctions(app)

    // Connect to emulator in development
    if (import.meta.env.MODE === 'development' && import.meta.env.VITE_USE_FUNCTIONS_EMULATOR) {
      connectFunctionsEmulator(this.functions, 'localhost', 5001)
      console.log('Connected to Functions Emulator')
    }
  }

  /**
   * Get user statistics
   * @returns {Promise<Object>} User statistics
   */
  async getUserStats() {
    try {
      const getUserStatsFunction = httpsCallable(this.functions, 'getUserStats')
      const result = await getUserStatsFunction()

      return {
        success: true,
        data: result.data,
      }
    } catch (error) {
      console.error('Error getting user stats:', error)
      return {
        success: false,
        error: this.handleError(error),
      }
    }
  }

  /**
   * Send welcome email to user
   * @param {string} email - User email
   * @param {string} displayName - User display name
   * @returns {Promise<Object>} Result of email send
   */
  async sendWelcomeEmail(email, displayName) {
    try {
      const sendWelcomeEmailFunction = httpsCallable(this.functions, 'sendWelcomeEmail')
      const result = await sendWelcomeEmailFunction({ email, displayName })

      return {
        success: true,
        data: result.data,
      }
    } catch (error) {
      console.error('Error sending welcome email:', error)
      return {
        success: false,
        error: this.handleError(error),
      }
    }
  }

  /**
   * Process recipe data before saving
   * @param {Object} recipe - Recipe object
   * @returns {Promise<Object>} Processed recipe data
   */
  async processRecipeData(recipe) {
    try {
      const processRecipeFunction = httpsCallable(this.functions, 'processRecipeData')
      const result = await processRecipeFunction({ recipe })

      return {
        success: true,
        data: result.data,
      }
    } catch (error) {
      console.error('Error processing recipe:', error)
      return {
        success: false,
        error: this.handleError(error),
      }
    }
  }

  /**
   * Update user role (admin only)
   * @param {string} targetUserId - User ID to update
   * @param {string} newRole - New role to assign
   * @returns {Promise<Object>} Result of role update
   */
  async updateUserRole(targetUserId, newRole) {
    try {
      const updateRoleFunction = httpsCallable(this.functions, 'updateUserRole')
      const result = await updateRoleFunction({ targetUserId, newRole })

      return {
        success: true,
        data: result.data,
      }
    } catch (error) {
      console.error('Error updating user role:', error)
      return {
        success: false,
        error: this.handleError(error),
      }
    }
  }

  /**
   * Health check for cloud functions
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    try {
      // This is an HTTP function, not callable
      const response = await fetch(
        `${import.meta.env.VITE_FUNCTIONS_URL || 'https://us-central1-assignment-cfc8f.cloudfunctions.net'}/healthCheck`,
      )
      const data = await response.json()

      return {
        success: true,
        data,
      }
    } catch (error) {
      console.error('Error checking health:', error)
      return {
        success: false,
        error: 'Failed to check health status',
      }
    }
  }

  /**
   * Handle Firebase Cloud Functions errors
   * @param {Error} error - Error object
   * @returns {string} User-friendly error message
   */
  handleError(error) {
    if (error.code) {
      switch (error.code) {
        case 'unauthenticated':
          return 'You must be logged in to perform this action'
        case 'permission-denied':
          return 'You do not have permission to perform this action'
        case 'invalid-argument':
          return 'Invalid data provided'
        case 'deadline-exceeded':
          return 'Request timed out. Please try again'
        case 'unavailable':
          return 'Service temporarily unavailable. Please try again later'
        case 'internal':
          return error.message || 'An internal error occurred'
        default:
          return error.message || 'An unexpected error occurred'
      }
    }
    return error.message || 'An unexpected error occurred'
  }

  /**
   * Test all cloud functions
   * @returns {Promise<Object>} Test results
   */
  async testAllFunctions() {
    const results = {
      getUserStats: null,
      sendWelcomeEmail: null,
      healthCheck: null,
    }

    try {
      // Test getUserStats
      try {
        results.getUserStats = await this.getUserStats()
      } catch (error) {
        results.getUserStats = { success: false, error: error.message }
      }

      // Test sendWelcomeEmail (with dummy data)
      try {
        results.sendWelcomeEmail = await this.sendWelcomeEmail('test@example.com', 'Test User')
      } catch (error) {
        results.sendWelcomeEmail = { success: false, error: error.message }
      }

      // Test healthCheck
      try {
        results.healthCheck = await this.healthCheck()
      } catch (error) {
        results.healthCheck = { success: false, error: error.message }
      }

      return {
        success: true,
        results,
      }
    } catch (error) {
      console.error('Error testing functions:', error)
      return {
        success: false,
        error: error.message,
        results,
      }
    }
  }
}

// Create and export singleton instance
const cloudFunctionsService = new CloudFunctionsService()

export default cloudFunctionsService
