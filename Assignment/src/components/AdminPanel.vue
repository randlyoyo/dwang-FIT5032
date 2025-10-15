<template>
  <div class="py-5">
    <div class="container">
      <div class="row">
        <div class="col-12">
          <h2 class="text-center mb-4"><i class="bi bi-speedometer2 me-2"></i>Admin Dashboard</h2>
          <div class="alert alert-info">
            <h5>Welcome, {{ currentUser.fullName || currentUser.email }}!</h5>
            <p class="mb-0">Manage users, recipes, create new content and view system analytics.</p>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3">Loading admin data...</p>
          </div>

          <!-- Main Content -->
          <div v-else>
            <!-- Tab Navigation -->
            <ul class="nav nav-tabs mb-4" role="tablist">
              <li class="nav-item" role="presentation">
                <button
                  class="nav-link"
                  :class="{ active: activeTab === 'users' }"
                  @click="activeTab = 'users'"
                >
                  <i class="bi bi-people me-2"></i>Users
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button
                  class="nav-link"
                  :class="{ active: activeTab === 'recipes' }"
                  @click="activeTab = 'recipes'"
                >
                  <i class="bi bi-book me-2"></i>Recipes
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button
                  class="nav-link"
                  :class="{ active: activeTab === 'create' }"
                  @click="activeTab = 'create'"
                >
                  <i class="bi bi-plus-circle me-2"></i>Create Recipe
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button
                  class="nav-link"
                  :class="{ active: activeTab === 'analytics' }"
                  @click="activeTab = 'analytics'"
                >
                  <i class="bi bi-bar-chart-line me-2"></i>Analytics
                </button>
              </li>
            </ul>

            <!-- Users Tab -->
            <div v-show="activeTab === 'users'" class="fade-in">
              <UserManagement />
            </div>

            <!-- Recipes Tab -->
            <div v-show="activeTab === 'recipes'" class="fade-in">
              <div class="card border-0 shadow-sm">
                <div class="card-header bg-white">
                  <h5 class="mb-0"><i class="bi bi-book me-2"></i>All Recipes</h5>
                </div>
                <div class="card-body">
                  <RecipeList />
                </div>
              </div>
            </div>

            <!-- Create Recipe Tab -->
            <div v-show="activeTab === 'create'" class="fade-in">
              <div class="card border-0 shadow-sm">
                <div class="card-header bg-white">
                  <h5 class="mb-0"><i class="bi bi-plus-circle me-2"></i>Create New Recipe</h5>
                </div>
                <div class="card-body">
                  <form @submit.prevent="saveRecipe('publish')">
                    <div class="row">
                      <!-- Basic Information -->
                      <div class="col-md-8">
                        <h6 class="mb-3">Basic Information</h6>

                        <div class="mb-3">
                          <label class="form-label">Recipe Title *</label>
                          <input
                            type="text"
                            class="form-control"
                            v-model="recipeForm.title"
                            required
                            placeholder="Enter recipe title"
                          />
                        </div>

                        <div class="mb-3">
                          <label class="form-label">Description *</label>
                          <textarea
                            class="form-control"
                            rows="3"
                            v-model="recipeForm.description"
                            required
                            placeholder="Brief description of the recipe"
                          ></textarea>
                        </div>

                        <div class="row">
                          <div class="col-md-4 mb-3">
                            <label class="form-label">Prep Time (minutes) *</label>
                            <input
                              type="number"
                              class="form-control"
                              v-model.number="recipeForm.prepTime"
                              required
                              min="0"
                            />
                          </div>
                          <div class="col-md-4 mb-3">
                            <label class="form-label">Cook Time (minutes) *</label>
                            <input
                              type="number"
                              class="form-control"
                              v-model.number="recipeForm.cookTime"
                              required
                              min="0"
                            />
                          </div>
                          <div class="col-md-4 mb-3">
                            <label class="form-label">Servings *</label>
                            <input
                              type="number"
                              class="form-control"
                              v-model.number="recipeForm.servings"
                              required
                              min="1"
                            />
                          </div>
                        </div>

                        <div class="row">
                          <div class="col-md-4 mb-3">
                            <label class="form-label">Calories *</label>
                            <input
                              type="number"
                              class="form-control"
                              v-model.number="recipeForm.calories"
                              required
                              min="0"
                            />
                          </div>
                          <div class="col-md-4 mb-3">
                            <label class="form-label">Protein (g) *</label>
                            <input
                              type="number"
                              class="form-control"
                              v-model.number="recipeForm.protein"
                              required
                              min="0"
                              step="0.1"
                            />
                          </div>
                          <div class="col-md-4 mb-3">
                            <label class="form-label">Difficulty *</label>
                            <select class="form-control" v-model="recipeForm.difficulty" required>
                              <option value="">Select difficulty</option>
                              <option value="Easy">Easy</option>
                              <option value="Medium">Medium</option>
                              <option value="Hard">Hard</option>
                            </select>
                          </div>
                        </div>

                        <!-- Ingredients -->
                        <h6 class="mb-3 mt-4">Ingredients</h6>
                        <div
                          v-for="(ingredient, index) in recipeForm.ingredients"
                          :key="index"
                          class="mb-2"
                        >
                          <div class="input-group">
                            <input
                              type="text"
                              class="form-control"
                              v-model="recipeForm.ingredients[index]"
                              placeholder="e.g., 2 cups flour"
                            />
                            <button
                              type="button"
                              class="btn btn-outline-danger"
                              @click="removeIngredient(index)"
                            >
                              <i class="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          class="btn btn-outline-primary btn-sm"
                          @click="addIngredient"
                        >
                          <i class="bi bi-plus"></i> Add Ingredient
                        </button>

                        <!-- Instructions -->
                        <h6 class="mb-3 mt-4">Instructions</h6>
                        <div
                          v-for="(step, index) in recipeForm.instructions"
                          :key="index"
                          class="mb-2"
                        >
                          <div class="input-group">
                            <span class="input-group-text">{{ index + 1 }}</span>
                            <textarea
                              class="form-control"
                              rows="2"
                              v-model="recipeForm.instructions[index]"
                              placeholder="Describe this step"
                            ></textarea>
                            <button
                              type="button"
                              class="btn btn-outline-danger"
                              @click="removeInstruction(index)"
                            >
                              <i class="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          class="btn btn-outline-primary btn-sm"
                          @click="addInstruction"
                        >
                          <i class="bi bi-plus"></i> Add Step
                        </button>
                      </div>

                      <!-- Sidebar -->
                      <div class="col-md-4">
                        <h6 class="mb-3">Additional Details</h6>

                        <div class="mb-3">
                          <label class="form-label">Image URL</label>
                          <input
                            type="url"
                            class="form-control"
                            v-model="recipeForm.imageUrl"
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>

                        <div class="mb-3">
                          <label class="form-label">Tags (comma separated)</label>
                          <input
                            type="text"
                            class="form-control"
                            v-model="recipeForm.tagsInput"
                            placeholder="healthy, vegan, quick"
                          />
                        </div>

                        <div class="mb-3">
                          <label class="form-label">Category</label>
                          <select class="form-control" v-model="recipeForm.category">
                            <option value="">Select category</option>
                            <option value="Breakfast">Breakfast</option>
                            <option value="Lunch">Lunch</option>
                            <option value="Dinner">Dinner</option>
                            <option value="Snack">Snack</option>
                            <option value="Dessert">Dessert</option>
                          </select>
                        </div>

                        <div class="alert alert-info">
                          <small>
                            <i class="bi bi-info-circle me-1"></i>
                            <strong>Tip:</strong> You can save this recipe as a draft to continue
                            editing later.
                          </small>
                        </div>
                      </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="mt-4 pt-3 border-top">
                      <div class="d-flex justify-content-between">
                        <button type="button" class="btn btn-secondary" @click="resetForm">
                          <i class="bi bi-x-circle me-2"></i>Clear Form
                        </button>
                        <div>
                          <button
                            type="button"
                            class="btn btn-outline-primary me-2"
                            @click="saveRecipe('draft')"
                          >
                            <i class="bi bi-file-earmark me-2"></i>Save as Draft
                          </button>
                          <button type="submit" class="btn btn-success">
                            <i class="bi bi-check-circle me-2"></i>Publish Recipe
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <!-- Analytics Tab -->
            <div v-show="activeTab === 'analytics'" class="fade-in">
              <InteractiveCharts />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authMiddleware } from '../middleware/auth.js'
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import app from '../config/firebase.js'
import RecipeList from './RecipeList.vue'
import UserManagement from './UserManagement.vue'
import InteractiveCharts from './InteractiveCharts.vue'

