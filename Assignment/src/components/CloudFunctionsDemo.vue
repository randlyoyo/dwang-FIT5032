<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-12">
        <h1 class="mb-4"><i class="bi bi-cloud-arrow-up me-2"></i>Cloud Functions Demo</h1>
        <p class="lead mb-4">
          This page demonstrates Firebase Cloud Functions - serverless functions running on Google
          Cloud Platform.
        </p>
      </div>
    </div>

    <!-- Overview Cards -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <i class="bi bi-lightning-charge-fill text-warning" style="font-size: 2rem"></i>
            <h5 class="card-title mt-2">Serverless</h5>
            <p class="card-text small">No server management required</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <i class="bi bi-arrow-repeat text-primary" style="font-size: 2rem"></i>
            <h5 class="card-title mt-2">Auto-Scale</h5>
            <p class="card-text small">Scales automatically with load</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <i class="bi bi-shield-check text-success" style="font-size: 2rem"></i>
            <h5 class="card-title mt-2">Secure</h5>
            <p class="card-text small">Built-in authentication & security</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <i class="bi bi-clock-history text-info" style="font-size: 2rem"></i>
            <h5 class="card-title mt-2">Event-Driven</h5>
            <p class="card-text small">Triggered by events or HTTP</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Function Demos -->
    <div class="row">
      <!-- Get User Stats -->
      <div class="col-md-6 mb-4">
        <div class="card">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0"><i class="bi bi-graph-up me-2"></i>Get User Statistics</h5>
          </div>
          <div class="card-body">
            <p class="card-text">Retrieve comprehensive statistics about the current user.</p>
            <button
              class="btn btn-primary"
              @click="callGetUserStats"
              :disabled="loading.userStats || !isAuthenticated"
            >
              <span
                v-if="loading.userStats"
                class="spinner-border spinner-border-sm me-2"
                role="status"
              ></span>
              {{ loading.userStats ? 'Loading...' : 'Get My Stats' }}
            </button>

            <div v-if="results.userStats" class="mt-3">
              <div v-if="results.userStats.success" class="alert alert-success">
                <h6>Your Statistics:</h6>
                <ul class="mb-0">
                  <li>Recipes Created: {{ results.userStats.data.stats.recipesCreated }}</li>
                  <li>
                    Member Since:
                    {{
                      results.userStats.data.stats.memberSince
                        ? new Date(results.userStats.data.stats.memberSince).toLocaleDateString()
                        : 'N/A'
                    }}
                  </li>
                  <li>Role: {{ results.userStats.data.stats.role }}</li>
                  <li>
                    Status: {{ results.userStats.data.stats.isActive ? 'Active' : 'Inactive' }}
                  </li>
                </ul>
              </div>
              <div v-else class="alert alert-danger">Error: {{ results.userStats.error }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Send Welcome Email -->
      <div class="col-md-6 mb-4">
        <div class="card">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0"><i class="bi bi-envelope me-2"></i>Send Welcome Email</h5>
          </div>
          <div class="card-body">
            <p class="card-text">Send a welcome email using cloud functions.</p>
            <div class="mb-3">
              <input
                type="email"
                class="form-control mb-2"
                v-model="emailForm.email"
                placeholder="Email address"
              />
              <input
                type="text"
                class="form-control"
                v-model="emailForm.displayName"
                placeholder="Display name"
              />
            </div>
            <button
              class="btn btn-success"
              @click="callSendWelcomeEmail"
              :disabled="loading.welcomeEmail || !isAuthenticated"
            >
              <span
                v-if="loading.welcomeEmail"
                class="spinner-border spinner-border-sm me-2"
                role="status"
              ></span>
              {{ loading.welcomeEmail ? 'Sending...' : 'Send Email' }}
            </button>

            <div v-if="results.welcomeEmail" class="mt-3">
              <div v-if="results.welcomeEmail.success" class="alert alert-success">
                {{ results.welcomeEmail.data.message }}
              </div>
              <div v-else class="alert alert-danger">Error: {{ results.welcomeEmail.error }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Process Recipe Data -->
      <div class="col-md-6 mb-4">
        <div class="card">
          <div class="card-header bg-warning">
            <h5 class="mb-0"><i class="bi bi-cpu me-2"></i>Process Recipe Data</h5>
          </div>
          <div class="card-body">
            <p class="card-text">Process and validate recipe data with cloud functions.</p>
            <button
              class="btn btn-warning"
              @click="callProcessRecipe"
              :disabled="loading.processRecipe || !isAuthenticated"
            >
              <span
                v-if="loading.processRecipe"
                class="spinner-border spinner-border-sm me-2"
                role="status"
              ></span>
              {{ loading.processRecipe ? 'Processing...' : 'Process Sample Recipe' }}
            </button>

            <div v-if="results.processRecipe" class="mt-3">
              <div v-if="results.processRecipe.success" class="alert alert-success">
                <h6>Processed Recipe:</h6>
                <ul class="mb-0">
                  <li>Name: {{ results.processRecipe.data.processedRecipe.name }}</li>
                  <li>
                    Nutrition Score: {{ results.processRecipe.data.processedRecipe.nutritionScore }}
                  </li>
                  <li>Tags: {{ results.processRecipe.data.processedRecipe.tags.join(', ') }}</li>
                  <li>Status: {{ results.processRecipe.data.processedRecipe.status }}</li>
                </ul>
              </div>
              <div v-else class="alert alert-danger">Error: {{ results.processRecipe.error }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Health Check -->
      <div class="col-md-6 mb-4">
        <div class="card">
          <div class="card-header bg-info text-white">
            <h5 class="mb-0"><i class="bi bi-heart-pulse me-2"></i>Health Check</h5>
          </div>
          <div class="card-body">
            <p class="card-text">Check the health status of cloud functions.</p>
            <button class="btn btn-info" @click="callHealthCheck" :disabled="loading.healthCheck">
              <span
                v-if="loading.healthCheck"
                class="spinner-border spinner-border-sm me-2"
                role="status"
              ></span>
              {{ loading.healthCheck ? 'Checking...' : 'Check Health' }}
            </button>

            <div v-if="results.healthCheck" class="mt-3">
              <div v-if="results.healthCheck.success" class="alert alert-success">
                <h6>Health Status:</h6>
                <ul class="mb-0">
                  <li>Status: {{ results.healthCheck.data.status }}</li>
                  <li>Service: {{ results.healthCheck.data.service }}</li>
                  <li>Version: {{ results.healthCheck.data.version }}</li>
                  <li>Functions: {{ Object.keys(results.healthCheck.data.functions).length }}</li>
                </ul>
              </div>
              <div v-else class="alert alert-danger">Error: {{ results.healthCheck.error }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Functions List -->
    <div class="row mt-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header bg-dark text-white">
            <h5 class="mb-0"><i class="bi bi-list-ul me-2"></i>Available Cloud Functions</h5>
          </div>
          <div class="card-body">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Function Name</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>createUserProfile</code></td>
                  <td><span class="badge bg-primary">Auth Trigger</span></td>
                  <td>Creates user profile when new user signs up</td>
                  <td><span class="badge bg-success">Active</span></td>
                </tr>
                <tr>
                  <td><code>cleanupUserData</code></td>
                  <td><span class="badge bg-primary">Auth Trigger</span></td>
                  <td>Cleans up data when user is deleted</td>
                  <td><span class="badge bg-success">Active</span></td>
                </tr>
                <tr>
                  <td><code>getUserStats</code></td>
                  <td><span class="badge bg-info">Callable</span></td>
                  <td>Returns user statistics</td>
                  <td><span class="badge bg-success">Active</span></td>
                </tr>
                <tr>
                  <td><code>sendWelcomeEmail</code></td>
                  <td><span class="badge bg-info">Callable</span></td>
                  <td>Sends welcome email to new users</td>
                  <td><span class="badge bg-success">Active</span></td>
                </tr>
                <tr>
                  <td><code>processRecipeData</code></td>
                  <td><span class="badge bg-info">Callable</span></td>
                  <td>Processes and validates recipe data</td>
                  <td><span class="badge bg-success">Active</span></td>
                </tr>
                <tr>
                  <td><code>dailyActivityReport</code></td>
                  <td><span class="badge bg-warning">Scheduled</span></td>
                  <td>Generates daily activity reports</td>
                  <td><span class="badge bg-success">Active</span></td>
                </tr>
                <tr>
                  <td><code>updateUserRole</code></td>
                  <td><span class="badge bg-info">Callable</span></td>
                  <td>Updates user roles (admin only)</td>
                  <td><span class="badge bg-success">Active</span></td>
                </tr>
                <tr>
                  <td><code>healthCheck</code></td>
                  <td><span class="badge bg-secondary">HTTP</span></td>
                  <td>Returns health status of functions</td>
                  <td><span class="badge bg-success">Active</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Authentication Warning -->
    <div v-if="!isAuthenticated" class="alert alert-warning mt-4">
      <i class="bi bi-exclamation-triangle me-2"></i>
      <strong>Note:</strong> You must be logged in to test most cloud functions.
      <router-link to="/auth" class="alert-link">Login here</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import cloudFunctionsService from '../services/cloudFunctions.js'
import { authMiddleware } from '../middleware/auth.js'

const isAuthenticated = computed(() => authMiddleware.isAuthenticated())

const loading = ref({
  userStats: false,
  welcomeEmail: false,
  processRecipe: false,
  healthCheck: false,
})

const results = ref({
  userStats: null,
  welcomeEmail: null,
  processRecipe: null,
  healthCheck: null,
})

const emailForm = ref({
  email: '',
  displayName: '',
})

// Get User Stats
const callGetUserStats = async () => {
  loading.value.userStats = true
  results.value.userStats = null

  try {
    const result = await cloudFunctionsService.getUserStats()
    results.value.userStats = result
  } catch (error) {
    results.value.userStats = { success: false, error: error.message }
  } finally {
    loading.value.userStats = false
  }
}

// Send Welcome Email
const callSendWelcomeEmail = async () => {
  if (!emailForm.value.email || !emailForm.value.displayName) {
    results.value.welcomeEmail = {
      success: false,
      error: 'Please enter both email and display name',
    }
    return
  }

  loading.value.welcomeEmail = true
  results.value.welcomeEmail = null

  try {
    const result = await cloudFunctionsService.sendWelcomeEmail(
      emailForm.value.email,
      emailForm.value.displayName,
    )
    results.value.welcomeEmail = result
  } catch (error) {
    results.value.welcomeEmail = { success: false, error: error.message }
  } finally {
    loading.value.welcomeEmail = false
  }
}

// Process Recipe
const callProcessRecipe = async () => {
  loading.value.processRecipe = true
  results.value.processRecipe = null

  const sampleRecipe = {
    name: 'Healthy Vegetable Salad',
    category: 'Salad',
    ingredients: [
      'Fresh lettuce',
      'Organic tomatoes',
      'Cucumber',
      'Olive oil',
      'Lemon juice',
      'Whole grain croutons',
    ],
    instructions: [
      'Wash all vegetables',
      'Chop lettuce and vegetables',
      'Mix in a bowl',
      'Add olive oil and lemon juice',
      'Top with croutons',
    ],
    prepTime: '15 minutes',
    servings: 4,
  }

  try {
    const result = await cloudFunctionsService.processRecipeData(sampleRecipe)
    results.value.processRecipe = result
  } catch (error) {
    results.value.processRecipe = { success: false, error: error.message }
  } finally {
    loading.value.processRecipe = false
  }
}

// Health Check
const callHealthCheck = async () => {
  loading.value.healthCheck = true
  results.value.healthCheck = null

  try {
    const result = await cloudFunctionsService.healthCheck()
    results.value.healthCheck = result
  } catch (error) {
    results.value.healthCheck = { success: false, error: error.message }
  } finally {
    loading.value.healthCheck = false
  }
}
</script>

<style scoped>
.card {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: none;
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.table code {
  font-size: 0.9rem;
  background-color: #f8f9fa;
  padding: 2px 6px;
  border-radius: 3px;
}

.alert ul {
  padding-left: 20px;
}

.alert li {
  margin-bottom: 5px;
}
</style>



