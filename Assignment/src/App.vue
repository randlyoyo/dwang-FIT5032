<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { authMiddleware } from './middleware/auth.js'

const router = useRouter()

// 使用ref来强制响应式更新
const authState = ref(0)

const currentUser = computed(() => {
  // 依赖authState来触发重新计算
  authState.value
  return authMiddleware.getCurrentUser()
})

const isAuthenticated = computed(() => {
  // 依赖authState来触发重新计算
  authState.value
  return authMiddleware.isAuthenticated()
})

const isAdmin = computed(() => {
  // 依赖authState来触发重新计算
  authState.value
  return authMiddleware.isAdmin()
})

// 强制更新认证状态
const refreshAuthState = () => {
  authState.value++
}

onMounted(() => {
  // 基本认证检查
  if (isAuthenticated.value) {
    console.log('User is authenticated')
  }

  // 监听认证状态变化
  setInterval(() => {
    refreshAuthState()
  }, 1000)
})

// 这个函数现在由Auth组件直接处理
// const handleAuthentication = (user) => {
//   if (authMiddleware.login(user)) {
//     router.push({ name: 'Home' })
//   }
// }

const logout = async () => {
  try {
    await authMiddleware.logout()
    refreshAuthState() // 强制更新认证状态
    router.push({ name: 'Home' })
  } catch (error) {
    console.error('Logout error:', error)
    // 即使出错也要清除本地状态
    localStorage.removeItem('currentUser')
    refreshAuthState()
    router.push({ name: 'Home' })
  }
}
</script>

<template>
  <div id="app">
    <!-- Skip to main content link for screen readers -->
    <a href="#main-content" class="skip-to-main">Skip to main content</a>

    <!-- Navigation Bar -->
    <nav
      class="navbar navbar-expand-lg navbar-dark bg-dark"
      role="navigation"
      aria-label="Main navigation"
    >
      <div class="container">
        <router-link class="navbar-brand fw-bold d-flex align-items-center" to="/">
          <span class="text-success me-2 fs-4">🍽️</span>
          <span class="text-success">Healthy Recipe Hub</span>
        </router-link>

        <!-- Mobile toggle button -->
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <div class="navbar-nav ms-auto">
            <router-link class="nav-link" to="/">Home</router-link>

            <!-- 已登录用户显示 -->
            <template v-if="isAuthenticated">
              <router-link class="nav-link" to="/recipes">Recipes</router-link>
              <router-link class="nav-link" to="/store-locator">Find Stores</router-link>

              <!-- 用户信息下拉菜单 -->
              <div class="nav-item dropdown">
                <a
                  class="nav-link dropdown-toggle d-flex align-items-center user-menu"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i class="bi bi-person-circle me-1"></i>
                  {{ currentUser.fullName || currentUser.email }}
                  <span class="badge bg-light text-dark ms-2">{{ currentUser.role }}</span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end shadow">
                  <li>
                    <router-link class="dropdown-item" to="/email-test">
                      <i class="bi bi-envelope me-2"></i>{{ currentUser.email }}
                    </router-link>
                  </li>
                  <li><hr class="dropdown-divider" /></li>
                  <li>
                    <router-link class="dropdown-item" to="/profile">
                      <i class="bi bi-person me-2"></i>Profile
                    </router-link>
                  </li>
                  <li>
                    <router-link class="dropdown-item" to="/email-test">
                      <i class="bi bi-envelope-paper me-2"></i>Email
                    </router-link>
                  </li>
                  <li v-if="isAdmin">
                    <router-link class="dropdown-item" to="/admin">
                      <i class="bi bi-gear me-2"></i>Admin Panel
                    </router-link>
                  </li>
                  <li><hr class="dropdown-divider" /></li>
                  <li>
                    <a class="dropdown-item text-danger" href="#" @click.prevent="logout">
                      <i class="bi bi-box-arrow-right me-2"></i>Logout
                    </a>
                  </li>
                </ul>
              </div>
            </template>

            <!-- 未登录用户显示 -->
            <template v-else>
              <router-link
                class="btn btn-outline-light btn-sm me-2"
                :to="{ name: 'Auth', query: { mode: 'login' } }"
              >
                <i class="bi bi-box-arrow-in-right me-1"></i>Login
              </router-link>
              <router-link
                class="btn btn-light btn-sm"
                :to="{ name: 'Auth', query: { mode: 'register' } }"
              >
                <i class="bi bi-person-plus me-1"></i>Register
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main role="main" id="main-content">
      <router-view />
    </main>

    <!-- AI Quick Access Button (Fixed Bottom Right) -->
    <router-link
      to="/ai-assistant"
      class="ai-fab"
      role="button"
      aria-label="Open AI Recipe Assistant - Powered by Gemini"
      title="AI Recipe Assistant - Powered by Gemini"
    >
      <i class="bi bi-stars" aria-hidden="true"></i>
    </router-link>

    <!-- Footer -->
    <footer class="bg-dark text-white py-4 mt-5" role="contentinfo">
      <div class="container">
        <div class="row">
          <div class="col-12 text-center">
            <p class="mb-2">Healthy Recipe Hub - Share & Discover Delicious Healthy Recipes</p>
            <p class="small text-muted mb-0">
              <i class="bi bi-check-circle me-1"></i>
              WCAG 2.1 AA Compliant | Firebase Powered | Mapbox Integration
            </p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Skip to main content link - only visible on keyboard focus */
