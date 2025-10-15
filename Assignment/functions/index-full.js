/* eslint-disable no-undef */
/**
 * Firebase Cloud Functions for Assignment Project
 *
 * This file contains serverless functions that run on Google Cloud Platform.
 * These functions handle server-side operations like user management,
 * data processing, and automated notifications.
 */

const functions = require('firebase-functions')
const admin = require('firebase-admin')

// Initialize Firebase Admin SDK
admin.initializeApp()

// ============================================================================
// FUNCTION 1: User Management - onCreate Trigger
// ============================================================================

/**
 * Automatically runs when a new user is created in Firebase Auth
 * Creates a user profile document in Firestore with default settings
 */
exports.createUserProfile = functions.auth.user().onCreate(async (user) => {
  try {
    const { uid, email, displayName, photoURL } = user

    // Create user profile in Firestore
    await admin
      .firestore()
      .collection('users')
      .doc(uid)
      .set({
        uid,
        email,
        displayName: displayName || 'New User',
        photoURL: photoURL || null,
        role: 'user', // Default role
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLogin: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true,
        preferences: {
          emailNotifications: true,
          theme: 'light',
        },
      })

    functions.logger.info(`User profile created for ${email}`, { uid })
    return { success: true, uid }
  } catch (error) {
    functions.logger.error('Error creating user profile:', error)
    throw new functions.https.HttpsError('internal', 'Failed to create user profile')
  }
})

// ============================================================================
// FUNCTION 2: User Management - onDelete Trigger
// ============================================================================

/**
 * Automatically runs when a user is deleted from Firebase Auth
 * Cleans up associated data (user profile, recipes, etc.)
 */
exports.cleanupUserData = functions.auth.user().onDelete(async (user) => {
  try {
    const { uid, email } = user
    const batch = admin.firestore().batch()

    // Delete user profile
    const userRef = admin.firestore().collection('users').doc(uid)
    batch.delete(userRef)

    // Delete user's recipes
    const recipesSnapshot = await admin
      .firestore()
      .collection('recipes')
      .where('authorId', '==', uid)
      .get()

    recipesSnapshot.forEach((doc) => {
      batch.delete(doc.ref)
    })

    await batch.commit()

    functions.logger.info(`User data cleaned up for ${email}`, { uid })
    return { success: true, uid }
  } catch (error) {
    functions.logger.error('Error cleaning up user data:', error)
    throw new functions.https.HttpsError('internal', 'Failed to cleanup user data')
  }
})

// ============================================================================
// FUNCTION 3: HTTP Callable - Get User Statistics
// ============================================================================

/**
 * Callable function to get user statistics
 * Can be called from the frontend with authentication
 */
exports.getUserStats = functions.https.onCall(async (data, context) => {
  try {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to get statistics',
      )
    }

    const { uid } = context.auth

    // Get user's recipe count
    const recipesSnapshot = await admin
      .firestore()
      .collection('recipes')
      .where('authorId', '==', uid)
      .get()

    // Get user's login history
    const userDoc = await admin.firestore().collection('users').doc(uid).get()
    const userData = userDoc.data()

    const stats = {
      recipesCreated: recipesSnapshot.size,
      memberSince: userData?.createdAt?.toDate() || null,
      lastLogin: userData?.lastLogin?.toDate() || null,
      isActive: userData?.isActive || false,
      role: userData?.role || 'user',
    }

    functions.logger.info(`Stats retrieved for user ${uid}`)
    return { success: true, stats }
  } catch (error) {
    functions.logger.error('Error getting user stats:', error)
    throw new functions.https.HttpsError('internal', error.message)
  }
})

// ============================================================================
// FUNCTION 4: HTTP Callable - Send Welcome Email
// ============================================================================

/**
 * Sends a welcome email to new users
 * Demonstrates integration with external email services
 */
