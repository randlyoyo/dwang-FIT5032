<template>
  <div class="recipe-list-section">
    <div class="container">
      <div class="row">
        <div class="col-12">
          <h2 class="text-center mb-4">Healthy Recipe Collection</h2>
          <p class="text-center text-muted mb-4">
            Discover our collection of nutritious and delicious recipes from around the world
          </p>

          <!-- Search and Filter Controls -->
          <div v-if="!loading" class="search-filter-section mb-4">
            <!-- First Row: Search -->
            <div class="row g-3 mb-3">
              <div class="col-12">
                <label class="form-label fw-bold">
                  <i class="bi bi-search me-2"></i>Search Recipes
                </label>
                <input
                  type="text"
                  class="form-control form-control-lg"
                  placeholder="Search by name, author, or tags..."
                  v-model="searchQuery"
                />
              </div>
            </div>

            <!-- Second Row: Filters and Actions -->
            <div class="row g-3 align-items-end">
              <!-- Category Filter -->
              <div class="col-md-3">
                <label class="form-label fw-bold">
                  <i class="bi bi-funnel me-2"></i>Category
                </label>
                <select class="form-select" v-model="categoryFilter">
                  <option value="">All Categories</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Seafood">Seafood</option>
                  <option value="Poultry">Poultry</option>
                  <option value="Meat">Meat</option>
                  <option value="Breakfast">Breakfast</option>
                  <option value="Salad">Salad</option>
                  <option value="Soup">Soup</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Smoothie">Smoothie</option>
                </select>
              </div>

              <!-- Difficulty Filter -->
              <div class="col-md-3">
                <label class="form-label fw-bold">
                  <i class="bi bi-star me-2"></i>Difficulty
                </label>
                <select class="form-select" v-model="difficultyFilter">
                  <option value="">All Levels</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <!-- Sort By -->
              <div class="col-md-3">
                <label class="form-label fw-bold">
                  <i class="bi bi-sort-alpha-down me-2"></i>Sort By
                </label>
                <select class="form-select" v-model="sortBy" @change="applySorting">
                  <option value="name">Name</option>
                  <option value="rating">Rating</option>
                  <option value="prepTime">Prep Time</option>
                  <option value="calories">Calories</option>
                  <option value="difficulty">Difficulty</option>
                </select>
              </div>

              <!-- Sort Order & Export -->
              <div class="col-md-3">
                <label class="form-label fw-bold">Actions</label>
                <div class="d-flex gap-2">
                  <button
                    class="btn btn-outline-success flex-fill"
                    @click="toggleSortOrder"
                    :title="sortOrder === 'asc' ? 'Sort Ascending' : 'Sort Descending'"
                  >
                    <i :class="sortOrder === 'asc' ? 'bi bi-sort-up' : 'bi bi-sort-down'"></i>
                    {{ sortOrder === 'asc' ? 'Asc' : 'Desc' }}
                  </button>
                  <div class="btn-group flex-fill" role="group">
                    <button
                      class="btn btn-success"
                      @click="showExportOptions"
                      title="Export Recipes"
                    >
                      <i class="bi bi-download me-1"></i>Export
                    </button>
                    <button
                      type="button"
                      class="btn btn-success dropdown-toggle dropdown-toggle-split"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <span class="visually-hidden">Toggle Dropdown</span>
                    </button>
                    <ul class="dropdown-menu">
                      <li>
                        <button class="dropdown-item" @click="exportRecipes('csv')">
                          <i class="bi bi-file-earmark-spreadsheet me-2"></i>Export as CSV
                        </button>
                      </li>
                      <li>
                        <button class="dropdown-item" @click="exportRecipes('json')">
                          <i class="bi bi-file-earmark-code me-2"></i>Export as JSON
                        </button>
                      </li>
                      <li>
                        <button class="dropdown-item" @click="exportRecipes('pdf')">
                          <i class="bi bi-file-earmark-pdf me-2"></i>Export as PDF
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- Results Info -->
            <div class="results-info mt-3">
              <p class="text-muted mb-0">
                Showing {{ paginatedRecipes.length }} of {{ filteredRecipes.length }} recipes
                <span v-if="searchQuery || categoryFilter || difficultyFilter">
                  (filtered from {{ recipes.length }} total)
                </span>
                <button
                  class="btn btn-sm btn-link"
                  @click="clearFilters"
                  v-if="searchQuery || categoryFilter || difficultyFilter"
                >
                  Clear Filters
                </button>
              </p>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="text-center my-5">
            <div class="spinner-border text-success" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-muted">Loading recipes from database...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="alert alert-warning text-center" role="alert">
            <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
          </div>

          <!-- Recipes Grid -->
          <div v-else class="row">
            <div v-for="recipe in paginatedRecipes" :key="recipe.id" class="col-lg-4 col-md-6 mb-4">
              <div
                :id="`recipe-${recipe.id}`"
                class="card recipe-card h-100"
                :class="{ 'highlighted-recipe': highlightedRecipeId === recipe.id }"
              >
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
                        <div class="fw-bold">{{ recipe.calories || 'N/A' }}</div>
                      </div>
                      <div class="col-4">
                        <small class="text-muted">Protein</small>
                        <div class="fw-bold">{{ recipe.protein || 'N/A' }}</div>
                      </div>
                    </div>
                  </div>

                  <div class="recipe-tags mb-3">
                    <span
                      v-for="tag in recipe.tags"
                      :key="tag"
                      class="badge bg-light text-dark me-1 mb-1"
                    >
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

          <!-- Empty State -->
          <div v-if="!loading && !error && filteredRecipes.length === 0" class="text-center my-5">
            <i class="bi bi-inbox display-1 text-muted"></i>
            <p class="mt-3 text-muted">
              {{
                searchQuery || categoryFilter || difficultyFilter
                  ? 'No recipes match your filters. Try adjusting your search criteria.'
                  : 'No recipes found. Please check back later!'
              }}
            </p>
          </div>

          <!-- Pagination -->
          <div
            v-if="!loading && !error && filteredRecipes.length > itemsPerPage"
            class="pagination-section mt-4"
          >
            <nav aria-label="Recipe pagination">
              <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button
                    class="page-link"
                    @click="changePage(currentPage - 1)"
                    :disabled="currentPage === 1"
                  >
                    <i class="bi bi-chevron-left"></i> Previous
                  </button>
                </li>
                <li
                  v-for="page in displayedPages"
                  :key="page"
                  class="page-item"
                  :class="{ active: currentPage === page }"
                >
                  <button class="page-link" @click="changePage(page)">{{ page }}</button>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button
                    class="page-link"
                    @click="changePage(currentPage + 1)"
                    :disabled="currentPage === totalPages"
                  >
                    Next <i class="bi bi-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
            <p class="text-center text-muted mt-2">
              Page {{ currentPage }} of {{ totalPages }} ({{ filteredRecipes.length }} total
              recipes)
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import RecipeRating from './RecipeRating.vue'
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore'
import { app } from '../config/firebase.js'
import * as cloudFunctions from '../services/cloudFunctions.js'

