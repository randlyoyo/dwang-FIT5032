/**
 * Cloud Functions Service
 *
 * This service handles all communication with Firebase Cloud Functions
 * Provides a clean interface for calling serverless functions from the frontend
 */

import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from '../config/firebase.js'
import { cloudFunctionsClient } from '../config/axios.js'

const functions = getFunctions(app)

// ============================================================================
// User Management Functions
// ============================================================================

/**
 * Get user statistics from Cloud Functions
 * @returns {Promise<Object>} User statistics
 */
export const getUserStats = async () => {
  try {
    const getUserStatsFunction = httpsCallable(functions, 'getUserStats')
    const result = await getUserStatsFunction()
    return result.data
  } catch (error) {
    console.error('Error getting user stats:', error)
    throw error
  }
}

/**
 * Send welcome email to user
 * @param {Object} data - Email data
 * @returns {Promise<Object>} Email result
 */
export const sendWelcomeEmail = async (data) => {
  try {
    const sendWelcomeEmailFunction = httpsCallable(functions, 'sendWelcomeEmail')
    const result = await sendWelcomeEmailFunction(data)
    return result.data
  } catch (error) {
    console.error('Error sending welcome email:', error)
    throw error
  }
}

/**
 * Update user role (admin only)
 * @param {Object} data - Role update data
 * @returns {Promise<Object>} Update result
 */
export const updateUserRole = async (data) => {
  try {
    const updateUserRoleFunction = httpsCallable(functions, 'updateUserRole')
    const result = await updateUserRoleFunction(data)
    return result.data
  } catch (error) {
    console.error('Error updating user role:', error)
    throw error
  }
}

// ============================================================================
// Recipe Management Functions
// ============================================================================

/**
 * Process recipe data on the server
 * @param {Object} data - Recipe data
 * @returns {Promise<Object>} Processed recipe
 */
export const processRecipeData = async (data) => {
  try {
    const processRecipeDataFunction = httpsCallable(functions, 'processRecipeData')
    const result = await processRecipeDataFunction(data)
    return result.data
  } catch (error) {
    console.error('Error processing recipe data:', error)
    throw error
  }
}

/**
 * Get recipe analytics
 * @param {string} recipeId - Recipe ID
 * @returns {Promise<Object>} Recipe analytics
 */
export const getRecipeAnalytics = async (recipeId) => {
  try {
    const getRecipeAnalyticsFunction = httpsCallable(functions, 'getRecipeAnalytics')
    const result = await getRecipeAnalyticsFunction({ recipeId })
    return result.data
  } catch (error) {
    console.error('Error getting recipe analytics:', error)
    throw error
  }
}

/**
 * Bulk process recipes (admin only)
 * @param {Object} data - Bulk processing data
 * @returns {Promise<Object>} Processing results
 */
export const bulkProcessRecipes = async (data) => {
  try {
    const bulkProcessRecipesFunction = httpsCallable(functions, 'bulkProcessRecipes')
    const result = await bulkProcessRecipesFunction(data)
    return result.data
  } catch (error) {
    console.error('Error bulk processing recipes:', error)
    throw error
  }
}

/**
 * Get recipe recommendations
 * @param {Object} data - Recommendation preferences
 * @returns {Promise<Object>} Recipe recommendations
 */
export const getRecipeRecommendations = async (data) => {
  try {
    const getRecipeRecommendationsFunction = httpsCallable(functions, 'sendRecipeRecommendations')
    const result = await getRecipeRecommendationsFunction(data)
    return result.data
  } catch (error) {
    console.error('Error getting recipe recommendations:', error)
    throw error
  }
}

// ============================================================================
// Health Check Function
// ============================================================================

/**
 * Check Cloud Functions health status
 * @returns {Promise<Object>} Health status
 */
export const checkCloudFunctionsHealth = async () => {
  try {
    const healthData = await cloudFunctionsClient.healthCheck()
    return healthData
  } catch (error) {
    console.error('Error checking Cloud Functions health:', error)
    throw error
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Handle Cloud Functions errors
 * @param {Error} error - Error object
 * @returns {Object} Formatted error
 */
export const handleCloudFunctionError = (error) => {
  if (error.code === 'functions/unauthenticated') {
    return {
      type: 'authentication',
      message: 'Please log in to use this feature',
      action: 'login',
    }
  } else if (error.code === 'functions/permission-denied') {
    return {
      type: 'permission',
      message: 'You do not have permission to perform this action',
      action: 'contact_admin',
    }
  } else if (error.code === 'functions/invalid-argument') {
    return {
      type: 'validation',
      message: error.message || 'Invalid input provided',
      action: 'check_input',
    }
  } else if (error.code === 'functions/not-found') {
    return {
      type: 'not_found',
      message: 'The requested resource was not found',
      action: 'refresh',
    }
  } else {
    return {
      type: 'server',
      message: error.message || 'An unexpected error occurred',
      action: 'retry',
    }
  }
}

/**
 * Test Cloud Functions connectivity
 * @returns {Promise<boolean>} Connection status
 */
export const testCloudFunctionsConnection = async () => {
  try {
    const healthData = await checkCloudFunctionsHealth()
    return healthData.status === 'healthy'
  } catch (error) {
    console.error('Cloud Functions connection test failed:', error)
    return false
  }
}

/**
 * Generic Cloud Functions caller using axios
 * @param {string} functionName - Name of the cloud function
 * @param {Object} data - Data to send to the function
 * @returns {Promise<Object>} Function result
 */
export const callCloudFunction = async (functionName, data = {}) => {
  try {
    const result = await cloudFunctionsClient.callFunction(functionName, data)
    return result
  } catch (error) {
    console.error(`Error calling cloud function ${functionName}:`, error)
    throw error
  }
}