exports.sendWelcomeEmail = functions.https.onCall(async (data, context) => {
  try {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
    }

    const { email, displayName } = data

    if (!email) {
      throw new functions.https.HttpsError('invalid-argument', 'Email is required')
    }

    // In a real application, you would integrate with an email service here
    // For demonstration, we'll just log it
    const emailData = {
      to: email,
      subject: 'Welcome to Healthy Recipe Hub!',
      body: `
        Hello ${displayName || 'there'}!

        Welcome to Healthy Recipe Hub! We're excited to have you join our community
        of health-conscious food lovers.

        Here's what you can do:
        - Browse thousands of healthy recipes
        - Share your own favorite recipes
        - Connect with other food enthusiasts
        - Get personalized recipe recommendations

        Happy cooking!

        The Healthy Recipe Hub Team
      `,
      timestamp: new Date().toISOString(),
    }

    functions.logger.info(`Welcome email sent to ${email}`, emailData)

    return {
      success: true,
      message: 'Welcome email sent successfully',
      emailData,
    }
  } catch (error) {
    functions.logger.error('Error sending welcome email:', error)
    throw new functions.https.HttpsError('internal', error.message)
  }
})

// ============================================================================
// FUNCTION 5: HTTP Callable - Process Recipe Data
// ============================================================================

/**
 * Processes and validates recipe data before saving
 * Calculates nutrition scores and tags
 */
exports.processRecipeData = functions.https.onCall(async (data, context) => {
  try {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
    }

    const { recipe } = data

    if (!recipe || !recipe.name || !recipe.ingredients) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid recipe data')
    }

    // Process recipe data
    const processedRecipe = {
      ...recipe,
      authorId: context.auth.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      // Calculate nutrition score (simplified)
      nutritionScore: calculateNutritionScore(recipe),
      // Generate tags
      tags: generateTags(recipe),
      // Validate and clean data
      ingredients: recipe.ingredients.filter((i) => i.trim().length > 0),
      instructions: recipe.instructions.filter((i) => i.trim().length > 0),
      // Add status
      status: 'published',
      likes: 0,
      views: 0,
    }

    functions.logger.info(`Recipe processed: ${recipe.name}`)

    return {
      success: true,
      processedRecipe,
    }
  } catch (error) {
    functions.logger.error('Error processing recipe:', error)
    throw new functions.https.HttpsError('internal', error.message)
  }
})

// ============================================================================
// FUNCTION 6: Scheduled - Daily User Activity Report
// ============================================================================

/**
 * Scheduled function that runs daily to generate activity reports
 * Demonstrates cron-style serverless functions
 */
exports.dailyActivityReport = functions.pubsub
  .schedule('0 0 * * *') // Runs every day at midnight
  .timeZone('Australia/Melbourne')
  .onRun(async () => {
    try {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(0, 0, 0, 0)

      // Get user activity from yesterday
      const usersSnapshot = await admin
        .firestore()
        .collection('users')
        .where('lastLogin', '>=', admin.firestore.Timestamp.fromDate(yesterday))
        .get()

      // Get recipes created yesterday
      const recipesSnapshot = await admin
        .firestore()
        .collection('recipes')
        .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(yesterday))
        .get()

      const report = {
        date: yesterday.toISOString(),
        activeUsers: usersSnapshot.size,
        newRecipes: recipesSnapshot.size,
        generatedAt: new Date().toISOString(),
      }

      // Save report to Firestore
      await admin.firestore().collection('reports').add(report)

      functions.logger.info('Daily activity report generated', report)

      return { success: true, report }
    } catch (error) {
      functions.logger.error('Error generating daily report:', error)
      return null
    }
  })

// ============================================================================
// FUNCTION 7: HTTP Callable - Admin User Management
// ============================================================================

/**
 * Admin function to update user roles and permissions
 * Only accessible by admin users
 */
exports.updateUserRole = functions.https.onCall(async (data, context) => {
  try {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
    }

    // Check if user is admin
    const adminDoc = await admin.firestore().collection('users').doc(context.auth.uid).get()
    const adminData = adminDoc.data()

    if (!adminData || adminData.role !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Only admins can update user roles')
    }

    const { targetUserId, newRole } = data

    if (!targetUserId || !newRole) {
      throw new functions.https.HttpsError('invalid-argument', 'User ID and role are required')
    }

    // Valid roles
    const validRoles = ['user', 'admin', 'moderator']
    if (!validRoles.includes(newRole)) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid role specified')
    }

    // Update user role
    await admin.firestore().collection('users').doc(targetUserId).update({
      role: newRole,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: context.auth.uid,
    })

    // Set custom claims for Firebase Auth
    await admin.auth().setCustomUserClaims(targetUserId, { role: newRole })

    functions.logger.info(`User role updated: ${targetUserId} -> ${newRole}`)

    return {
      success: true,
      message: `User role updated to ${newRole}`,
      targetUserId,
      newRole,
    }
  } catch (error) {
    functions.logger.error('Error updating user role:', error)
    throw new functions.https.HttpsError('internal', error.message)
  }
})

