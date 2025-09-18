<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authMiddleware } from './middleware/auth.js'

const router = useRouter()

const currentUser = computed(() => authMiddleware.getCurrentUser())
const isAuthenticated = computed(() => authMiddleware.isAuthenticated())
const isAdmin = computed(() => authMiddleware.isAdmin())

onMounted(() => {
  // 基本认证检查
  if (isAuthenticated.value) {
    console.log('User is authenticated')
  }
})

// 这个函数现在由Auth组件直接处理
// const handleAuthentication = (user) => {
//   if (authMiddleware.login(user)) {
//     router.push({ name: 'Home' })
//   }
// }

const logout = () => {
  authMiddleware.logout()
  router.push({ name: 'Home' })
}

// Debug function to clear user data
const clearUserData = () => {
  authMiddleware.logout()
  localStorage.removeItem('users')
  alert('User data cleared! Please refresh the page.')
}
</script>

<template>
  <div id="app">
    <!-- Navigation Bar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-success">
      <div class="container">
        <router-link class="navbar-brand fw-bold" to="/">
          🍽️ Healthy Recipe Hub
        </router-link>

        <div class="navbar-nav ms-auto">
          <router-link class="nav-link" to="/">Home</router-link>

          <template v-if="isAuthenticated">
            <router-link class="nav-link" to="/recipes">Browse Recipes</router-link>
            <router-link v-if="isAdmin" class="nav-link" to="/admin">Admin Panel</router-link>
            <router-link class="nav-link" to="/profile">Profile</router-link>

            <!-- User info and logout button -->
            <div class="nav-item dropdown me-2">
              <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                👤 {{ currentUser.fullName }} ({{ currentUser.role }})
              </a>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#" @click="logout">
                  <i class="bi bi-box-arrow-right"></i> Logout
                </a></li>
              </ul>
            </div>

            <!-- Prominent Logout Button -->
            <button class="btn btn-outline-light btn-sm" @click="logout">
              <i class="bi bi-box-arrow-right"></i> Logout
            </button>
          </template>

          <template v-else>
            <!-- Prominent Login Button -->
            <router-link class="btn btn-outline-light btn-sm me-2" to="/auth">
              <i class="bi bi-box-arrow-in-right"></i> Login
            </router-link>
            <router-link class="btn btn-light btn-sm" to="/auth">
              <i class="bi bi-person-plus"></i> Register
            </router-link>
          </template>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main>
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="bg-dark text-white py-4 mt-5">
      <div class="container">
        <div class="row">
          <div class="col-12 text-center">
            <p class="mb-0">Healthy Recipe Hub - Share & Discover Delicious Healthy Recipes</p>
            <!-- Debug button - remove in production -->
            <button @click="clearUserData" class="btn btn-warning btn-sm mt-2">
              Clear User Data (Debug)
            </button>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
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
.dropdown-menu {
  border: none;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .hero-section {
    text-align: center;
    padding: 2rem 0;
  }

  .hero-section .min-vh-100 {
    min-height: auto !important;
  }

  .d-flex.gap-3 {
    flex-direction: column;
    gap: 1rem !important;
  }

  .btn {
    width: 100%;
  }

  .navbar-nav {
    flex-direction: column;
    align-items: flex-end;
  }

  .navbar-nav .nav-item {
    margin-bottom: 0.5rem;
  }
}

@media (max-width: 576px) {
  .display-4 {
    font-size: 2.5rem;
  }

  .btn-sm {
    font-size: 0.8rem;
    padding: 0.375rem 0.75rem;
  }
}
</style>





