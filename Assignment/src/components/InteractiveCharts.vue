<template>
  <div class="card shadow-sm border-0">
    <div class="card-header bg-white">
      <h3 class="h5 mb-0">
        <i class="bi bi-bar-chart-line me-2"></i>
        Website Analytics & Statistics
      </h3>
    </div>
    <div class="card-body">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading analytics data...</p>
      </div>

      <!-- Main Content -->
      <div v-else>
        <!-- Data Source Info -->
        <div class="alert alert-info mb-4">
          <i class="bi bi-database me-2"></i>
          <strong>Data Source:</strong> Real-time data from Firebase Firestore |
          <strong>Users:</strong> {{ users.length }} | <strong>Recipes:</strong>
          {{ recipes.length }} | <strong>Last Updated:</strong> {{ lastUpdated }}
        </div>

        <!-- Controls Row -->
        <div class="row mb-4">
          <!-- Chart Type Selector -->
          <div class="col-md-6">
            <h5>Chart Type</h5>
            <div class="btn-group" role="group">
              <input
                type="radio"
                class="btn-check"
                name="chartType"
                id="barChart"
                value="bar"
                v-model="activeChart"
                autocomplete="off"
              />
              <label class="btn btn-outline-primary" for="barChart">
                <i class="bi bi-bar-chart me-1"></i>
                Recipe Categories
              </label>

              <input
                type="radio"
                class="btn-check"
                name="chartType"
                id="pieChart"
                value="pie"
                v-model="activeChart"
                autocomplete="off"
              />
              <label class="btn btn-outline-primary" for="pieChart">
                <i class="bi bi-pie-chart me-1"></i>
                User Roles
              </label>
            </div>
          </div>
        </div>

        <!-- Charts Display -->
        <div class="row">
          <!-- Bar Chart: Recipe Categories -->
          <div v-show="activeChart === 'bar'" class="col-12">
            <div class="card mb-3 border-0 shadow-sm">
              <div class="card-header bg-white">
                <strong>Recipe Distribution by Category</strong>
              </div>
              <div class="card-body">
                <canvas ref="barChartRef"></canvas>
              </div>
              <div class="card-footer bg-light">
                <div class="row text-center">
                  <div class="col-4">
                    <strong>Total Categories:</strong> {{ barStats.totalCategories }}
                  </div>
                  <div class="col-4">
                    <strong>Total Recipes:</strong> {{ barStats.totalRecipes }}
                  </div>
                  <div class="col-4"><strong>Most Popular:</strong> {{ barStats.mostPopular }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pie Chart: User Roles -->
          <div v-show="activeChart === 'pie'" class="col-12">
            <div class="card mb-3 border-0 shadow-sm">
              <div class="card-header bg-white">
                <strong>User Role Distribution</strong>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <canvas ref="pieChartRef"></canvas>
                  </div>
                  <div class="col-md-6 d-flex align-items-center">
                    <div class="w-100">
                      <h6>Role Breakdown:</h6>
                      <ul class="list-unstyled">
                        <li class="mb-2">
                          <span class="badge" style="background-color: #36a2eb">●</span>
                          <strong>Users:</strong> {{ pieData.users }} ({{ piePercentages.users }}%)
                        </li>
                        <li class="mb-2">
                          <span class="badge" style="background-color: #ff6384">●</span>
                          <strong>Admins:</strong> {{ pieData.admins }} ({{
                            piePercentages.admins
                          }}%)
                        </li>
                      </ul>
                      <div class="alert alert-info mt-3 mb-0">
                        <small>
                          <i class="bi bi-info-circle me-1"></i>
                          Total registered users: {{ pieData.total }}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Data Controls -->
        <div class="row mt-4">
          <div class="col-12">
            <h5>Chart Controls</h5>
            <div class="card border-0 shadow-sm">
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <button class="btn btn-primary me-2" @click="refreshData">
                      <i class="bi bi-arrow-clockwise me-1"></i>
                      Refresh Data
                    </button>
                    <button class="btn btn-success me-2" @click="exportChartData">
                      <i class="bi bi-download me-1"></i>
                      Export Data
                    </button>
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
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import { app } from '../config/firebase.js'
import {
  Chart,
  LineController,
  BarController,
  PieController,
  DoughnutController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

const db = getFirestore(app)

// Register Chart.js components
Chart.register(
  LineController,
  BarController,
  PieController,
  DoughnutController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
)

// State
const activeChart = ref('bar')
const loading = ref(true)
const lastUpdated = ref('')

// Firestore data
const users = ref([])
const recipes = ref([])

// Fetch data from Firestore
const fetchFirestoreData = async () => {
  try {
    loading.value = true
    console.log('Fetching data from Firestore for analytics charts...')

    // Fetch users
    const usersSnapshot = await getDocs(collection(db, 'users'))
    users.value = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    // Fetch recipes
    const recipesSnapshot = await getDocs(collection(db, 'recipes'))
    recipes.value = recipesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    console.log(
      `Loaded ${users.value.length} users and ${recipes.value.length} recipes for analytics`,
    )

    // Update timestamp
    lastUpdated.value = new Date().toLocaleString()

    // Generate all chart data based on real data
    generateAllChartData()
  } catch (error) {
    console.error('Error fetching Firestore data for analytics:', error)
    lastUpdated.value = 'Error loading data'
  } finally {
    loading.value = false
  }
}

// Generate all chart data from Firestore data
const generateAllChartData = () => {
  generateRecipeCategoryData()
  generateUserRoleData()
  console.log('All analytics chart data generated from real Firebase data')
}

// Generate recipe category distribution data
const generateRecipeCategoryData = () => {
  const categoryCount = {}
  recipes.value.forEach((recipe) => {
    const category = recipe.category || 'Other'
    categoryCount[category] = (categoryCount[category] || 0) + 1
  })

  const categories = Object.keys(categoryCount)
  const counts = Object.values(categoryCount)

  if (categories.length > 0) {
    barChartData.value = {
      labels: categories,
      datasets: [
        {
          label: 'Number of Recipes',
          data: counts,
          backgroundColor: categories.map(
            (_, i) => `hsla(${(i * 360) / categories.length}, 70%, 60%, 0.8)`,
          ),
        },
      ],
    }
  }
}

// Generate user role distribution data
const generateUserRoleData = () => {
  const roleCount = {
    user: 0,
    admin: 0,
  }

  users.value.forEach((user) => {
    const role = user.role || 'user'
    if (roleCount.hasOwnProperty(role)) {
      roleCount[role]++
    } else {
      roleCount.user++
    }
  })

  pieData.value = {
    users: roleCount.user,
    admins: roleCount.admin,
    total: users.value.length,
  }
}

// Chart references
const barChartRef = ref(null)
const pieChartRef = ref(null)

// Chart instances
let barChart = null
let pieChart = null

// Data

const barChartData = ref({
  labels: [],
  datasets: [
    {
      label: 'Number of Recipes',
      data: [],
      backgroundColor: [],
    },
  ],
})

const pieData = ref({
  users: 0,
  admins: 0,
  total: 0,
})

// Computed

const barStats = computed(() => {
  const data = barChartData.value.datasets[0].data
  const total = data.reduce((a, b) => a + b, 0)
  const maxIndex = data.indexOf(Math.max(...data))
  return {
    totalCategories: data.length || 0,
    totalRecipes: total || 0,
    mostPopular: barChartData.value.labels[maxIndex] || 'N/A',
  }
})

const piePercentages = computed(() => {
  const total = pieData.value.total
  if (total === 0) {
    return { users: 0, admins: 0 }
  }
  return {
    users: Math.round((pieData.value.users / total) * 100),
    admins: Math.round((pieData.value.admins / total) * 100),
  }
})

// Methods

const createBarChart = () => {
  if (!barChartRef.value) return

  const ctx = barChartRef.value.getContext('2d')
  barChart = new Chart(ctx, {
    type: 'bar',
    data: barChartData.value,
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          callbacks: {
            label: function (context) {
              return `Recipes: ${context.parsed.y}`
            },
            afterLabel: function (context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = ((context.parsed.y / total) * 100).toFixed(1)
              return `${percentage}% of total`
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
      animation: {
        duration: 1000,
      },
      onHover: (event, activeElements) => {
        event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default'
      },
    },
  })
}

const createPieChart = () => {
  if (!pieChartRef.value) return

  const ctx = pieChartRef.value.getContext('2d')
  pieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Users', 'Admins'],
      datasets: [
        {
          data: [pieData.value.users, pieData.value.admins],
          backgroundColor: ['#36a2eb', '#ff6384'],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
        },
      },
      animation: {
        duration: 1000,
      },
    },
  })
}

const refreshData = async () => {
  clickedDataPoint.value = null
  // Refresh data from Firebase
  await fetchFirestoreData()

  // Update all charts
  if (barChart) {
    barChart.data = barChartData.value
    barChart.update('active')
  }
  if (pieChart) {
    pieChart.data.datasets[0].data = [pieData.value.users, pieData.value.admins]
    pieChart.update('active')
  }
}

const exportChartData = () => {
  const data = {
    timestamp: new Date().toISOString(),
    recipeCategories: barChartData.value,
    userRoles: pieData.value,
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `analytics-data-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// Watch for chart type changes
watch(activeChart, async (newType) => {
  await nextTick()
  if (newType === 'bar' && !barChart) createBarChart()
  if (newType === 'pie' && !pieChart) createPieChart()
})

// Initialize
onMounted(async () => {
  // Fetch real data from Firebase Firestore
  await fetchFirestoreData()
  // Create initial chart
  await nextTick()
  createLineChart()
})
</script>

<style scoped>
canvas {
  max-height: 400px;
}

.card {
  transition: all 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
}

.btn {
  transition: all 0.2s;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