// ============================================================================
// FUNCTION 8: HTTP Callable - Recipe Analytics
// ============================================================================

/**
 * Get detailed analytics for recipes
 * Calculates views, likes, and popularity metrics
 */
exports.getRecipeAnalytics = functions.https.onCall(async (data, context) => {
  try {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
    }

    const { recipeId } = data
    if (!recipeId) {
      throw new functions.https.HttpsError('invalid-argument', 'Recipe ID is required')
    }

    // Get recipe data
    const recipeDoc = await admin.firestore().collection('recipes').doc(recipeId).get()
    if (!recipeDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Recipe not found')
    }

    const recipeData = recipeDoc.data()

    // Calculate analytics
    const analytics = {
      recipeId,
      name: recipeData.name || recipeData.title,
      views: recipeData.views || 0,
      likes: recipeData.likes || 0,
      rating: recipeData.rating || 0,
      nutritionScore: recipeData.nutritionScore || 0,
      createdAt: recipeData.createdAt,
      popularityScore: calculatePopularityScore(recipeData),
      healthScore: calculateHealthScore(recipeData),
    }

    functions.logger.info(`Analytics retrieved for recipe ${recipeId}`)
    return { success: true, analytics }
  } catch (error) {
    functions.logger.error('Error getting recipe analytics:', error)
    throw new functions.https.HttpsError('internal', error.message)
  }
})

// ============================================================================
// FUNCTION 9: HTTP Callable - Bulk Recipe Processing
// ============================================================================

/**
 * Process multiple recipes in batch
 * Useful for admin operations and data migration
 */
exports.bulkProcessRecipes = functions.https.onCall(async (data, context) => {
  try {
    // Check authentication and admin role
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
    }

    const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get()
    const userData = userDoc.data()

    if (!userData || userData.role !== 'admin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can bulk process recipes',
      )
    }

    const { operation, recipeIds } = data
    if (!operation || !recipeIds || !Array.isArray(recipeIds)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Operation and recipe IDs are required',
      )
    }

    const results = []
    const batch = admin.firestore().batch()

    for (const recipeId of recipeIds) {
      try {
        const recipeRef = admin.firestore().collection('recipes').doc(recipeId)
        const recipeDoc = await recipeRef.get()

        if (!recipeDoc.exists) {
          results.push({ recipeId, success: false, error: 'Recipe not found' })
          continue
        }

        const recipeData = recipeDoc.data()

        switch (operation) {
          case 'recalculateNutrition': {
            const nutritionScore = calculateNutritionScore(recipeData)
            batch.update(recipeRef, {
              nutritionScore,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            })
            results.push({ recipeId, success: true, nutritionScore })
            break
          }

          case 'regenerateTags': {
            const tags = generateTags(recipeData)
            batch.update(recipeRef, {
              tags,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            })
            results.push({ recipeId, success: true, tags })
            break
          }

          case 'updateStatus':
            batch.update(recipeRef, {
              status: 'published',
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            })
            results.push({ recipeId, success: true, status: 'published' })
            break

          default:
            results.push({ recipeId, success: false, error: 'Invalid operation' })
        }
      } catch (error) {
        results.push({ recipeId, success: false, error: error.message })
      }
    }

    await batch.commit()

    functions.logger.info(`Bulk operation ${operation} completed`, { processed: results.length })
    return { success: true, results, processed: results.length }
  } catch (error) {
    functions.logger.error('Error in bulk processing:', error)
    throw new functions.https.HttpsError('internal', error.message)
  }
})

// ============================================================================
// FUNCTION 10: HTTP Callable - Send Recipe Recommendations
// ============================================================================

