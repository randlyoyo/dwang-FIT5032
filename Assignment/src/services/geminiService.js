/**
 * Gemini AI Service
 *
 * Provides AI-powered features using Google's Gemini API
 */

class GeminiService {
  constructor() {
    // Get API key from environment variable
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      console.warn('⚠️ Gemini API key not found. Using mock mode.')
      this.isMockMode = true
      this.apiKey = null
      this.genAI = null
      this.model = null
    } else {
      try {
        console.log('✅ Gemini API key detected. Real AI mode enabled.')
        // Lazy load the Google AI library only when needed
        this.apiKey = apiKey
        this.isMockMode = false
        this.genAI = null // Will be initialized on first use
        this.model = null
        console.log('Real AI mode ready (lazy loading)')
      } catch (error) {
        console.warn('⚠️ Error initializing Gemini AI. Using mock mode.', error)
        this.isMockMode = true
        this.apiKey = null
        this.genAI = null
        this.model = null
      }
    }
  }

  /**
   * Generate recipe suggestions based on ingredients
   */
  async generateRecipeSuggestions(ingredients) {
    const prompt = `Generate 3 healthy recipe ideas using these ingredients: ${ingredients.join(', ')}.
    For each recipe, provide:
    1. Recipe name
    2. Brief description (2-3 sentences)
    3. Estimated prep time
    4. Estimated calories per serving

    Format as JSON array with fields: name, description, prepTime, calories`

    return await this.generateContent(prompt)
  }

  /**
   * Analyze nutrition content
   */
  async analyzeNutrition(foodItem) {
    const prompt = `Provide detailed nutritional analysis for "${foodItem}". Include:
    - Calories (per 100g)
    - Protein (g)
    - Carbohydrates (g)
    - Fat (g)
    - Fiber (g)
    - Key vitamins and minerals
    - Health benefits (2-3 points)

    Format as JSON with fields: calories, protein, carbs, fat, fiber, vitamins, benefits`

    return await this.generateContent(prompt)
  }

  /**
   * Generate meal plan
   */
  async generateMealPlan(preferences) {
    const { dietType, calorieTarget, meals } = preferences

    const prompt = `Create a ${dietType || 'balanced'} meal plan with approximately ${calorieTarget || 2000} calories per day.
    Include ${meals || 3} meals. For each meal, provide:
    - Meal name
    - Ingredients list
    - Estimated calories
    - Preparation time

    Format as JSON array with fields: mealName, ingredients, calories, prepTime`

    return await this.generateContent(prompt)
  }

  /**
   * Get cooking tips
   */
  async getCookingTips(recipeName) {
    const prompt = `Provide 5 professional cooking tips for making "${recipeName}".
    Make them practical and specific. Format as a JSON array of strings.`

    return await this.generateContent(prompt)
  }

  /**
   * Analyze recipe healthiness
   */
  async analyzeRecipeHealth(recipeDescription) {
    const prompt = `Analyze the healthiness of this recipe: "${recipeDescription}"

    Provide:
    1. Health Score (0-100)
    2. Pros (3-5 healthy aspects)
    3. Cons (2-3 areas for improvement)
    4. Suggestions (2-3 ways to make it healthier)

    Format as JSON with fields: healthScore, pros (array), cons (array), suggestions (array)`

    return await this.generateContent(prompt)
  }

  /**
   * Generate content using Gemini or mock
   */
  async generateContent(prompt) {
    if (this.isMockMode) {
      return await this.getMockResponse(prompt)
    }

    try {
      // Lazy load the Google AI library
      if (!this.genAI) {
        console.log('🔄 Lazy loading Google AI library...')
        const { GoogleGenerativeAI } = await import('@google/generative-ai')
        this.genAI = new GoogleGenerativeAI(this.apiKey)
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
        console.log('✅ Google AI library loaded')
      }

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Try to parse JSON if the response looks like JSON
      try {
        if (text.includes('{') || text.includes('[')) {
          // Extract JSON from markdown code blocks if present
          const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) ||
            text.match(/```\n([\s\S]*?)\n```/) || [null, text]

          return JSON.parse(jsonMatch[1] || text)
        }
      } catch (e) {
        // If JSON parsing fails, return as text
        return { text }
      }

      return { text }
    } catch (error) {
      console.error('Gemini API Error:', error)
      // Fallback to mock mode if API fails
      console.log('Falling back to mock mode due to API error')
      return this.getMockResponse(prompt)
    }
  }

  /**
   * Mock responses for testing without API key
   */
  async getMockResponse(prompt) {
    console.log('🤖 Mock AI: Processing request...', prompt.substring(0, 50) + '...')
    const startTime = Date.now()

    // Add a small delay to simulate real API response time (reduced for better UX)
    await new Promise((resolve) => setTimeout(resolve, 200))

    const endTime = Date.now()
    console.log(`🤖 Mock AI: Response generated in ${endTime - startTime}ms`)

    if (prompt.includes('recipe ideas')) {
      return [
        {
          name: 'Mediterranean Quinoa Bowl',
          description:
            'A nutritious bowl combining protein-rich quinoa with fresh vegetables and olive oil. Perfect for a healthy lunch or dinner.',
          prepTime: '25 minutes',
          calories: 420,
        },
        {
          name: 'Grilled Chicken Salad',
          description:
            'Light and refreshing salad with tender grilled chicken, mixed greens, and a tangy vinaigrette.',
          prepTime: '20 minutes',
          calories: 320,
        },
        {
          name: 'Veggie Stir-Fry',
          description:
            'Colorful mix of seasonal vegetables stir-fried with garlic and ginger. A quick and healthy dinner option.',
          prepTime: '15 minutes',
          calories: 280,
        },
      ]
    }

    if (prompt.includes('nutritional analysis')) {
      return {
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
        fiber: 0,
        vitamins: ['B12', 'B6', 'Niacin', 'Selenium'],
        benefits: [
          'Excellent source of lean protein',
          'Rich in B vitamins for energy',
          'Low in calories and fat',
        ],
      }
    }

    if (prompt.includes('meal plan')) {
      return [
        {
          mealName: 'Breakfast: Oatmeal with Berries',
          ingredients: ['Oats', 'Milk', 'Blueberries', 'Honey'],
          calories: 350,
          prepTime: '10 minutes',
        },
        {
          mealName: 'Lunch: Grilled Chicken Wrap',
          ingredients: ['Chicken breast', 'Whole wheat tortilla', 'Lettuce', 'Tomato'],
          calories: 450,
          prepTime: '15 minutes',
        },
        {
          mealName: 'Dinner: Baked Salmon with Vegetables',
          ingredients: ['Salmon fillet', 'Broccoli', 'Carrots', 'Olive oil'],
          calories: 500,
          prepTime: '30 minutes',
        },
      ]
    }

    if (prompt.includes('cooking tips')) {
      return [
        'Season your ingredients at every stage for better flavor',
        'Use a meat thermometer to ensure perfect doneness',
        'Let meat rest for 5-10 minutes after cooking',
        'Prep all ingredients before you start cooking',
        'Use high heat for a good sear on proteins',
      ]
    }

    if (prompt.includes('healthiness')) {
      return {
        healthScore: 75,
        pros: [
          'Good balance of protein and vegetables',
          'Low in saturated fats',
          'Rich in vitamins and minerals',
        ],
        cons: ['Could use more fiber', 'Sodium content might be high'],
        suggestions: ['Add whole grains for more fiber', 'Reduce salt, use herbs instead'],
      }
    }

    return {
      text: 'Mock response: AI feature is working. Add VITE_GEMINI_API_KEY to your .env.local file for real AI responses.',
    }
  }
}

export default new GeminiService()
