<template>
  <div>
    <!-- Hero Section -->
    <section class="hero-section text-white text-center" aria-labelledby="hero-heading">
      <div class="hero-overlay">
        <div class="container">
          <h1 id="hero-heading" class="display-3 fw-bold mb-3">Healthy Recipes for Everyone</h1>
          <p class="lead mb-4">
            Empowering communities with accessible nutrition resources and support
          </p>
          <button
            v-if="isAuthenticated"
            class="btn btn-success btn-lg"
            @click="navigateToRecipes"
            aria-label="Get started - Browse healthy recipes"
          >
            Get Started
          </button>
          <button
            v-else
            class="btn btn-success btn-lg"
            @click="navigateToAuth"
            aria-label="Get started - Sign up or log in"
          >
            Get Started
          </button>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section py-5" aria-labelledby="features-heading">
      <div class="container">
        <h2 id="features-heading" class="visually-hidden">Key Features</h2>
        <div class="row g-4">
          <!-- Feature 1: Recipe Database -->
          <div class="col-md-4 text-center">
            <div class="feature-icon text-success mb-3" aria-hidden="true">
              <i class="bi bi-book fs-1"></i>
            </div>
            <h3 class="h5 mb-3">Recipe Database</h3>
            <p class="text-muted">
              Browse and search our extensive collection of healthy recipes with advanced filters,
              ratings, and nutritional information.
            </p>
          </div>

          <!-- Feature 2: AI Assistant -->
          <div class="col-md-4 text-center">
            <div class="feature-icon text-success mb-3" aria-hidden="true">
              <i class="bi bi-stars fs-1"></i>
            </div>
            <h3 class="h5 mb-3">AI Recipe Assistant</h3>
            <p class="text-muted">
              Get personalized recipe recommendations and cooking tips powered by Google Gemini AI
              technology.
            </p>
          </div>

          <!-- Feature 3: Store Locator -->
          <div class="col-md-4 text-center">
            <div class="feature-icon text-success mb-3" aria-hidden="true">
              <i class="bi bi-geo-alt-fill fs-1"></i>
            </div>
            <h3 class="h5 mb-3">Find Healthy Stores</h3>
            <p class="text-muted">
              Discover nearby health food stores and organic markets with our interactive map and
              navigation features.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Recipes Section -->
    <section class="recipes-section py-5 bg-light" aria-labelledby="recipes-heading">
      <div class="container">
        <h2 id="recipes-heading" class="text-center mb-5">Featured Recipes</h2>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-success" role="status">
            <span class="visually-hidden">Loading recipes...</span>
          </div>
          <p class="mt-3 text-muted">Loading delicious recipes...</p>
        </div>

        <!-- Recipes Display -->
        <div v-else class="row g-4">
          <!-- Dynamic Recipe Cards from Firestore -->
          <div v-for="(recipe, index) in featuredRecipes" :key="recipe.id" class="col-md-4">
            <div class="card recipe-card h-100 shadow-sm">
              <div
                class="recipe-image-header"
                :style="{ backgroundImage: `url(${getRecipeImage(index)})` }"
              >
                <div class="recipe-badge" v-if="recipe.difficulty">
                  <span class="badge bg-success">{{ recipe.difficulty }}</span>
                </div>
              </div>
              <div class="card-body">
                <h3 class="card-title h5">{{ recipe.name }}</h3>
                <p class="card-text text-muted small">
                  {{ recipe.description.substring(0, 100)
                  }}{{ recipe.description.length > 100 ? '...' : '' }}
                </p>
                <div class="recipe-meta d-flex justify-content-between align-items-center mt-3">
                  <span class="text-muted small">
                    <i class="bi bi-clock me-1"></i>{{ recipe.prepTime + recipe.cookTime }} min
                  </span>
                  <span class="text-muted small">
                    <i class="bi bi-fire me-1"></i>{{ recipe.calories }} cal
                  </span>
                  <span class="text-success small">
                    <i class="bi bi-star-fill me-1"></i>{{ recipe.rating }}
                  </span>
                </div>
                <div class="mt-3" v-if="recipe.tags && recipe.tags.length">
                  <span
                    v-for="tag in recipe.tags.slice(0, 3)"
                    :key="tag"
                    class="badge bg-light text-dark me-1 mb-1"
                  >
                    {{ tag }}
                  </span>
                </div>
                <div class="mt-3">
                  <button class="btn btn-outline-success w-100" @click="viewRecipe(recipe.id)">
                    <i class="bi bi-eye me-2"></i>View Details
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- No Recipes Message -->
          <div v-if="!loading && featuredRecipes.length === 0" class="col-12 text-center py-5">
            <i class="bi bi-inbox fs-1 text-muted"></i>
            <p class="text-muted mt-3">No recipes available yet. Check back soon!</p>
          </div>
        </div>

        <!-- View All Button -->
        <div class="text-center mt-5">
          <button class="btn btn-success btn-lg" @click="navigateToRecipes">
            <i class="bi bi-collection me-2"></i>View All Recipes
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authMiddleware } from '../middleware/auth.js'
import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore'
import { app } from '../config/firebase.js'

