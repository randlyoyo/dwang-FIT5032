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
      apiRecipes: 'active',
      apiRecipeById: 'active',
    },
  }

  functions.logger.info('Health check performed')
  res.status(200).json(healthStatus)
})

// ============================================================================
// PUBLIC REST API: Recipes Endpoints
// ============================================================================

/**
 * REST API: Get all recipes
 *
 * Endpoint: GET /api/recipes
 * Query Parameters:
 *   - limit: Number of recipes to return (default: 50, max: 100)
 *   - category: Filter by category (optional)
 *   - difficulty: Filter by difficulty (optional)
 *   - sortBy: Sort field (default: 'createdAt')
 *   - order: Sort order 'asc' or 'desc' (default: 'desc')
 *
 * Example:
 *   GET /api/recipes?limit=10&category=Breakfast&sortBy=rating&order=desc
 *
 * Response:
 *   {
 *     success: true,
 *     data: [...],
 *     total: 10,
 *     timestamp: "2025-01-01T00:00:00.000Z"
 *   }
 */
exports.apiRecipes = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed. Only GET requests are supported.',
    })
    return
  }

  try {
    // Parse query parameters
    const limit = Math.min(parseInt(req.query.limit) || 50, 100) // Max 100
    const category = req.query.category || null
    const difficulty = req.query.difficulty || null
    const sortBy = req.query.sortBy || 'createdAt'
    const order = req.query.order === 'asc' ? 'asc' : 'desc'

    functions.logger.info('API request received', {
      limit,
      category,
      difficulty,
      sortBy,
      order,
    })

    // Build Firestore query
    let query = admin.firestore().collection('recipes')

    // Apply filters
    if (category) {
      query = query.where('category', '==', category)
    }
    if (difficulty) {
      query = query.where('difficulty', '==', difficulty)
    }

    // Apply sorting
    query = query.orderBy(sortBy, order)

    // Apply limit
    query = query.limit(limit)

    // Execute query
    const snapshot = await query.get()

    // Format response data
    const recipes = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      recipes.push({
        id: doc.id,
        name: data.name || data.title,
        description: data.description,
        category: data.category,
        difficulty: data.difficulty,
        prepTime: data.prepTime,
        cookTime: data.cookTime,
        servings: data.servings,
        calories: data.calories,
        protein: data.protein,
        rating: data.rating || 0,
        views: data.views || 0,
        likes: data.likes || 0,
        ingredients: data.ingredients || [],
        instructions: data.instructions || [],
        tags: data.tags || [],
        imageUrl: data.imageUrl,
        chef: data.chef || data.author,
        createdAt: data.createdAt?._seconds
          ? new Date(data.createdAt._seconds * 1000).toISOString()
          : null,
      })
    })

    // Send response
    res.status(200).json({
      success: true,
      data: recipes,
      total: recipes.length,
      filters: {
        category: category || 'all',
        difficulty: difficulty || 'all',
        sortBy,
        order,
      },
      timestamp: new Date().toISOString(),
      documentation: 'https://your-project.web.app/api/docs',
    })

    functions.logger.info(`API request successful: ${recipes.length} recipes returned`)
  } catch (error) {
    functions.logger.error('Error fetching recipes:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString(),
    })
  }
})

/**
 * REST API: Get recipe by ID
 *
 * Endpoint: GET /api/recipes/:id
 *
 * Example:
 *   GET /api/recipes/abc123
 *
 * Response:
 *   {
 *     success: true,
 *     data: {...},
 *     timestamp: "2025-01-01T00:00:00.000Z"
 *   }
 */
exports.apiRecipeById = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed. Only GET requests are supported.',
    })
    return
  }

  try {
    // Extract recipe ID from path
    // URL format: /apiRecipeById/abc123 or /apiRecipeById?id=abc123
    const recipeId = req.path.split('/').pop() || req.query.id

    if (!recipeId || recipeId === 'apiRecipeById') {
      res.status(400).json({
        success: false,
        error: 'Recipe ID is required',
        usage: 'GET /apiRecipeById/{recipeId} or GET /apiRecipeById?id={recipeId}',
        timestamp: new Date().toISOString(),
      })
      return
    }

    functions.logger.info('API request for recipe ID:', recipeId)

    // Fetch recipe from Firestore
    const recipeDoc = await admin.firestore().collection('recipes').doc(recipeId).get()

    if (!recipeDoc.exists) {
      res.status(404).json({
        success: false,
        error: 'Recipe not found',
        recipeId: recipeId,
        timestamp: new Date().toISOString(),
      })
      return
    }

    const data = recipeDoc.data()

    // Format response
    const recipe = {
      id: recipeDoc.id,
      name: data.name || data.title,
      description: data.description,
      category: data.category,
      difficulty: data.difficulty,
      prepTime: data.prepTime,
      cookTime: data.cookTime,
      totalTime: (data.prepTime || 0) + (data.cookTime || 0),
      servings: data.servings,
      calories: data.calories,
      protein: data.protein,
      rating: data.rating || 0,
      views: data.views || 0,
      likes: data.likes || 0,
      ingredients: data.ingredients || [],
      instructions: data.instructions || [],
      tags: data.tags || [],
      imageUrl: data.imageUrl,
      chef: data.chef || data.author,
      cuisine: data.cuisine,
      createdAt: data.createdAt?._seconds
        ? new Date(data.createdAt._seconds * 1000).toISOString()
        : null,
      updatedAt: data.updatedAt?._seconds
        ? new Date(data.updatedAt._seconds * 1000).toISOString()
        : null,
    }

    // Increment view count (optional - async, don't wait)
    admin
      .firestore()
      .collection('recipes')
      .doc(recipeId)
      .update({
        views: admin.firestore.FieldValue.increment(1),
      })
      .catch((err) => functions.logger.warn('Failed to increment view count:', err))

    // Send response
    res.status(200).json({
      success: true,
      data: recipe,
      timestamp: new Date().toISOString(),
    })

    functions.logger.info(`Recipe ${recipeId} retrieved successfully`)
  } catch (error) {
    functions.logger.error('Error fetching recipe:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString(),
    })
  }
})
