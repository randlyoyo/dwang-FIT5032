<template>
  <div class="py-5">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header bg-primary text-white">
              <h3 class="mb-0"><i class="bi bi-person-circle"></i> User Profile</h3>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <h5>Personal Information</h5>
                  <p><strong>Name:</strong> {{ currentUser.fullName }}</p>
                  <p><strong>Email:</strong> {{ currentUser.email }}</p>
                  <p><strong>Role:</strong> {{ currentUser.role }}</p>
                  <p><strong>Member Since:</strong> {{ formatDate(currentUser.loginTime) }}</p>
                </div>
                <div class="col-md-6">
                  <h5>Account Information</h5>
                  <div class="mb-3">
                    <label class="form-label">Account Status</label>
                    <span class="badge bg-success">Active</span>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">User ID</label>
                    <p class="text-muted">{{ currentUser.id || 'N/A' }}</p>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Registration Date</label>
                    <p class="text-muted">{{ formatDate(currentUser.loginTime) }}</p>
                  </div>
                </div>
              </div>

              <hr>

              <h5>Account Actions</h5>
              <div class="d-flex gap-2">
                <button class="btn btn-danger" @click="logout">
                  <i class="bi bi-box-arrow-right"></i> Logout
                </button>
                <button class="btn btn-info" @click="exportData">
                  <i class="bi bi-download"></i> Export Data
                </button>
              </div>

              <div class="mt-4">
                <h5>Account Statistics</h5>
                <div class="row text-center">
                  <div class="col-4">
                    <div class="bg-light p-3 rounded">
                      <h4 class="text-primary">{{ stats.savedRecipes }}</h4>
                      <small>Saved Recipes</small>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="bg-light p-3 rounded">
                      <h4 class="text-success">{{ stats.favoriteRecipes }}</h4>
                      <small>Favorites</small>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="bg-light p-3 rounded">
                      <h4 class="text-info">{{ stats.loginCount }}</h4>
                      <small>Login Count</small>
                    </div>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authMiddleware } from '../middleware/auth.js'

const router = useRouter()

const currentUser = computed(() => authMiddleware.getCurrentUser())

const stats = ref({
  savedRecipes: 0,
  favoriteRecipes: 0,
  loginCount: 0
})

// 移除复杂的会话状态检查

onMounted(() => {
  // 检查用户认证
  if (!authMiddleware.isAuthenticated()) {
    router.push({ name: 'Auth' })
    return
  }

  // 记录用户访问个人资料
  authMiddleware.logSecurityEvent('profile_access', {
    username: currentUser.value?.username,
    timestamp: new Date().toISOString()
  })

  // 加载统计数据
  loadStats()
})

const loadStats = () => {
  // 从localStorage加载用户数据
  const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]')
  const favoriteRecipes = JSON.parse(localStorage.getItem('favoriteRecipes') || '[]')

  stats.value = {
    savedRecipes: savedRecipes.length,
    favoriteRecipes: favoriteRecipes.length,
    loginCount: currentUser.value?.loginCount || 1
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString()
}

const logout = () => {
  if (confirm('Are you sure you want to logout?')) {
    authMiddleware.logSecurityEvent('user_logout', {
      username: currentUser.value?.username,
      timestamp: new Date().toISOString()
    })
    authMiddleware.logout()
    router.push({ name: 'Home' })
  }
}

const exportData = () => {
  const userData = {
    profile: currentUser.value,
    savedRecipes: JSON.parse(localStorage.getItem('savedRecipes') || '[]'),
    favoriteRecipes: JSON.parse(localStorage.getItem('favoriteRecipes') || '[]'),
    exportDate: new Date().toISOString()
  }

  const dataStr = JSON.stringify(userData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `user-data-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  authMiddleware.logSecurityEvent('data_export', {
    username: currentUser.value?.username,
    timestamp: new Date().toISOString()
  })

  alert('User data exported successfully!')
}
</script>

<style scoped>
.card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.bg-light {
  background-color: #f8f9fa !important;
}

.badge {
  font-size: 0.875rem;
}
</style>