/**
 * Send personalized recipe recommendations to users
 * Based on their preferences and history
 */
exports.sendRecipeRecommendations = functions.https.onCall(async (data, context) => {
  try {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
    }

    const { userId, preferences } = data
    const targetUserId = userId || context.auth.uid

    // Get user preferences (for future use)
    // const userDoc = await admin.firestore().collection('users').doc(targetUserId).get()

    // Get user's recipe history
    const userRecipesSnapshot = await admin
      .firestore()
      .collection('recipes')
      .where('createdBy', '==', targetUserId)
      .limit(10)
      .get()

    // Analyze user preferences
    const userCategories = userRecipesSnapshot.docs
      .map((doc) => doc.data().category)
      .filter(Boolean)
    const userTags = userRecipesSnapshot.docs.flatMap((doc) => doc.data().tags || [])

    // Get recommended recipes
    const recommendations = await getRecommendedRecipes(userCategories, userTags, preferences)

    // Send notification (in real app, this would be email/push notification)
    const notification = {
      userId: targetUserId,
      type: 'recipe_recommendations',
      title: 'New Recipe Recommendations',
      message: `We found ${recommendations.length} recipes you might like!`,
      recommendations: recommendations.slice(0, 5), // Top 5 recommendations
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    }

    // Save notification to Firestore
    await admin.firestore().collection('notifications').add(notification)

    functions.logger.info(`Recommendations sent to user ${targetUserId}`, {
      count: recommendations.length,
    })
    return { success: true, recommendations: recommendations.slice(0, 5) }
  } catch (error) {
    functions.logger.error('Error sending recommendations:', error)
    throw new functions.https.HttpsError('internal', error.message)
  }
})

// ============================================================================
// FUNCTION 11: HTTP Request - Health Check
// ============================================================================

/**
 * Simple HTTP endpoint for health checking
 * Returns status of cloud functions
 */
exports.healthCheck = functions.https.onRequest((req, res) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Firebase Cloud Functions',
    version: '2.0.0',
    functions: {
      createUserProfile: 'active',
      cleanupUserData: 'active',
      getUserStats: 'active',
      sendWelcomeEmail: 'active',
      processRecipeData: 'active',
      dailyActivityReport: 'scheduled',
      updateUserRole: 'active',
      getRecipeAnalytics: 'active',
      bulkProcessRecipes: 'active',
      sendRecipeRecommendations: 'active',
    },
  }

  functions.logger.info('Health check performed')
  res.status(200).json(healthStatus)
})

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate a simple nutrition score for a recipe
 * @param {Object} recipe - Recipe object
 * @returns {number} - Nutrition score (0-100)
 */
function calculateNutritionScore(recipe) {
  let score = 50 // Base score

  // Check for healthy keywords in ingredients
  const healthyKeywords = ['vegetable', 'fruit', 'whole grain', 'lean', 'low-fat', 'organic']
  const unhealthyKeywords = ['sugar', 'fried', 'processed', 'refined', 'artificial']

  const ingredientsText = recipe.ingredients.join(' ').toLowerCase()

  healthyKeywords.forEach((keyword) => {
    if (ingredientsText.includes(keyword)) {
      score += 5
    }
  })

  unhealthyKeywords.forEach((keyword) => {
    if (ingredientsText.includes(keyword)) {
      score -= 5
    }
  })

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score))
}

/**
 * Generate tags based on recipe content
 * @param {Object} recipe - Recipe object
 * @returns {Array} - Array of tags
 */
function generateTags(recipe) {
  const tags = []
  const content =
    `${recipe.name} ${recipe.ingredients.join(' ')} ${recipe.category || ''}`.toLowerCase()

  // Tag mappings
  const tagMappings = {
    vegetarian: ['vegetarian', 'veggie', 'plant-based'],
    vegan: ['vegan'],
    'gluten-free': ['gluten-free', 'gluten free'],
    healthy: ['healthy', 'nutritious', 'wholesome'],
    quick: ['quick', 'fast', '15 min', '20 min'],
    'low-carb': ['low-carb', 'low carb', 'keto'],
    protein: ['protein', 'high-protein'],
    breakfast: ['breakfast', 'morning'],
    lunch: ['lunch', 'midday'],
    dinner: ['dinner', 'evening'],
    dessert: ['dessert', 'sweet'],
  }

  // Check content for tag keywords
  Object.entries(tagMappings).forEach(([tag, keywords]) => {
    if (keywords.some((keyword) => content.includes(keyword))) {
      tags.push(tag)
    }
  })

  // Add category as tag if available
  if (recipe.category) {
    tags.push(recipe.category.toLowerCase())
  }

  return [...new Set(tags)] // Remove duplicates
}

