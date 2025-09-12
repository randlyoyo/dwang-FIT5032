<script setup>
import RecipeList from './components/RecipeList.vue'
import Auth from './components/Auth.vue'
import { ref, onMounted } from 'vue'

const currentSection = ref('home')
const currentUser = ref(null)
const isAuthenticated = ref(false)

onMounted(() => {
  // Check if user is already logged in
  const savedUser = localStorage.getItem('currentUser')
  if (savedUser) {
    currentUser.value = JSON.parse(savedUser)
    isAuthenticated.value = true
  }
})

const handleAuthentication = (user) => {
  currentUser.value = user
  isAuthenticated.value = true
  currentSection.value = 'home'
}

const logout = () => {
  currentUser.value = null
  isAuthenticated.value = false
  localStorage.removeItem('currentUser')
  currentSection.value = 'home'
}

const isAdmin = () => {
  return currentUser.value && currentUser.value.role === 'admin'
}

// Debug function to clear user data
const clearUserData = () => {
  localStorage.removeItem('currentUser')
  localStorage.removeItem('users')
  currentUser.value = null
  isAuthenticated.value = false
  alert('User data cleared! Please refresh the page.')
}
</script>

<template>
  <div id="app">
    <!-- Navigation Bar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-success">
      <div class="container">
        <a class="navbar-brand fw-bold" href="#" @click="currentSection = 'home'">
          🍽️ Healthy Recipe Hub
        </a>

        <div class="navbar-nav ms-auto">
          <a class="nav-link" :class="{ 'active': currentSection === 'home' }"
             href="#" @click="currentSection = 'home'">Home</a>

          <template v-if="isAuthenticated">
            <a class="nav-link" :class="{ 'active': currentSection === 'recipes' }"
               href="#" @click="currentSection = 'recipes'">Browse Recipes</a>
            <a v-if="isAdmin()" class="nav-link" :class="{ 'active': currentSection === 'admin' }"
               href="#" @click="currentSection = 'admin'">Admin Panel</a>

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
            <button class="btn btn-outline-light btn-sm me-2" @click="currentSection = 'auth'">
              <i class="bi bi-box-arrow-in-right"></i> Login
            </button>
            <button class="btn btn-light btn-sm" @click="currentSection = 'auth'">
              <i class="bi bi-person-plus"></i> Register
            </button>
          </template>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main>
      <!-- Home Section -->
      <section v-if="currentSection === 'home'" class="hero-section">
        <div class="container">
          <div class="row align-items-center min-vh-100">
            <div class="col-lg-6">
              <h1 class="display-4 fw-bold text-success mb-4">
                Share & Discover Healthy Recipes
              </h1>
              <p class="lead mb-4">
                Join our community of health-conscious food lovers! Share your favorite healthy recipes,
                discover new nutritious meals, and get inspired by others' culinary creations.
                Together, we can make healthy eating delicious and accessible for everyone.
              </p>
              <div class="d-flex gap-3">
                <button v-if="isAuthenticated" class="btn btn-success btn-lg" @click="currentSection = 'recipes'">
                  Browse Recipes
                </button>
                <button v-else class="btn btn-success btn-lg" @click="currentSection = 'auth'">
                  Join Our Community
                </button>
              </div>
            </div>
            <div class="col-lg-6 text-center">
              <div class="hero-image">
                <span class="display-1 text-success">🍽️</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Authentication Section -->
      <section v-if="currentSection === 'auth'" class="py-5">
        <Auth @authenticated="handleAuthentication" />
      </section>

      <!-- Recipes Section -->
      <section v-if="currentSection === 'recipes'" class="py-5">
        <RecipeList />
      </section>


      <!-- Admin Panel Section -->
      <section v-if="currentSection === 'admin'" class="py-5">
        <div class="container">
          <div class="row">
            <div class="col-12">
              <h2 class="text-center mb-4">Admin Panel</h2>
              <div class="alert alert-info">
                <h5>Welcome, {{ currentUser.fullName }}!</h5>
                <p>As an administrator, you have access to all recipe data and can manage the system.</p>
              </div>
              <RecipeList />
            </div>
          </div>
        </div>
      </section>
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





