<template>
  <div class="ai-assistant-page">
    <!-- Hero Section - 与主页风格统一 -->
    <section class="hero-section text-white text-center">
      <div class="hero-overlay">
        <div class="container">
          <div class="hero-icon mb-4">
            <i class="bi bi-stars display-1"></i>
          </div>
          <h1 class="display-3 fw-bold mb-3">AI Recipe Assistant</h1>
          <p class="lead mb-4">
            Powered by Google Gemini • Get instant recipe ideas, nutrition analysis, meal plans, and
            cooking tips
          </p>
        </div>
      </div>
    </section>

    <!-- Feature Tabs Section -->
    <section class="tabs-section py-4 bg-white shadow-sm">
      <div class="container">
        <div class="feature-tabs">
          <button
            v-for="feature in features"
            :key="feature.id"
            @click="activeFeature = feature.id"
            :class="['tab-btn', { active: activeFeature === feature.id }]"
          >
            <i :class="['bi', feature.icon, 'me-2']"></i>
            <span>{{ feature.label }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Main Content Section -->
    <section class="content-section py-5">
      <div class="container">
        <!-- Recipe Suggestions -->
        <transition name="fade" mode="out-in">
          <div v-if="activeFeature === 'suggestions'" key="suggestions">
            <div class="content-header text-center mb-5">
              <h2 class="h3 mb-3">
                <i class="bi bi-lightbulb text-warning me-2"></i>
                Generate Recipe Ideas from Ingredients
              </h2>
              <p class="text-muted">
                Enter your available ingredients and let AI create delicious recipe suggestions for
                you
              </p>
            </div>

            <div class="row justify-content-center">
              <div class="col-lg-8">
                <div class="card shadow-sm mb-4">
                  <div class="card-body p-4">
                    <label class="form-label fw-semibold">Your Available Ingredients</label>
                    <div class="input-group input-group-lg mb-3">
                      <span class="input-group-text bg-success text-white">
                        <i class="bi bi-basket"></i>
                      </span>
                      <input
                        type="text"
                        class="form-control"
                        v-model="ingredientsInput"
                        placeholder="e.g., chicken, broccoli, garlic, olive oil"
                        @keypress.enter="generateRecipes"
                      />
                    </div>
                    <small class="text-muted">Separate ingredients with commas</small>
                    <button
                      class="btn btn-success btn-lg w-100 mt-3"
                      @click="generateRecipes"
                      :disabled="isLoading || !ingredientsInput.trim()"
                    >
                      <span v-if="isLoading">
                        <span class="spinner-border spinner-border-sm me-2"></span>
                        Generating Ideas...
                      </span>
                      <span v-else>
                        <i class="bi bi-magic me-2"></i>
                        Generate Recipe Ideas
                      </span>
                    </button>
                  </div>
                </div>

                <transition name="slide-fade">
                  <div v-if="recipes.length > 0">
                    <h4 class="mb-4">
                      <i class="bi bi-check-circle text-success me-2"></i>
                      AI-Generated Recipes ({{ recipes.length }})
                    </h4>
                    <div class="row g-4">
                      <div v-for="(recipe, index) in recipes" :key="index" class="col-md-6">
                        <div class="card recipe-card h-100 shadow-sm">
                          <div class="card-body">
                            <div class="d-flex align-items-start mb-3">
                              <span class="badge bg-success me-2">{{ index + 1 }}</span>
                              <h5 class="card-title mb-0">{{ recipe.name }}</h5>
                            </div>
                            <p class="card-text text-muted">{{ recipe.description }}</p>
                            <div class="d-flex gap-2">
                              <span class="badge bg-light text-dark">
                                <i class="bi bi-clock me-1"></i>{{ recipe.prepTime }}
                              </span>
                              <span class="badge bg-light text-dark">
                                <i class="bi bi-fire me-1"></i>{{ recipe.calories }} cal
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
          </div>

          <!-- Nutrition Analysis -->
          <div v-else-if="activeFeature === 'nutrition'" key="nutrition">
            <div class="content-header text-center mb-5">
              <h2 class="h3 mb-3">
                <i class="bi bi-heart-pulse text-danger me-2"></i>
                Nutrition Analysis
              </h2>
              <p class="text-muted">
                Get detailed nutritional information and health benefits for any food item
              </p>
            </div>

            <div class="row justify-content-center">
              <div class="col-lg-8">
                <div class="card shadow-sm mb-4">
                  <div class="card-body p-4">
                    <label class="form-label fw-semibold">Food Item to Analyze</label>
                    <div class="input-group input-group-lg mb-3">
                      <span class="input-group-text bg-success text-white">
                        <i class="bi bi-egg"></i>
                      </span>
                      <input
                        type="text"
                        class="form-control"
                        v-model="foodItem"
                        placeholder="e.g., Chicken breast, Avocado, Quinoa"
                        @keypress.enter="analyzeNutrition"
                      />
                    </div>
                    <button
                      class="btn btn-success btn-lg w-100 mt-3"
                      @click="analyzeNutrition"
                      :disabled="isLoading || !foodItem.trim()"
                    >
                      <span v-if="isLoading">
                        <span class="spinner-border spinner-border-sm me-2"></span>
                        Analyzing...
                      </span>
                      <span v-else>
                        <i class="bi bi-search me-2"></i>
                        Analyze Nutrition
                      </span>
                    </button>
                  </div>
                </div>

                <transition name="slide-fade">
                  <div v-if="nutritionData" class="card shadow-sm">
                    <div class="card-header bg-success text-white">
                      <h5 class="mb-0">
                        <i class="bi bi-clipboard-data me-2"></i>
                        Nutritional Information (per 100g)
                      </h5>
                    </div>
                    <div class="card-body">
                      <div class="row g-3 mb-4">
                        <div class="col-6 col-md-3">
                          <div class="nutrition-box text-center p-3 bg-light rounded">
                            <i class="bi bi-lightning-charge-fill text-warning fs-3"></i>
                            <div class="fw-bold mt-2">{{ nutritionData.calories }}</div>
                            <small class="text-muted">Calories</small>
                          </div>
                        </div>
                        <div class="col-6 col-md-3">
                          <div class="nutrition-box text-center p-3 bg-light rounded">
                            <i class="bi bi-egg-fill text-success fs-3"></i>
                            <div class="fw-bold mt-2">{{ nutritionData.protein }}g</div>
                            <small class="text-muted">Protein</small>
                          </div>
                        </div>
                        <div class="col-6 col-md-3">
                          <div class="nutrition-box text-center p-3 bg-light rounded">
                            <i class="bi bi-moisture text-primary fs-3"></i>
                            <div class="fw-bold mt-2">{{ nutritionData.carbs }}g</div>
                            <small class="text-muted">Carbs</small>
                          </div>
                        </div>
                        <div class="col-6 col-md-3">
                          <div class="nutrition-box text-center p-3 bg-light rounded">
                            <i class="bi bi-droplet-fill text-info fs-3"></i>
                            <div class="fw-bold mt-2">{{ nutritionData.fat }}g</div>
                            <small class="text-muted">Fat</small>
                          </div>
                        </div>
                      </div>

                      <h6 class="mb-3">
                        <i class="bi bi-heart-fill text-danger me-2"></i>
                        Health Benefits
                      </h6>
                      <ul class="list-group list-group-flush">
                        <li
                          v-for="(benefit, index) in nutritionData.benefits"
                          :key="index"
                          class="list-group-item"
                        >
                          <i class="bi bi-check-circle-fill text-success me-2"></i>
                          {{ benefit }}
                        </li>
                      </ul>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
          </div>

          <!-- Meal Plan -->
          <div v-else-if="activeFeature === 'mealplan'" key="mealplan">
            <div class="content-header text-center mb-5">
              <h2 class="h3 mb-3">
                <i class="bi bi-calendar-week text-primary me-2"></i>
                Personalized Meal Plan Generator
              </h2>
              <p class="text-muted">
                Create a customized meal plan based on your dietary preferences and goals
              </p>
            </div>

            <div class="row justify-content-center">
              <div class="col-lg-8">
                <div class="card shadow-sm mb-4">
                  <div class="card-body p-4">
                    <div class="row g-3">
                      <div class="col-md-4">
                        <label class="form-label fw-semibold">Diet Type</label>
                        <select class="form-select" v-model="mealPlanPrefs.dietType">
                          <option value="balanced">🥗 Balanced</option>
                          <option value="low-carb">🥑 Low Carb</option>
                          <option value="high-protein">🍗 High Protein</option>
                          <option value="vegetarian">🥕 Vegetarian</option>
                          <option value="vegan">🌱 Vegan</option>
                        </select>
                      </div>
                      <div class="col-md-4">
                        <label class="form-label fw-semibold">Daily Calorie Target</label>
                        <input
                          type="number"
                          class="form-control"
                          v-model="mealPlanPrefs.calorieTarget"
                          placeholder="2000"
                          min="1000"
                          max="5000"
                        />
                      </div>
                      <div class="col-md-4">
                        <label class="form-label fw-semibold">Meals per Day</label>
                        <select class="form-select" v-model="mealPlanPrefs.meals">
                          <option value="3">3 Meals</option>
                          <option value="4">4 Meals</option>
                          <option value="5">5 Meals</option>
                        </select>
                      </div>
                    </div>
                    <button
                      class="btn btn-success btn-lg w-100 mt-4"
                      @click="generateMealPlan"
                      :disabled="isLoading"
                    >
                      <span v-if="isLoading">
                        <span class="spinner-border spinner-border-sm me-2"></span>
                        Creating Your Plan...
                      </span>
                      <span v-else>
                        <i class="bi bi-calendar-check me-2"></i>
                        Generate Meal Plan
                      </span>
                    </button>
                  </div>
                </div>

                <transition name="slide-fade">
                  <div v-if="mealPlan.length > 0">
                    <h4 class="mb-4">
                      <i class="bi bi-check-circle text-success me-2"></i>
                      Your Personalized Meal Plan
                    </h4>
                    <div class="list-group">
                      <div
                        v-for="(meal, index) in mealPlan"
                        :key="index"
                        class="list-group-item list-group-item-action"
                      >
                        <div class="d-flex w-100 justify-content-between align-items-center mb-2">
                          <h5 class="mb-0">
                            <span class="badge bg-success me-2">{{ index + 1 }}</span>
                            {{ meal.mealName }}
                          </h5>
                          <div>
                            <span class="badge bg-light text-dark me-2">
                              <i class="bi bi-clock me-1"></i>{{ meal.prepTime }}
                            </span>
                            <span class="badge bg-light text-dark">
                              <i class="bi bi-fire me-1"></i>{{ meal.calories }} cal
                            </span>
                          </div>
                        </div>
                        <p class="mb-0 text-muted">
                          <strong>Ingredients:</strong> {{ meal.ingredients.join(', ') }}
                        </p>
                      </div>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
          </div>

          <!-- Cooking Tips -->
          <div v-else-if="activeFeature === 'tips'" key="tips">
            <div class="content-header text-center mb-5">
              <h2 class="h3 mb-3">
                <i class="bi bi-patch-question text-info me-2"></i>
                Professional Cooking Tips
              </h2>
              <p class="text-muted">Get expert cooking tips and techniques for any recipe</p>
            </div>

            <div class="row justify-content-center">
              <div class="col-lg-8">
                <div class="card shadow-sm mb-4">
                  <div class="card-body p-4">
                    <label class="form-label fw-semibold">Recipe or Dish Name</label>
                    <div class="input-group input-group-lg mb-3">
                      <span class="input-group-text bg-success text-white">
                        <i class="bi bi-book"></i>
                      </span>
                      <input
                        type="text"
                        class="form-control"
                        v-model="recipeName"
                        placeholder="e.g., Grilled Salmon, Beef Stir-fry, Tiramisu"
                        @keypress.enter="getCookingTips"
                      />
                    </div>
                    <button
                      class="btn btn-success btn-lg w-100 mt-3"
                      @click="getCookingTips"
                      :disabled="isLoading || !recipeName.trim()"
                    >
                      <span v-if="isLoading">
                        <span class="spinner-border spinner-border-sm me-2"></span>
                        Getting Tips...
                      </span>
                      <span v-else>
                        <i class="bi bi-lightbulb me-2"></i>
                        Get Cooking Tips
                      </span>
                    </button>
                  </div>
                </div>

                <transition name="slide-fade">
                  <div v-if="cookingTips.length > 0" class="card shadow-sm">
                    <div class="card-header bg-success text-white">
                      <h5 class="mb-0">
                        <i class="bi bi-star-fill me-2"></i>
                        Professional Tips for Success
                      </h5>
                    </div>
                    <div class="card-body">
                      <ol class="list-group list-group-numbered list-group-flush">
                        <li
                          v-for="(tip, index) in cookingTips"
                          :key="index"
                          class="list-group-item"
                        >
                          {{ tip }}
                        </li>
                      </ol>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </transition>

        <!-- Error Message -->
        <transition name="fade">
          <div
            v-if="error"
            class="alert alert-danger alert-dismissible fade show mt-4"
            role="alert"
          >
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            {{ error }}
            <button type="button" class="btn-close" @click="error = ''"></button>
          </div>
        </transition>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import geminiService from '../services/geminiService.js'

// Features Configuration
const features = [
  { id: 'suggestions', label: 'Recipe Ideas', icon: 'bi-lightbulb-fill' },
  { id: 'nutrition', label: 'Nutrition Analysis', icon: 'bi-heart-pulse-fill' },
  { id: 'mealplan', label: 'Meal Planning', icon: 'bi-calendar-week-fill' },
  { id: 'tips', label: 'Cooking Tips', icon: 'bi-patch-question-fill' },
]

// State
const activeFeature = ref('suggestions')
const isLoading = ref(false)
const error = ref('')

// Recipe Suggestions
const ingredientsInput = ref('')
const recipes = ref([])

// Nutrition Analysis
const foodItem = ref('')
const nutritionData = ref(null)

// Meal Plan
const mealPlanPrefs = ref({
  dietType: 'balanced',
  calorieTarget: 2000,
  meals: 3,
})
const mealPlan = ref([])

// Cooking Tips
const recipeName = ref('')
const cookingTips = ref([])

// Methods
const generateRecipes = async () => {
  if (!ingredientsInput.value.trim()) {
    error.value = 'Please enter some ingredients'
    return
  }

  isLoading.value = true
  error.value = ''
  recipes.value = []

  try {
    const ingredients = ingredientsInput.value.split(',').map((i) => i.trim())
    const result = await geminiService.generateRecipeSuggestions(ingredients)
    recipes.value = Array.isArray(result) ? result : []

    if (recipes.value.length === 0) {
      error.value = 'No recipes generated. Please try different ingredients.'
    }
  } catch (err) {
    error.value = err.message || 'Failed to generate recipes. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const analyzeNutrition = async () => {
  if (!foodItem.value.trim()) {
    error.value = 'Please enter a food item'
    return
  }

  isLoading.value = true
  error.value = ''
  nutritionData.value = null

  try {
    const result = await geminiService.analyzeNutrition(foodItem.value)
    nutritionData.value = result
  } catch (err) {
    error.value = err.message || 'Failed to analyze nutrition. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const generateMealPlan = async () => {
  isLoading.value = true
  error.value = ''
  mealPlan.value = []

  try {
    const result = await geminiService.generateMealPlan(mealPlanPrefs.value)
    mealPlan.value = Array.isArray(result) ? result : []

    if (mealPlan.value.length === 0) {
      error.value = 'No meal plan generated. Please try again.'
    }
  } catch (err) {
    error.value = err.message || 'Failed to generate meal plan. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const getCookingTips = async () => {
  if (!recipeName.value.trim()) {
    error.value = 'Please enter a recipe name'
    return
  }

  isLoading.value = true
  error.value = ''
  cookingTips.value = []

  try {
    const result = await geminiService.getCookingTips(recipeName.value)
    cookingTips.value = Array.isArray(result) ? result : []

    if (cookingTips.value.length === 0) {
      error.value = 'No tips generated. Please try a different recipe.'
    }
  } catch (err) {
    error.value = err.message || 'Failed to get cooking tips. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* Hero Section - 与主页统一 */
.hero-section {
  background:
    linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
    linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 400px;
  display: flex;
  align-items: center;
  position: relative;
}

.hero-overlay {
  width: 100%;
  padding: 3rem 0;
}

.hero-icon i {
  color: #ffd700;
  animation: float 3s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.hero-section h1 {
  font-size: 3.5rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.hero-section .lead {
  font-size: 1.25rem;
  max-width: 800px;
  margin: 0 auto;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

/* Tabs Section */
.tabs-section {
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 2px solid #e9ecef;
}

.feature-tabs {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid transparent;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #6c757d;
  font-weight: 600;
  font-size: 1rem;
}

.tab-btn:hover {
  background: #f8f9fa;
  color: #28a745;
}

.tab-btn.active {
  background: #28a745;
  color: white;
  border-color: #28a745;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
}

/* Content Section */
.content-section {
  background: #f8f9fa;
  min-height: 60vh;
}

.content-header h2 {
  color: #333;
  font-weight: 600;
}

/* Recipe Cards - 与主页统一 */
.recipe-card {
  transition: all 0.3s ease;
  border-radius: 8px;
  border: none;
}

.recipe-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
}

.recipe-card .card-title {
  color: #333;
  font-weight: 600;
}

/* Nutrition Box */
.nutrition-box {
  transition: all 0.3s ease;
}

.nutrition-box:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* List Group */
.list-group-item-action:hover {
  background-color: #f8f9fa;
}

/* Buttons - 与主页统一 */
.btn-success {
  border-radius: 50px;
  transition: all 0.3s ease;
}

.btn-success:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
}

/* Input Groups */
.input-group-text {
  border-radius: 8px 0 0 8px;
}

.form-control {
  border-radius: 0 8px 8px 0;
}

.form-control:focus {
  border-color: #28a745;
  box-shadow: 0 0 0 0.25rem rgba(40, 167, 69, 0.25);
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active {
  animation: slideUp 0.5s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 2.5rem;
  }

  .hero-section .lead {
    font-size: 1rem;
  }

  .feature-tabs {
    gap: 0.5rem;
  }

  .tab-btn {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .tab-btn span {
    display: none;
  }

  .tab-btn i {
    margin: 0 !important;
  }
}

@media (max-width: 576px) {
  .hero-section h1 {
    font-size: 2rem;
  }

  .nutrition-box {
    margin-bottom: 1rem;
  }
}
</style>
