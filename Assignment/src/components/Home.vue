<template>
  <section class="hero-section">
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
            <button v-if="isAuthenticated" class="btn btn-success btn-lg" @click="navigateToRecipes">
              Browse Recipes
            </button>
            <button v-else class="btn btn-success btn-lg" @click="navigateToAuth">
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
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { authMiddleware } from '../middleware/auth.js'

const router = useRouter()

const isAuthenticated = computed(() => authMiddleware.isAuthenticated())

const navigateToRecipes = () => {
  router.push({ name: 'Recipes' })
}

const navigateToAuth = () => {
  router.push({ name: 'Auth' })
}
</script>

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
}

@media (max-width: 576px) {
  .display-4 {
    font-size: 2.5rem;
  }
}
</style>
