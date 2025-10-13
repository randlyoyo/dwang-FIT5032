<template>
  <div class="py-5">
    <div class="container">
      <div class="row">
        <div class="col-12">
          <h2 class="text-center mb-4"><i class="bi bi-shield-lock-fill me-2"></i>Admin Panel</h2>
          <div class="alert alert-info">
            <h5>Welcome, {{ currentUser.fullName || currentUser.email }}!</h5>
            <p class="mb-0">
              Manage users, recipes, and view system analytics with real-time Firebase data.
            </p>
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
                  :class="{ active: activeTab === 'overview' }"
                  @click="activeTab = 'overview'"
                >
                  <i class="bi bi-speedometer2 me-2"></i>Overview
                </button>
              </li>
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
                  :class="{ active: activeTab === 'analytics' }"
                  @click="activeTab = 'analytics'"
                >
                  <i class="bi bi-bar-chart-line me-2"></i>Analytics
                </button>
              </li>
            </ul>

            <!-- Overview Tab -->
            <div v-show="activeTab === 'overview'" class="fade-in">
              <!-- Statistics Cards -->
              <div class="row mb-4">
                <div class="col-md-3 mb-3">
                  <div class="stat-card card border-0 shadow-sm">
                    <div class="card-body text-center">
                      <div class="stat-icon bg-primary bg-opacity-10">
                        <i class="bi bi-people-fill text-primary"></i>
                      </div>
                      <h3 class="mt-3 mb-1">{{ stats.totalUsers }}</h3>
                      <p class="text-muted mb-0">Total Users</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-3 mb-3">
                  <div class="stat-card card border-0 shadow-sm">
                    <div class="card-body text-center">
                      <div class="stat-icon bg-success bg-opacity-10">
                        <i class="bi bi-book-fill text-success"></i>
                      </div>
                      <h3 class="mt-3 mb-1">{{ stats.totalRecipes }}</h3>
                      <p class="text-muted mb-0">Total Recipes</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-3 mb-3">
                  <div class="stat-card card border-0 shadow-sm">
                    <div class="card-body text-center">
                      <div class="stat-icon bg-warning bg-opacity-10">
                        <i class="bi bi-eye-fill text-warning"></i>
                      </div>
                      <h3 class="mt-3 mb-1">{{ stats.publishedRecipes }}</h3>
                      <p class="text-muted mb-0">Published Recipes</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-3 mb-3">
                  <div class="stat-card card border-0 shadow-sm">
                    <div class="card-body text-center">
                      <div class="stat-icon bg-info bg-opacity-10">
                        <i class="bi bi-person-check-fill text-info"></i>
                      </div>
                      <h3 class="mt-3 mb-1">{{ stats.activeUsers }}</h3>
                      <p class="text-muted mb-0">Active Users</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Quick Actions -->
              <div class="row">
                <div class="col-12 mb-4">
                  <div class="card border-0 shadow-sm">
                    <div class="card-header bg-white">
                      <h5 class="mb-0">
                        <i class="bi bi-lightning-fill me-2 text-warning"></i>Quick Actions
                      </h5>
                    </div>
                    <div class="card-body">
                      <div class="row">
                        <div class="col-md-4 mb-2">
                          <button class="btn btn-outline-primary w-100" @click="refreshData">
                            <i class="bi bi-arrow-clockwise me-2"></i>Refresh Data
                          </button>
                        </div>
                        <div class="col-md-4 mb-2">
                          <button
                            class="btn btn-outline-success w-100"
                            @click="activeTab = 'users'"
                          >
                            <i class="bi bi-people me-2"></i>Manage Users
                          </button>
                        </div>
                        <div class="col-md-4 mb-2">
                          <button class="btn btn-outline-info w-100" @click="activeTab = 'recipes'">
                            <i class="bi bi-book me-2"></i>View Recipes
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Recent Activity -->
              <div class="row">
                <div class="col-md-6 mb-4">
                  <div class="card border-0 shadow-sm">
                    <div class="card-header bg-white">
                      <h5 class="mb-0"><i class="bi bi-clock-history me-2"></i>Recent Users</h5>
                    </div>
                    <div class="card-body">
                      <div v-if="recentUsers.length === 0" class="text-center text-muted py-3">
                        No users yet
                      </div>
                      <div v-else class="list-group list-group-flush">
                        <div
                          v-for="user in recentUsers.slice(0, 5)"
                          :key="user.uid"
                          class="list-group-item border-0 px-0"
                        >
                          <div class="d-flex align-items-center">
                            <div class="avatar-circle bg-primary bg-opacity-10 text-primary me-3">
                              {{ user.email.charAt(0).toUpperCase() }}
                            </div>
                            <div class="flex-grow-1">
                              <h6 class="mb-0">{{ user.displayName || user.email }}</h6>
                              <small class="text-muted">{{ user.email }}</small>
                            </div>
                            <span class="badge bg-success">{{ user.role }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-md-6 mb-4">
                  <div class="card border-0 shadow-sm">
                    <div class="card-header bg-white">
                      <h5 class="mb-0"><i class="bi bi-graph-up me-2"></i>System Status</h5>
                    </div>
                    <div class="card-body">
                      <div class="mb-3">
                        <div class="d-flex justify-content-between mb-1">
                          <span>Database Connection</span>
                          <span class="badge bg-success">Active</span>
                        </div>
                        <div class="progress" style="height: 5px">
                          <div
                            class="progress-bar bg-success"
                            role="progressbar"
                            style="width: 100%"
                          ></div>
                        </div>
                      </div>
                      <div class="mb-3">
                        <div class="d-flex justify-content-between mb-1">
                          <span>User Registration Rate</span>
                          <span class="text-muted">{{ stats.totalUsers }} total</span>
                        </div>
                        <div class="progress" style="height: 5px">
                          <div
                            class="progress-bar bg-primary"
                            role="progressbar"
                            :style="{ width: Math.min((stats.totalUsers / 100) * 100, 100) + '%' }"
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div class="d-flex justify-content-between mb-1">
                          <span>Recipe Collection</span>
                          <span class="text-muted">{{ stats.totalRecipes }} total</span>
                        </div>
                        <div class="progress" style="height: 5px">
                          <div
                            class="progress-bar bg-success"
                            role="progressbar"
                            :style="{
                              width: Math.min((stats.totalRecipes / 100) * 100, 100) + '%',
                            }"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
const activeTab = ref('overview')
const loading = ref(true)

const currentUser = computed(() => authMiddleware.getCurrentUser())

const stats = ref({
  totalUsers: 0,
  totalRecipes: 0,
  publishedRecipes: 0,
  activeUsers: 0,
})

const recentUsers = ref([])

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