const router = useRouter()
const db = getFirestore(app)
const activeTab = ref('users')
const loading = ref(true)

const currentUser = computed(() => authMiddleware.getCurrentUser())

const stats = ref({
  totalUsers: 0,
  totalRecipes: 0,
  publishedRecipes: 0,
  activeUsers: 0,
})

const recentUsers = ref([])

// Recipe Form Data
const recipeForm = ref({
  title: '',
  description: '',
  prepTime: 0,
  cookTime: 0,
  servings: 1,
  calories: 0,
  protein: 0,
  difficulty: '',
  ingredients: [''],
  instructions: [''],
  imageUrl: '',
  tagsInput: '',
  category: '',
})

// Recipe Form Methods
const addIngredient = () => {
  recipeForm.value.ingredients.push('')
}

const removeIngredient = (index) => {
  if (recipeForm.value.ingredients.length > 1) {
    recipeForm.value.ingredients.splice(index, 1)
  }
}

const addInstruction = () => {
  recipeForm.value.instructions.push('')
}

const removeInstruction = (index) => {
  if (recipeForm.value.instructions.length > 1) {
    recipeForm.value.instructions.splice(index, 1)
  }
}

const resetForm = () => {
  recipeForm.value = {
    title: '',
    description: '',
    prepTime: 0,
    cookTime: 0,
    servings: 1,
    calories: 0,
    protein: 0,
    difficulty: '',
    ingredients: [''],
    instructions: [''],
    imageUrl: '',
    tagsInput: '',
    category: '',
  }
}

