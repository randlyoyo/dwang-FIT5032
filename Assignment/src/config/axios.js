/**
 * Axios Configuration
 *
 * Centralized HTTP client configuration for the application
 * Handles authentication, error handling, and request/response interceptors
 */

import axios from 'axios'

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL:
    process.env.NODE_ENV === 'production'
      ? 'https://us-central1-assignment-cfc8f.cloudfunctions.net'
      : 'http://localhost:5001/assignment-cfc8f/us-central1',
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add authentication token
apiClient.interceptors.request.use(
  (config) => {
    // Get current user token from localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
    if (currentUser.token) {
      config.headers.Authorization = `Bearer ${currentUser.token}`
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() }

    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`)
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  },
)

// Response interceptor - Handle responses and errors
apiClient.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = new Date() - response.config.metadata?.startTime
    console.log(`Request completed in ${duration}ms: ${response.config.url}`)

    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Response data:', response.data)
    }

    return response
  },
  (error) => {
    // Calculate request duration for failed requests
    const duration = new Date() - error.config?.metadata?.startTime
    console.error(`Request failed after ${duration}ms: ${error.config?.url}`)

    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      console.error(`Server error ${status}:`, data)

      // Handle specific error codes
      switch (status) {
        case 401:
          console.error('Authentication failed - redirecting to login')
          // Clear user data and redirect to login
          localStorage.removeItem('currentUser')
          window.location.href = '/auth?mode=login'
          break
        case 403:
          console.error('Access forbidden - insufficient permissions')
          break
        case 404:
          console.error('Resource not found')
          break
        case 500:
          console.error('Internal server error')
          break
        default:
          console.error(`Unexpected server error: ${status}`)
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network error - no response received:', error.request)
    } else {
      // Something else happened
      console.error('Request setup error:', error.message)
    }

    return Promise.reject(error)
  },
)

// Cloud Functions specific methods
export const cloudFunctionsClient = {
  // Health check endpoint
  async healthCheck() {
    try {
      const response = await apiClient.get('/healthCheck')
      return response.data
    } catch (error) {
      console.error('Health check failed:', error)
      throw error
    }
  },

  // Generic callable function caller
  async callFunction(functionName, data = {}) {
    try {
      const response = await apiClient.post(`/${functionName}`, data)
      return response.data
    } catch (error) {
      console.error(`Cloud function ${functionName} failed:`, error)
      throw error
    }
  },
}

// Export the configured axios instance
export default apiClient

// Export individual methods for convenience
export const { get, post, put, delete: del } = apiClient