const router = useRouter()
const db = getFirestore(app)

const isAuthenticated = computed(() => authMiddleware.isAuthenticated())
const featuredRecipes = ref([])
const loading = ref(true)

const navigateToRecipes = () => {
  router.push({ name: 'Recipes' })
}

const navigateToAuth = () => {
  router.push({ name: 'Auth' })
}

// Fetch featured recipes from Firestore
const fetchFeaturedRecipes = async () => {
  try {
    loading.value = true
    const recipesQuery = query(collection(db, 'recipes'), limit(3))
    const querySnapshot = await getDocs(recipesQuery)

    featuredRecipes.value = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.title || data.name || 'Untitled Recipe',
        description: data.description || 'Delicious and nutritious recipe.',
        imageUrl:
          data.imageUrl ||
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
        difficulty: data.difficulty || 'Medium',
        prepTime: data.prepTime || 30,
        cookTime: data.cookTime || 30,
        calories: data.calories || 0,
        rating: data.rating || 4.5,
        tags: data.tags || [],
        instructions: data.instructions || [],
      }
    })
  } catch (error) {
    console.error('Error fetching recipes:', error)
    // Fallback to default recipes if fetch fails
    featuredRecipes.value = []
  } finally {
    loading.value = false
  }
}

const viewRecipe = (recipeId) => {
  router.push({ name: 'Recipes', query: { id: recipeId } })
}

// Get recipe image based on index (using provided images)
const getRecipeImage = (index) => {
  const images = [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop', // First image: Grilled meat with mint
    'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=600&h=400&fit=crop', // Second image: Stuffed bell peppers
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&h=400&fit=crop', // Third image: Chicken stir-fry with vegetables
  ]
  return images[index] || images[0]
}

onMounted(() => {
  fetchFeaturedRecipes()
})
</script>

<style scoped>
/* Hero Section */
.hero-section {
  background:
    linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
    url('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1920&h=600&fit=crop')
      center/cover;
  min-height: 500px;
  display: flex;
  align-items: center;
  padding: 100px 0;
  position: relative;
}

.hero-overlay {
  width: 100%;
  padding: 3rem 0;
}

.hero-section h1 {
  font-size: 3.5rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.hero-section .lead {
  font-size: 1.25rem;
  max-width: 700px;
  margin: 0 auto 2rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.hero-section .btn-success {
  padding: 12px 40px;
  font-size: 1.1rem;
  border-radius: 50px;
  transition: all 0.3s ease;
}

.hero-section .btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
}

/* Features Section */
.features-section {
  background: #fff;
}

.feature-icon {
  transition: transform 0.3s ease;
}

.feature-icon:hover {
  transform: scale(1.1);
}

.features-section h3 {
  color: #333;
  font-weight: 600;
}

.features-section p {
  font-size: 0.95rem;
  line-height: 1.6;
}

/* Recipes Section */
.recipes-section {
  background: #f8f9fa;
}

.recipes-section h2 {
  color: #333;
  font-weight: 700;
  margin-bottom: 3rem;
}

.recipe-card {
  border: none;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.recipe-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
}

.recipe-image-header {
  height: 250px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  border-radius: 12px 12px 0 0;
  transition: transform 0.3s ease;
  overflow: hidden;
}

.recipe-card:hover .recipe-image-header {
  transform: scale(1.05);
}

.recipe-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 1;
}

.recipe-card .card-title {
  color: #333;
  font-weight: 600;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recipe-card .card-text {
  font-size: 0.9rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recipe-meta {
  font-size: 0.85rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e9ecef;
}

.recipe-meta i {
  color: #28a745;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 2.5rem;
  }

  .hero-section .lead {
    font-size: 1.1rem;
  }

  .hero-section {
    min-height: 400px;
    padding: 60px 0;
  }

  .features-section .col-md-4 {
    margin-bottom: 2rem;
  }
}

@media (max-width: 576px) {
  .hero-section h1 {
    font-size: 2rem;
  }

  .recipe-image-placeholder {
    height: 200px;
  }
}
</style>
