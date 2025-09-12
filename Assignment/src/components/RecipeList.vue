<template>
  <div class="recipe-list-section">
    <div class="container">
      <div class="row">
        <div class="col-12">
          <h2 class="text-center mb-4">Featured Healthy Recipes</h2>
          <p class="text-center text-muted mb-5">Discover our collection of nutritious and delicious recipes from around the world</p>

          <div class="row">
            <div v-for="recipe in recipes" :key="recipe.id" class="col-lg-4 col-md-6 mb-4">
              <div class="card recipe-card h-100">
                <div class="card-header bg-success text-white">
                  <h5 class="mb-0">{{ recipe.name }}</h5>
                  <small>by {{ recipe.chef }}</small>
                </div>

                <div class="card-body">
                  <div class="recipe-meta mb-3">
                    <span class="badge me-2" :class="getDifficultyClass(recipe.difficulty)">
                      {{ recipe.difficulty }}
                    </span>
                    <span class="badge bg-secondary me-2">{{ recipe.cuisine }}</span>
                    <span class="text-muted small">
                      <i class="bi bi-clock"></i> {{ recipe.prepTime + recipe.cookTime }} min
                    </span>
                  </div>

                  <p class="recipe-description">{{ recipe.description }}</p>

                  <div class="recipe-stats mb-3">
                    <div class="row text-center">
                      <div class="col-4">
                        <small class="text-muted">Servings</small>
                        <div class="fw-bold">{{ recipe.servings }}</div>
                      </div>
                      <div class="col-4">
                        <small class="text-muted">Calories</small>
                        <div class="fw-bold">{{ recipe.nutritionInfo.calories }}</div>
                      </div>
                      <div class="col-4">
                        <small class="text-muted">Protein</small>
                        <div class="fw-bold">{{ recipe.nutritionInfo.protein }}</div>
                      </div>
                    </div>
                  </div>

                  <div class="recipe-tags mb-3">
                    <span v-for="tag in recipe.tags" :key="tag" class="badge bg-light text-dark me-1 mb-1">
                      {{ tag }}
                    </span>
                  </div>
                </div>

                <div class="card-footer">
                  <div class="d-flex justify-content-between align-items-center">
                    <button @click="viewRecipe(recipe)" class="btn btn-outline-primary btn-sm">
                      View Details
                    </button>
                    <button @click="toggleRating(recipe.id)" class="btn btn-outline-success btn-sm">
                      {{ showRating[recipe.id] ? 'Hide Rating' : 'Rate Recipe' }}
                    </button>
                  </div>

                  <!-- Individual Recipe Rating -->
                  <div v-if="showRating[recipe.id]" class="mt-3">
                    <RecipeRating :recipe-id="recipe.id" :recipe-name="recipe.name" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import RecipeRating from './RecipeRating.vue'
import recipesData from '../assets/json/recipes.json'

const recipes = ref([])
const showRating = ref({})

onMounted(() => {
  recipes.value = recipesData
})

const viewRecipe = (recipe) => {
  // For now, just show an alert with basic info
  // In a real app, this would navigate to a detailed recipe page
  alert(`Recipe: ${recipe.name}\nChef: ${recipe.chef}\nCuisine: ${recipe.cuisine}\nDifficulty: ${recipe.difficulty}\nPrep Time: ${recipe.prepTime} min\nCook Time: ${recipe.cookTime} min\nServings: ${recipe.servings}\n\nDescription: ${recipe.description}`)
}

const toggleRating = (recipeId) => {
  showRating.value[recipeId] = !showRating.value[recipeId]
}

const getDifficultyClass = (difficulty) => {
  switch (difficulty) {
    case 'Easy':
      return 'bg-success'
    case 'Medium':
      return 'bg-warning'
    case 'Hard':
      return 'bg-danger'
    default:
      return 'bg-secondary'
  }
}
</script>

<style scoped>
.recipe-list-section {
  padding: 2rem 0;
}

.recipe-card {
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.recipe-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.recipe-card .card-header {
  background-color: #198754;
  color: white;
  padding: 15px;
  border-radius: 10px 10px 0 0;
}

.recipe-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
}

.recipe-description {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recipe-stats {
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 5px;
}

.recipe-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.badge {
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .recipe-card {
    margin-bottom: 1rem;
  }

  .recipe-meta {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
