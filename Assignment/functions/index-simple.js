/* eslint-disable no-undef */
/**
 * Simplified Firebase Cloud Functions - Core Features Only
 *
 * This file contains only the essential serverless functions needed
 * for the basic operation of the web application.
 */

const functions = require('firebase-functions')
const admin = require('firebase-admin')

// Initialize Firebase Admin SDK
admin.initializeApp()

// ============================================================================
// CORE FUNCTION 1: User Profile Creation (Required)
// ============================================================================

/**
 * Automatically creates user profile when user registers
 * This is essential for the application to work properly
 */
exports.createUserProfile = functions.auth.user().onCreate(async (user) => {
  try {
    const { uid, email, displayName } = user

    await admin
      .firestore()
      .collection('users')
      .doc(uid)
      .set({
        uid,
        email,
        displayName: displayName || 'New User',
        role: 'user',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLogin: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true,
      })

    functions.logger.info(`User profile created for ${email}`, { uid })
    return { success: true, uid }
  } catch (error) {
    functions.logger.error('Error creating user profile:', error)
    throw error
  }
})

// ============================================================================
// CORE FUNCTION 2: User Statistics (Required for Profile page)
// ============================================================================

/**
 * Get user statistics for profile page
 * This is called from the frontend Profile component
 */
exports.getUserStats = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
    }

    const userId = context.auth.uid

    // Get user document
    const userDoc = await admin.firestore().collection('users').doc(userId).get()
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found')
    }

    const userData = userDoc.data()

    // Get user's recipes count
    const recipesSnapshot = await admin
      .firestore()
      .collection('recipes')
      .where('authorId', '==', userId)
      .get()

    const stats = {
      recipesCreated: recipesSnapshot.size,
      memberSince: userData.createdAt,
      lastLogin: userData.lastLogin,
      isActive: userData.isActive || true,
      role: userData.role || 'user',
    }

    return { success: true, stats }
  } catch (error) {
    functions.logger.error('Error getting user stats:', error)
    throw error
  }
})

// ============================================================================
// CORE FUNCTION 3: Health Check (Required for monitoring)
// ============================================================================

/**
 * Simple health check endpoint
 * Used to verify that Cloud Functions are working
 */
exports.healthCheck = functions.https.onRequest((req, res) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Firebase Cloud Functions',
    version: '1.0.0',
    functions: {
      createUserProfile: 'active',
      getUserStats: 'active',
    },
  }

  functions.logger.info('Health check performed')
  res.status(200).json(healthStatus)
})