/**
 * Calculate popularity score for a recipe
 * @param {Object} recipe - Recipe object
 * @returns {number} - Popularity score (0-100)
 */
function calculatePopularityScore(recipe) {
  let score = 0

  // Base score from views
  score += Math.min(recipe.views || 0, 100) * 0.3

  // Score from likes
  score += Math.min(recipe.likes || 0, 50) * 0.4

  // Score from rating
  score += (recipe.rating || 0) * 6 // 5 stars = 30 points

  // Bonus for recent recipes
  if (recipe.createdAt) {
    const daysSinceCreation = (Date.now() - recipe.createdAt.toDate()) / (1000 * 60 * 60 * 24)
    if (daysSinceCreation < 7) score += 10 // New recipe bonus
  }

  return Math.min(100, Math.max(0, score))
}

/**
 * Calculate health score for a recipe
 * @param {Object} recipe - Recipe object
 * @returns {number} - Health score (0-100)
 */
function calculateHealthScore(recipe) {
  let score = 50 // Base score

  // Check calories
  if (recipe.calories) {
    if (recipe.calories < 200) score += 20
    else if (recipe.calories < 400) score += 10
    else if (recipe.calories > 800) score -= 20
  }

  // Check protein content
  if (recipe.protein) {
    if (recipe.protein > 20) score += 15
    else if (recipe.protein > 10) score += 10
  }

  // Check for healthy ingredients
  const healthyIngredients = ['vegetable', 'fruit', 'whole grain', 'lean', 'organic', 'fresh']
  const ingredientsText = (recipe.ingredients || []).join(' ').toLowerCase()

  healthyIngredients.forEach((ingredient) => {
    if (ingredientsText.includes(ingredient)) {
      score += 5
    }
  })

  // Check for unhealthy ingredients
  const unhealthyIngredients = ['sugar', 'fried', 'processed', 'artificial', 'trans fat']
  unhealthyIngredients.forEach((ingredient) => {
    if (ingredientsText.includes(ingredient)) {
      score -= 10
    }
  })

  return Math.min(100, Math.max(0, score))
}

/**
 * Get recommended recipes based on user preferences
 * @param {Array} userCategories - User's preferred categories
 * @param {Array} userTags - User's preferred tags
 * @param {Object} preferences - Additional preferences
 * @returns {Array} - Array of recommended recipes
 */
async function getRecommendedRecipes(userCategories, userTags, preferences = {}) {
  try {
    let query = admin.firestore().collection('recipes')

    // Apply preferences if provided
    if (preferences.maxCalories) {
      query = query.where('calories', '<=', preferences.maxCalories)
    }

    // Filter by categories if available
    if (userCategories.length > 0) {
      query = query.where('category', 'in', userCategories.slice(0, 10)) // Firestore limit
    }

    const snapshot = await query.limit(20).get()
    const recipes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Score recipes based on user preferences
    const scoredRecipes = recipes.map((recipe) => {
      let score = 0

      // Category match
      if (userCategories.includes(recipe.category)) {
        score += 20
      }

      // Tag matches
      const recipeTags = recipe.tags || []
      const matchingTags = recipeTags.filter((tag) => userTags.includes(tag))
      score += matchingTags.length * 10

      // Rating bonus
      score += (recipe.rating || 0) * 5

      // Popularity bonus
      score += Math.min(recipe.views || 0, 50) * 0.2

      return { ...recipe, recommendationScore: score }
    })

    // Sort by recommendation score and return top recipes
    return scoredRecipes.sort((a, b) => b.recommendationScore - a.recommendationScore).slice(0, 10)
  } catch (error) {
    functions.logger.error('Error getting recommended recipes:', error)
    return []
  }
}
