<template>
  <div class="py-5">
    <div class="container">
      <div class="row">
        <div class="col-12">
          <h2 class="text-center mb-4">Admin Panel</h2>
          <div class="alert alert-info">
            <h5>Welcome, {{ currentUser.fullName }}!</h5>
            <p>As an administrator, you have access to all recipe data and can manage the system.</p>
          </div>

          <!-- 安全警告 -->
          <div class="alert alert-warning">
            <h6><i class="bi bi-shield-exclamation"></i> Security Notice</h6>
            <p class="mb-0">This is a restricted area. All admin activities are logged for security purposes.</p>
          </div>

          <!-- 管理员功能 -->
          <div class="row">
            <div class="col-md-4 mb-3">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">User Management</h5>
                  <p class="card-text">Manage user accounts and permissions.</p>
                  <button class="btn btn-primary" @click="manageUsers">Manage Users</button>
                </div>
              </div>
            </div>

            <div class="col-md-4 mb-3">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Recipe Moderation</h5>
                  <p class="card-text">Review and moderate user-submitted recipes.</p>
                  <button class="btn btn-success" @click="moderateRecipes">Moderate Recipes</button>
                </div>
              </div>
            </div>

            <div class="col-md-4 mb-3">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Security Logs</h5>
                  <p class="card-text">View security events and access logs.</p>
                  <button class="btn btn-warning" @click="viewSecurityLogs">View Logs</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 系统统计 -->
          <div class="row mt-4">
            <div class="col-12">
              <h4>System Statistics</h4>
              <div class="row">
                <div class="col-md-3">
                  <div class="card text-center">
                    <div class="card-body">
                      <h5 class="card-title text-primary">{{ stats.totalUsers }}</h5>
                      <p class="card-text">Total Users</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="card text-center">
                    <div class="card-body">
                      <h5 class="card-title text-success">{{ stats.totalRecipes }}</h5>
                      <p class="card-text">Total Recipes</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="card text-center">
                    <div class="card-body">
                      <h5 class="card-title text-warning">{{ stats.activeSessions }}</h5>
                      <p class="card-text">Active Sessions</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="card text-center">
                    <div class="card-body">
                      <h5 class="card-title text-danger">{{ stats.securityEvents }}</h5>
                      <p class="card-text">Security Events</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <RecipeList />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authMiddleware } from '../middleware/auth.js'
import RecipeList from './RecipeList.vue'

const router = useRouter()

const currentUser = computed(() => authMiddleware.getCurrentUser())

const stats = ref({
  totalUsers: 0,
  totalRecipes: 0,
  activeSessions: 0,
  securityEvents: 0
})

onMounted(() => {
  // 检查管理员权限
  if (!authMiddleware.isAdmin()) {
    router.push({ name: 'Home' })
    return
  }

  // 记录管理员访问
  authMiddleware.logSecurityEvent('admin_panel_access', {
    username: currentUser.value?.username,
    timestamp: new Date().toISOString()
  })

  // 加载统计数据
  loadStats()
})

const loadStats = () => {
  // 模拟统计数据
  stats.value = {
    totalUsers: 156,
    totalRecipes: 89,
    activeSessions: 23,
    securityEvents: 12
  }
}

const manageUsers = () => {
  authMiddleware.logSecurityEvent('admin_action', {
    action: 'user_management_access',
    username: currentUser.value?.username,
    timestamp: new Date().toISOString()
  })
  alert('User management feature would be implemented here')
}

const moderateRecipes = () => {
  authMiddleware.logSecurityEvent('admin_action', {
    action: 'recipe_moderation_access',
    username: currentUser.value?.username,
    timestamp: new Date().toISOString()
  })
  alert('Recipe moderation feature would be implemented here')
}

const viewSecurityLogs = () => {
  authMiddleware.logSecurityEvent('admin_action', {
    action: 'security_logs_access',
    username: currentUser.value?.username,
    timestamp: new Date().toISOString()
  })
  alert('Security logs feature would be implemented here')
}
</script>

<style scoped>
.card {
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-2px);
}

.alert {
  border-left: 4px solid;
}

.alert-info {
  border-left-color: #17a2b8;
}

.alert-warning {
  border-left-color: #ffc107;
}
</style>