.skip-to-main {
  position: absolute;
  top: -40px;
  left: 0;
  background: #28a745;
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  font-weight: bold;
  z-index: 9999;
  border-radius: 0 0 4px 0;
}

.skip-to-main:focus {
  top: 0;
  outline: 3px solid #ffc107;
  outline-offset: 2px;
}

.hero-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #d1ecf1 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.hero-image {
  padding: 2rem;
}

.navbar-nav .nav-link.active {
  font-weight: 600;
  border-bottom: 2px solid white;
}

/* Button styles */
.btn-outline-light:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: white;
}

.btn-light:hover {
  background-color: #e9ecef;
  border-color: #dee2e6;
}

/* User dropdown styles */
.user-menu {
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

.user-menu:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.dropdown-menu {
  border: none;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  border-radius: 10px;
  padding: 0.5rem 0;
  margin-top: 0.5rem;
  min-width: 220px;
}

.dropdown-header {
  font-size: 0.875rem;
  color: #6c757d;
  padding: 0.5rem 1rem;
  margin-bottom: 0;
}

.dropdown-item {
  padding: 0.5rem 1rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  padding-left: 1.5rem;
}

.dropdown-item.text-danger:hover {
  background-color: #fff5f5;
  color: #dc3545 !important;
}

.dropdown-divider {
  margin: 0.5rem 0;
}

.badge {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

/* AI Floating Action Button (FAB) */
.ai-fab {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  z-index: 1000;
  transition: all 0.3s ease;
  text-decoration: none;
}

.ai-fab:hover {
  transform: translateY(-5px) scale(1.05) rotate(10deg);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  color: white;
}

.ai-fab:focus-visible {
  outline: 4px solid #667eea;
  outline-offset: 4px;
}

.ai-fab:active {
  transform: translateY(-2px) scale(1.02);
}

/* No auto-animation for AI button - only animate on hover */

/* Footer links */
footer a {
  transition: all 0.2s ease;
}

footer a:hover {
  text-decoration: underline !important;
  transform: translateX(3px);
}

/* Responsive adjustments */
/* Large tablets and small desktops */
@media (max-width: 992px) {
  .navbar-brand {
    font-size: 1.1rem;
  }

  .navbar-nav .nav-link {
    font-size: 0.9rem;
    padding: 0.5rem 0.8rem;
  }

  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

/* Tablets */
@media (max-width: 768px) {
  /* Navbar */
  .navbar-brand {
    font-size: 1rem;
  }

  .navbar-nav {
    margin-top: 1rem;
    width: 100%;
  }

  .navbar-nav .nav-link {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .navbar-nav .btn {
    width: 100%;
    margin: 0.5rem 0;
  }

  .dropdown-menu {
    width: 100%;
    position: static !important;
    transform: none !important;
    margin-top: 0.5rem;
  }

  /* AI FAB */
  .ai-fab {
    width: 55px;
    height: 55px;
    font-size: 26px;
    bottom: 20px;
    right: 20px;
  }

  /* Footer */
  footer {
    padding: 2rem 0 !important;
  }

  footer p {
    font-size: 0.9rem;
  }

  /* User menu badge */
  .user-menu .badge {
    display: block;
    margin-top: 0.25rem;
    margin-left: 0 !important;
  }
}

/* Mobile phones */
@media (max-width: 576px) {
  /* Navbar */
  .navbar {
    padding: 0.5rem 1rem;
  }

  .navbar-brand {
    font-size: 0.95rem;
  }

  .navbar-brand .fs-4 {
    font-size: 1.25rem !important;
  }

  .navbar-toggler {
    padding: 0.25rem 0.5rem;
    font-size: 1rem;
  }

  .navbar-nav .nav-link {
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
  }

  .navbar-nav .btn-sm {
    font-size: 0.85rem;
    padding: 0.5rem 1rem;
  }

  /* User dropdown */
  .user-menu {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }

  .dropdown-item {
    font-size: 0.9rem;
    padding: 0.6rem 1rem;
  }

  /* AI FAB */
  .ai-fab {
    width: 50px;
    height: 50px;
    font-size: 24px;
    bottom: 15px;
    right: 15px;
  }

  .ai-fab:hover {
    transform: translateY(-3px) scale(1.03);
  }

  /* Footer */
  footer {
    padding: 1.5rem 0 !important;
  }

  footer .mb-2 {
    font-size: 0.85rem;
    margin-bottom: 0.75rem !important;
  }

  footer .small {
    font-size: 0.75rem !important;
  }

  /* Container spacing */
  .container {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }

  /* Badges */
  .badge {
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
  }
}

/* Extra small phones */
@media (max-width: 375px) {
  .navbar-brand span {
    font-size: 0.85rem;
  }

  .navbar-brand .fs-4 {
    font-size: 1.1rem !important;
  }

  .ai-fab {
    width: 45px;
    height: 45px;
    font-size: 22px;
    bottom: 12px;
    right: 12px;
  }

  .dropdown-menu {
    min-width: 200px;
  }

  footer .mb-2 {
    font-size: 0.8rem;
  }

  footer .small {
    font-size: 0.7rem !important;
  }
}

/* Landscape orientation on mobile */
@media (max-height: 500px) and (orientation: landscape) {
  .ai-fab {
    width: 45px;
    height: 45px;
    font-size: 22px;
    bottom: 10px;
    right: 10px;
  }

  .navbar {
    padding: 0.3rem 1rem;
  }

  footer {
    padding: 1rem 0 !important;
  }
}
</style>
