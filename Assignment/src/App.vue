<script setup>
import Form from './components/Form.vue'
import { ref } from 'vue'

const currentSection = ref('home')
</script>

<template>
  <div id="app">
    <!-- Navigation Bar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-success">
      <div class="container">
        <a class="navbar-brand fw-bold" href="#" @click="currentSection = 'home'">
          🍎 Nutrition Education Hub
        </a>

        <div class="navbar-nav ms-auto">
          <a class="nav-link" :class="{ 'active': currentSection === 'home' }"
             href="#" @click="currentSection = 'home'">Home</a>
          <a class="nav-link" :class="{ 'active': currentSection === 'form' }"
             href="#" @click="currentSection = 'form'">Join Our Program</a>
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
                Empowering Communities Through Nutrition Education
              </h1>
              <p class="lead mb-4">
                We are dedicated to improving public health by providing comprehensive nutrition education,
                healthy eating guidance, and community support programs to promote better dietary choices
                and overall wellness.
              </p>
              <div class="d-flex gap-3">
                <button class="btn btn-success btn-lg" @click="currentSection = 'form'">
                  Start Your Nutrition Journey
                </button>
              </div>
            </div>
            <div class="col-lg-6 text-center">
              <div class="hero-image">
                <span class="display-1 text-success">🍎</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Form Section -->
      <section v-if="currentSection === 'form'" class="py-5">
        <Form />
      </section>
    </main>

    <!-- Footer -->
    <footer class="bg-dark text-white py-4 mt-5">
      <div class="container">
        <div class="row">
          <div class="col-12 text-center">
            <p class="mb-0">Nutrition Education Hub</p>
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
}

@media (max-width: 576px) {
  .display-4 {
    font-size: 2.5rem;
  }
}
</style>