const route = useRoute()
const db = getFirestore(app)
const recipes = ref([])
const showRating = ref({})
const loading = ref(true)
const error = ref(null)
const highlightedRecipeId = ref(null)

// Search and Filter
const searchQuery = ref('')
const categoryFilter = ref('')
const difficultyFilter = ref('')
const sortBy = ref('name')
const sortOrder = ref('asc')

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(12)

onMounted(async () => {
  await fetchRecipes()

  // Check if there's a category filter in the query params (from chart navigation)
  if (route.query.category) {
    categoryFilter.value = route.query.category
    console.log('Applied category filter from URL:', route.query.category)
  }

  // Check if there's a recipe ID in the query params
  if (route.query.id) {
    highlightedRecipeId.value = route.query.id

    // Find the recipe and navigate to its page
    const recipeIndex = recipes.value.findIndex((r) => r.id === route.query.id)
    if (recipeIndex !== -1) {
      // Calculate which page the recipe is on
      const targetPage = Math.ceil((recipeIndex + 1) / itemsPerPage.value)
      currentPage.value = targetPage

      // Wait for DOM to update, then scroll to the highlighted recipe
      await nextTick()
      setTimeout(() => {
        const element = document.getElementById(`recipe-${route.query.id}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 500)

      // Remove highlight after 3 seconds
      setTimeout(() => {
        highlightedRecipeId.value = null
      }, 3000)
    }
  }
})

// Calculate default protein value based on calories
const getDefaultProtein = (calories) => {
  if (!calories || calories === 0) return '8g'
  // Generally about 4-6g protein per 100 calories
  const protein = Math.round((calories / 100) * 5)
  return `${protein}g`
}

// Cloud Functions integration: Get recipe analytics data
const recipeAnalytics = ref({})
const loadingAnalytics = ref(false)

const getRecipeAnalytics = async (recipeId) => {
  try {
    loadingAnalytics.value = true
    const result = await cloudFunctions.getRecipeAnalytics(recipeId)
    recipeAnalytics.value[recipeId] = result.analytics
    return result.analytics
  } catch (error) {
    console.error('Error getting recipe analytics:', error)
    return null
  } finally {
    loadingAnalytics.value = false
  }
}

// Cloud Functions integration: Get personalized recommendations
const getPersonalizedRecommendations = async () => {
  try {
    const result = await cloudFunctions.getRecipeRecommendations({
      preferences: 'healthy, quick, vegetarian',
    })
    return result.recommendations || []
  } catch (error) {
    console.error('Error getting recommendations:', error)
    return []
  }
}

const fetchRecipes = async () => {
  try {
    loading.value = true
    error.value = null

    // Fetch ALL recipes from Firestore (no limit)
    // First try to get all recipes without limiting by isPublished field
    const q = query(collection(db, 'recipes'))
    const querySnapshot = await getDocs(q)

    console.log(`Found ${querySnapshot.docs.length} recipes in Firestore`)

    recipes.value = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      console.log('Raw Firestore data for recipe:', doc.id, data) // Debug: View raw data
      return {
        id: doc.id,
        name: data.title || data.name || 'Untitled Recipe',
        chef: data.authorName || data.chef || 'Unknown Chef',
        category: data.category || 'General',
        cuisine: data.cuisine || 'General',
        difficulty: data.difficulty || 'Medium',
        prepTime: data.prepTime || 0,
        cookTime: data.cookTime || 0,
        servings: data.servings || 1,
        description: data.description || 'No description available',
        tags: data.tags || [],
        rating: data.rating || null, // Keep null instead of 0 since not all recipes have ratings
        views: data.views || 0,
        likes: data.likes || 0,
        calories: data.calories || null, // Keep null instead of 0 since not all recipes have calories
        protein: data.protein || null,
        ingredients: data.ingredients || [],
        instructions: data.instructions || [],
        createdAt: data.createdAt || null,
        updatedAt: data.updatedAt || null,
        nutrition: {
          calories: data.calories || null,
          protein: data.protein || null,
        },
      }
    })

    console.log(`✅ Loaded ${recipes.value.length} recipes from Firestore`)
    console.log('Sample recipe data:', recipes.value[0]) // Debug: View first recipe data structure
  } catch (err) {
    console.error('Error fetching recipes from Firestore:', err)
    error.value = 'Failed to load recipes. Please try again later.'
    // Fallback to empty array
    recipes.value = []
  } finally {
    loading.value = false
  }
}

// Computed: Filtered recipes based on search and filters
const filteredRecipes = computed(() => {
  let result = recipes.value

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (recipe) =>
        recipe.name.toLowerCase().includes(query) ||
        recipe.chef.toLowerCase().includes(query) ||
        recipe.description.toLowerCase().includes(query) ||
        recipe.tags.some((tag) => tag.toLowerCase().includes(query)),
    )
  }

  // Apply category filter
  if (categoryFilter.value) {
    result = result.filter((recipe) => recipe.category === categoryFilter.value)
  }

  // Apply difficulty filter
  if (difficultyFilter.value) {
    result = result.filter((recipe) => recipe.difficulty === difficultyFilter.value)
  }

  // Apply sorting
  result = [...result].sort((a, b) => {
    let aVal = a[sortBy.value]
    let bVal = b[sortBy.value]

    // Handle different data types
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }

    if (sortOrder.value === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
    }
  })

  return result
})

// Computed: Total pages
const totalPages = computed(() => {
  return Math.ceil(filteredRecipes.value.length / itemsPerPage.value)
})

// Computed: Paginated recipes
const paginatedRecipes = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredRecipes.value.slice(start, end)
})

// Computed: Displayed page numbers for pagination
const displayedPages = computed(() => {
  const pages = []
  const maxPagesToShow = 5
  let startPage = Math.max(1, currentPage.value - Math.floor(maxPagesToShow / 2))
  let endPage = Math.min(totalPages.value, startPage + maxPagesToShow - 1)

  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }
  return pages
})

// Watch: Reset to page 1 when filters change
watch([searchQuery, categoryFilter, difficultyFilter], () => {
  currentPage.value = 1
})

// Methods
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    // Scroll to top of recipes
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

const applySorting = () => {
  currentPage.value = 1
}

const clearFilters = () => {
  searchQuery.value = ''
  categoryFilter.value = ''
  difficultyFilter.value = ''
  sortBy.value = 'name'
  sortOrder.value = 'asc'
  currentPage.value = 1
}

// Export recipes data
// Show export options modal
const showExportOptions = () => {
  if (!filteredRecipes.value || filteredRecipes.value.length === 0) {
    alert('No recipes to export. Please add some recipes first.')
    return
  }

  // For now, default to CSV (backward compatibility)
  exportRecipes('csv')
}

// Export recipes data with format selection
const exportRecipes = (format = 'csv') => {
  try {
    // Check if there are recipes to export
    if (!filteredRecipes.value || filteredRecipes.value.length === 0) {
      alert('No recipes to export. Please add some recipes first.')
      return
    }

    console.log(
      `Starting ${format.toUpperCase()} export with`,
      filteredRecipes.value.length,
      'recipes',
    )

    const exportData = filteredRecipes.value.map((recipe) => {
      // Safely handle timestamp
      const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'N/A'
        try {
          if (timestamp.seconds) {
            return new Date(timestamp.seconds * 1000).toISOString()
          } else if (timestamp.toDate) {
            return timestamp.toDate().toISOString()
          } else if (timestamp instanceof Date) {
            return timestamp.toISOString()
          } else {
            return new Date(timestamp).toISOString()
          }
        } catch (e) {
          console.warn('Error formatting timestamp:', e)
          return 'N/A'
        }
      }

      return {
        ID: recipe.id || 'N/A',
        Name: recipe.name || 'N/A',
        Chef: recipe.chef || 'N/A',
        Category: recipe.category || 'N/A',
        Cuisine: recipe.cuisine || 'N/A',
        Difficulty: recipe.difficulty || 'N/A',
        'Prep Time': recipe.prepTime || 'N/A',
        'Cook Time': recipe.cookTime || 'N/A',
        Servings: recipe.servings || 'N/A',
        Calories:
          recipe.calories !== null && recipe.calories !== undefined ? recipe.calories : 'N/A',
        Protein: recipe.protein !== null && recipe.protein !== undefined ? recipe.protein : 'N/A',
        Rating: recipe.rating !== null && recipe.rating !== undefined ? recipe.rating : 'N/A',
        Views: recipe.views || 0,
        Likes: recipe.likes || 0,
        Description: recipe.description || 'N/A',
        Tags: (recipe.tags && Array.isArray(recipe.tags) ? recipe.tags : []).join('; '),
        Ingredients: (recipe.ingredients && Array.isArray(recipe.ingredients)
          ? recipe.ingredients
          : []
        ).join('; '),
        Instructions: (recipe.instructions && Array.isArray(recipe.instructions)
          ? recipe.instructions
          : []
        ).join(' | '),
        'Created At': formatTimestamp(recipe.createdAt),
        'Updated At': formatTimestamp(recipe.updatedAt),
      }
    })

    console.log('Export data prepared:', exportData.length, 'records')

    if (exportData.length === 0) {
      alert('No data to export.')
      return
    }

    // Export based on format
    switch (format.toLowerCase()) {
      case 'csv':
        exportAsCSV(exportData)
        break
      case 'json':
        exportAsJSON(exportData)
        break
      case 'pdf':
        exportAsPDF(exportData)
        break
      default:
        alert('Unsupported export format: ' + format)
        return
    }

    console.log(`${format.toUpperCase()} export completed successfully`)
    alert(`Successfully exported ${exportData.length} recipes as ${format.toUpperCase()}!`)
  } catch (error) {
    console.error('Export failed:', error)
    alert('Export failed: ' + error.message)
  }
}

// Export as CSV
const exportAsCSV = (data) => {
  const headers = Object.keys(data[0])
  console.log('CSV headers:', headers)

  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header] || ''
          const stringValue = String(value)
          // Handle line breaks and special characters
          const escapedValue = stringValue
            .replace(/"/g, '""')
            .replace(/\n/g, ' ')
            .replace(/\r/g, ' ')
          return `"${escapedValue}"`
        })
        .join(','),
    ),
  ].join('\n')

  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `recipes_export_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Export as JSON
const exportAsJSON = (data) => {
  const jsonContent = JSON.stringify(
    {
      exportDate: new Date().toISOString(),
      totalRecords: data.length,
      data: data,
    },
    null,
    2,
  )

  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `recipes_export_${new Date().toISOString().split('T')[0]}.json`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Export as PDF
const exportAsPDF = (data) => {
  // Create a simple HTML table for PDF generation
  const headers = Object.keys(data[0])

  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Recipes Export</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #28a745; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #28a745; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        .export-info { margin-bottom: 20px; text-align: center; color: #666; }
      </style>
    </head>
    <body>
      <h1>Healthy Recipe Hub - Recipes Export</h1>
      <div class="export-info">
        <p>Export Date: ${new Date().toLocaleDateString()}</p>
        <p>Total Recipes: ${data.length}</p>
      </div>
      <table>
        <thead>
          <tr>
            ${headers.map((header) => `<th>${header}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data
            .map(
              (row) => `
            <tr>
              ${headers.map((header) => `<td>${row[header] || ''}</td>`).join('')}
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    </body>
    </html>
  `

  // Create a new window and print
  const printWindow = window.open('', '_blank')
  printWindow.document.write(htmlContent)
  printWindow.document.close()

  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    printWindow.print()
    printWindow.close()
  }
}

const viewRecipe = (recipe) => {
  // For now, just show an alert with basic info
  // In a real app, this would navigate to a detailed recipe page
  alert(
    `Recipe: ${recipe.name}\nChef: ${recipe.chef}\nCuisine: ${recipe.cuisine}\nDifficulty: ${recipe.difficulty}\nPrep Time: ${recipe.prepTime} min\nCook Time: ${recipe.cookTime} min\nServings: ${recipe.servings}\n\nDescription: ${recipe.description}`,
  )
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
  min-height: 100vh;
}

/* Search and Filter Section */
.search-filter-section {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.search-filter-section .form-label {
  color: #28a745;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.search-filter-section .form-control,
.search-filter-section .form-select {
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  transition: border-color 0.3s ease;
}

.search-filter-section .form-control:focus,
.search-filter-section .form-select:focus {
  border-color: #28a745;
  box-shadow: 0 0 0 0.25rem rgba(40, 167, 69, 0.25);
}

.results-info {
  padding: 0.75rem;
  background-color: white;
  border-radius: 8px;
  border-left: 4px solid #28a745;
}

/* Recipe Cards */
.recipe-card {
  border: 1px solid #ddd;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  height: 100%;
}

.recipe-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.recipe-card .card-header {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  padding: 15px;
  border-radius: 12px 12px 0 0;
}

.recipe-card .card-header h5 {
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.recipe-card .card-header small {
  opacity: 0.9;
}

.recipe-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.recipe-description {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Highlighted Recipe Animation */
.highlighted-recipe {
  animation: highlight-pulse 1.5s ease-in-out 2;
  box-shadow: 0 0 20px rgba(40, 167, 69, 0.6) !important;
  border: 2px solid #28a745 !important;
}

@keyframes highlight-pulse {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(40, 167, 69, 0.6);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 30px rgba(40, 167, 69, 0.8);
    transform: scale(1.02);
  }
}

.recipe-stats {
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  margin: 0;
}

.recipe-stats .fw-bold {
  color: #28a745;
  font-size: 1.1rem;
}

.recipe-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  min-height: 30px;
}

.badge {
  font-size: 0.75rem;
  padding: 0.35em 0.65em;
}

/* Pagination */
.pagination-section {
  margin-top: 3rem;
}

.pagination .page-link {
  color: #28a745;
  border-color: #28a745;
  transition: all 0.3s ease;
}

.pagination .page-link:hover {
  background-color: #28a745;
  border-color: #28a745;
  color: white;
}

.pagination .page-item.active .page-link {
  background-color: #28a745;
  border-color: #28a745;
}

.pagination .page-item.disabled .page-link {
  color: #6c757d;
  border-color: #dee2e6;
}

/* Responsive Design */
@media (max-width: 768px) {
  .recipe-list-section {
    padding: 1rem 0;
  }

  .search-filter-section {
    padding: 1rem;
  }

  .search-filter-section .col-md-4,
  .search-filter-section .col-md-3,
  .search-filter-section .col-md-2,
  .search-filter-section .col-md-1 {
    margin-bottom: 0.5rem;
  }

  .recipe-card {
    margin-bottom: 1.5rem;
  }

  .recipe-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .pagination-section {
    margin-top: 2rem;
  }

  .pagination {
    flex-wrap: wrap;
    justify-content: center;
  }

  .pagination .page-item {
    margin: 2px;
  }
}

@media (max-width: 576px) {
  .recipe-card .card-header h5 {
    font-size: 1rem;
  }

  .recipe-description {
    font-size: 0.85rem;
  }
}
</style>
