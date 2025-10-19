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
                  <p>
                    <strong>Name:</strong>
                    {{ currentUser.fullName || currentUser.displayName || 'N/A' }}
                  </p>
                  <p><strong>Email:</strong> {{ currentUser.email }}</p>
                  <p><strong>Role:</strong> {{ currentUser.role }}</p>
                </div>
                <div class="col-md-6">
                  <h5>Account Information</h5>
                  <div class="mb-3">
                    <label class="form-label"><strong>Registration Date:</strong></label>
                    <p class="text-muted mb-1">
                      {{ formatDate(currentUser.registrationDate || currentUser.loginTime) }}
                    </p>
                  </div>
                  <div class="mb-3">
                    <label class="form-label"><strong>Account Status:</strong></label>
                    <span class="badge bg-success ms-2">Active</span>
                  </div>
                </div>
              </div>

              <hr />

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
                  <div class="col-3">
                    <div class="bg-light p-3 rounded">
                      <h4 class="text-primary">{{ stats.savedRecipes }}</h4>
                      <small>Saved Recipes</small>
                    </div>
                  </div>
                  <div class="col-3">
                    <div class="bg-light p-3 rounded">
                      <h4 class="text-success">{{ stats.favoriteRecipes }}</h4>
                      <small>Favorites</small>
                    </div>
                  </div>
                  <div class="col-3">
                    <div class="bg-light p-3 rounded">
                      <h4 class="text-info">{{ stats.recipesCreated || 0 }}</h4>
                      <small>Created Recipes</small>
                    </div>
                  </div>
                  <div class="col-3">
                    <div class="bg-light p-3 rounded">
                      <h4 class="text-warning">{{ stats.loginCount }}</h4>
                      <small>Login Count</small>
                    </div>
                  </div>
                </div>

                <!-- Cloud Functions statistics -->
                <div v-if="stats.memberSince || stats.lastLogin" class="mt-3">
                  <h6>Server Statistics (via Cloud Functions)</h6>
                  <div class="row">
                    <div class="col-md-6" v-if="stats.memberSince">
                      <p><strong>Member Since:</strong> {{ formatDate(stats.memberSince) }}</p>
                    </div>
                    <div class="col-md-6" v-if="stats.lastLogin">
                      <p><strong>Last Login:</strong> {{ formatDate(stats.lastLogin) }}</p>
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
import * as cloudFunctions from '../services/cloudFunctions.js'

const router = useRouter()

const currentUser = computed(() => {
  const user = authMiddleware.getCurrentUser()
  console.log('Profile - currentUser:', user)
  return user
})

const stats = ref({
  savedRecipes: 0,
  favoriteRecipes: 0,
  loginCount: 0,
})

// Remove complex session state check

onMounted(() => {
  // Check user authentication
  if (!authMiddleware.isAuthenticated()) {
    router.push({ name: 'Auth' })
    return
  }

  // Log user access to profile
  authMiddleware.logSecurityEvent('profile_access', {
    username: currentUser.value?.username,
    timestamp: new Date().toISOString(),
  })

  // Load statistics data
  loadStats()
})

const loadStats = async () => {
  // Load user data from localStorage
  const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]')
  const favoriteRecipes = JSON.parse(localStorage.getItem('favoriteRecipes') || '[]')

  // Basic statistics data
  stats.value = {
    savedRecipes: savedRecipes.length,
    favoriteRecipes: favoriteRecipes.length,
    loginCount: currentUser.value?.loginCount || 1,
  }

  // Use Cloud Functions to get server-side statistics
  try {
    const serverStats = await cloudFunctions.getUserStats()
    if (serverStats && serverStats.success) {
      // Merge server-side statistics
      stats.value = {
        ...stats.value,
        recipesCreated: serverStats.stats.recipesCreated || 0,
        memberSince: serverStats.stats.memberSince,
        lastLogin: serverStats.stats.lastLogin,
        isActive: serverStats.stats.isActive,
        role: serverStats.stats.role,
      }
    }
  } catch (error) {
    console.error('Error loading server stats:', error)
    // If Cloud Functions fails, continue using local data
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
      timestamp: new Date().toISOString(),
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
    exportDate: new Date().toISOString(),
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
    timestamp: new Date().toISOString(),
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