const saveRecipe = async (status) => {
  try {
    // Parse tags
    const tags = recipeForm.value.tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag)

    // Prepare recipe data
    const recipeData = {
      title: recipeForm.value.title,
      name: recipeForm.value.title,
      description: recipeForm.value.description,
      prepTime: recipeForm.value.prepTime,
      cookTime: recipeForm.value.cookTime,
      servings: recipeForm.value.servings,
      calories: recipeForm.value.calories,
      protein: recipeForm.value.protein,
      difficulty: recipeForm.value.difficulty,
      ingredients: recipeForm.value.ingredients.filter((i) => i.trim()),
      instructions: recipeForm.value.instructions.filter((i) => i.trim()),
      imageUrl:
        recipeForm.value.imageUrl ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop',
      tags: tags,
      category: recipeForm.value.category || 'General',
      status: status, // 'draft' or 'publish'
      rating: 0,
      createdBy: currentUser.value.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Save to Firestore
    const { addDoc } = await import('firebase/firestore')
    await addDoc(collection(db, 'recipes'), recipeData)

    alert(`Recipe ${status === 'draft' ? 'saved as draft' : 'published'} successfully!`)

    // Reset form and switch to recipes tab
    resetForm()
    if (status === 'publish') {
      activeTab.value = 'recipes'
    }
  } catch (error) {
    console.error('Error saving recipe:', error)
    alert('Failed to save recipe: ' + error.message)
  }
}

onMounted(async () => {
  // 检查管理员权限
  if (!authMiddleware.isAdmin()) {
    router.push({ name: 'Home' })
    return
  }

  // 加载真实数据
  await loadAllData()
})

const loadAllData = async () => {
  loading.value = true
  try {
    await Promise.all([loadStats(), loadRecentUsers()])
  } catch (error) {
    console.error('Error loading admin data:', error)
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    // 获取用户统计
    const usersSnapshot = await getDocs(collection(db, 'users'))
    stats.value.totalUsers = usersSnapshot.size

    // 统计活跃用户（有 isActive 字段的）
    let activeCount = 0
    usersSnapshot.forEach((doc) => {
      const userData = doc.data()
      if (userData.isActive) {
        activeCount++
      }
    })
    stats.value.activeUsers = activeCount

    // 获取食谱统计
    const recipesSnapshot = await getDocs(collection(db, 'recipes'))
    stats.value.totalRecipes = recipesSnapshot.size

    // 统计已发布的食谱
    let publishedCount = 0
    recipesSnapshot.forEach((doc) => {
      const recipeData = doc.data()
      if (recipeData.status === 'published') {
        publishedCount++
      }
    })
    stats.value.publishedRecipes = publishedCount

    console.log('Admin stats loaded:', stats.value)
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

const loadRecentUsers = async () => {
  try {
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(10))
    const querySnapshot = await getDocs(usersQuery)

    recentUsers.value = querySnapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    }))

    console.log('Recent users loaded:', recentUsers.value.length)
  } catch (error) {
    console.error('Error loading recent users:', error)
    // 如果排序失败，尝试不排序直接获取
    try {
      const querySnapshot = await getDocs(collection(db, 'users'))
      recentUsers.value = querySnapshot.docs.slice(0, 10).map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      }))
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError)
      recentUsers.value = []
    }
  }
}

const refreshData = async () => {
  await loadAllData()
}
</script>

<style scoped>
.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.stat-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  margin: 0 auto;
  font-size: 1.5rem;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  transition: all 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
}

.nav-tabs .nav-link {
  color: #6c757d;
  border: none;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.nav-tabs .nav-link:hover {
  border-bottom-color: #dee2e6;
  color: #495057;
}

.nav-tabs .nav-link.active {
  color: #0d6efd;
  background-color: transparent;
  border-bottom-color: #0d6efd;
  font-weight: 600;
}

.list-group-item {
  transition: background-color 0.2s;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

.progress {
  background-color: #e9ecef;
}

.btn {
  transition: all 0.2s;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
