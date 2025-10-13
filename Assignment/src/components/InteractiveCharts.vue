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
                id="lineChart"
                value="line"
                v-model="activeChart"
                autocomplete="off"
                checked
              />
              <label class="btn btn-outline-primary" for="lineChart">
                <i class="bi bi-graph-up me-1"></i>
                User Growth
              </label>

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

              <input
                type="radio"
                class="btn-check"
                name="chartType"
                id="doughnutChart"
                value="doughnut"
                v-model="activeChart"
                autocomplete="off"
              />
              <label class="btn btn-outline-primary" for="doughnutChart">
                <i class="bi bi-circle me-1"></i>
                Recipe Status
              </label>
            </div>
          </div>

          <!-- Time Range Selector (for User Growth chart) -->
          <div class="col-md-6" v-show="activeChart === 'line'">
            <h5>Time Range</h5>
            <div class="btn-group" role="group">
              <input
                type="radio"
                class="btn-check"
                name="timeRange"
                id="range7"
                value="7"
                v-model="timeRange"
                @change="updateTimeRange"
                autocomplete="off"
                checked
              />
              <label class="btn btn-outline-success" for="range7">7 Days</label>

              <input
                type="radio"
                class="btn-check"
                name="timeRange"
                id="range30"
                value="30"
                v-model="timeRange"
                @change="updateTimeRange"
                autocomplete="off"
              />
              <label class="btn btn-outline-success" for="range30">30 Days</label>

              <input
                type="radio"
                class="btn-check"
                name="timeRange"
                id="range90"
                value="90"
                v-model="timeRange"
                @change="updateTimeRange"
                autocomplete="off"
              />
              <label class="btn btn-outline-success" for="range90">90 Days</label>
            </div>
          </div>
        </div>

        <!-- Charts Display -->
        <div class="row">
          <!-- Line Chart: User Registration Trend -->
          <div v-show="activeChart === 'line'" class="col-12">
            <div class="card mb-3 border-0 shadow-sm">
              <div class="card-header bg-white">
                <strong>User Registration Trend (Last 7 Days)</strong>
              </div>
              <div class="card-body">
                <canvas ref="lineChartRef" @click="handleChartClick"></canvas>

                <!-- Click Info -->
                <div v-if="clickedDataPoint" class="alert alert-success mt-3">
                  <h6><i class="bi bi-info-circle me-2"></i>Data Point Details</h6>
                  <p class="mb-0">
                    <strong>{{ clickedDataPoint.label }}:</strong> {{ clickedDataPoint.value }} new
                    users registered
                  </p>
                </div>
              </div>
              <div class="card-footer bg-light">
                <div class="row text-center">
                  <div class="col-4"><strong>Total Users:</strong> {{ lineStats.total }}</div>
                  <div class="col-4"><strong>This Week:</strong> {{ lineStats.thisWeek }}</div>
                  <div class="col-4"><strong>Active:</strong> {{ lineStats.active }}</div>
                </div>
              </div>
            </div>
          </div>

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
                        <li class="mb-2">
                          <span class="badge" style="background-color: #ffce56">●</span>
                          <strong>Moderators:</strong> {{ pieData.moderators }} ({{
                            piePercentages.moderators
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

          <!-- Doughnut Chart: Recipe Status -->
          <div v-show="activeChart === 'doughnut'" class="col-12">
            <div class="card mb-3 border-0 shadow-sm">
              <div class="card-header bg-white">
                <strong>Recipe Status Distribution</strong>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <canvas ref="doughnutChartRef"></canvas>
                  </div>
                  <div class="col-md-6 d-flex align-items-center">
                    <div class="w-100">
                      <h6>Status Breakdown:</h6>
                      <div class="table-responsive">
                        <table class="table table-sm">
                          <thead>
                            <tr>
                              <th>Status</th>
                              <th>Count</th>
                              <th>Percentage</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>
                                <span class="badge bg-success">Published</span>
                              </td>
                              <td>{{ doughnutData.published }}</td>
                              <td>{{ doughnutPercentages.published }}%</td>
                            </tr>
                            <tr>
                              <td>
                                <span class="badge bg-warning">Draft</span>
                              </td>
                              <td>{{ doughnutData.draft }}</td>
                              <td>{{ doughnutPercentages.draft }}%</td>
                            </tr>
                            <tr>
                              <td>
                                <span class="badge bg-secondary">Archived</span>
                              </td>
                              <td>{{ doughnutData.archived }}</td>
                              <td>{{ doughnutPercentages.archived }}%</td>
                            </tr>
                          </tbody>
                          <tfoot>
                            <tr class="table-active">
                              <th>Total</th>
                              <th>{{ doughnutData.total }}</th>
                              <th>100%</th>
                            </tr>
                          </tfoot>
                        </table>
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
                  <div class="col-md-6 text-end">
                    <div class="form-check form-switch d-inline-block me-3">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        id="animationSwitch"
                        v-model="enableAnimations"
                        @change="toggleAnimations"
                      />
                      <label class="form-check-label" for="animationSwitch">
                        Enable Animations
                      </label>
                    </div>
                    <div class="form-check form-switch d-inline-block">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        id="legendSwitch"
                        v-model="showLegend"
                        @change="toggleLegend"
                      />
                      <label class="form-check-label" for="legendSwitch"> Show Legend </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Analytics Summary -->
        <div class="row mt-4">
          <div class="col-12">
            <h5>Analytics Summary</h5>
            <div class="row">
              <div class="col-md-6">
                <div class="alert alert-info border-0 shadow-sm">
                  <h6 class="alert-heading">
                    <i class="bi bi-info-circle me-1"></i>
                    System Overview
                  </h6>
                  <p class="small mb-0">
                    {{ users.length }} registered users | {{ recipes.length }} recipes | Last
                    updated: {{ lastUpdated }}
                  </p>
                </div>
              </div>
              <div class="col-md-6">
                <div class="alert alert-success border-0 shadow-sm">
                  <h6 class="alert-heading">
                    <i class="bi bi-check-circle me-1"></i>
                    Data Status
                  </h6>
                  <p class="small mb-0">All data is loaded from Firebase Firestore successfully</p>
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
const activeChart = ref('line')
const enableAnimations = ref(true)
const showLegend = ref(true)
const loading = ref(true)
const lastUpdated = ref('')
const timeRange = ref('7')
const clickedDataPoint = ref(null)

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
  generateUserGrowthData()
  generateRecipeCategoryData()
  generateUserRoleData()
  generateRecipeStatusData()
  console.log('All analytics chart data generated from real Firebase data')
}

// Generate user registration trend data with dynamic time range
const generateUserGrowthData = () => {
  const range = parseInt(timeRange.value)
  const today = new Date()
  const labels = []
  const userCounts = new Array(range).fill(0)

  // Generate labels based on range
  for (let i = range - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    if (range <= 7) {
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }))
    } else if (range <= 30) {
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    } else {
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    }
  }

  // Count users for each day
  users.value.forEach((user) => {
    if (user.createdAt && user.createdAt.toDate) {
      const createdDate = user.createdAt.toDate()
      const diffTime = today - createdDate
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays < range) {
        userCounts[range - 1 - diffDays]++
      }
    }
  })

  lineChartData.value = {
    labels: labels,
    datasets: [
      {
        label: 'New User Registrations',
        data: userCounts,
        borderColor: '#36a2eb',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#36a2eb',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  }
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
    moderator: 0,
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
    moderators: roleCount.moderator,
    total: users.value.length,
  }
}

// Generate recipe status distribution data
const generateRecipeStatusData = () => {
  const statusCount = {
    published: 0,
    draft: 0,
    archived: 0,
  }

  recipes.value.forEach((recipe) => {
    const status = recipe.status || 'published'
    if (statusCount.hasOwnProperty(status)) {
      statusCount[status]++
    } else {
      statusCount.published++
    }
  })

  doughnutData.value = {
    published: statusCount.published,
    draft: statusCount.draft,
    archived: statusCount.archived,
    total: recipes.value.length,
  }
}

// Chart references
const lineChartRef = ref(null)
const barChartRef = ref(null)
const pieChartRef = ref(null)
const doughnutChartRef = ref(null)

// Chart instances
let lineChart = null
let barChart = null
let pieChart = null
let doughnutChart = null

// Data
const lineChartData = ref({
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'New User Registrations',
      data: [0, 0, 0, 0, 0, 0, 0],
      borderColor: '#36a2eb',
      backgroundColor: 'rgba(54, 162, 235, 0.1)',
      tension: 0.4,
      fill: true,
    },
  ],
})

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
  moderators: 0,
  total: 0,
})

const doughnutData = ref({
  published: 0,
  draft: 0,
  archived: 0,
  total: 0,
})

// Computed
const lineStats = computed(() => {
  const data = lineChartData.value.datasets[0].data
  const thisWeek = data.reduce((a, b) => a + b, 0)
  const activeUsers = users.value.filter((u) => u.isActive).length
  return {
    total: users.value.length,
    thisWeek: thisWeek,
    active: activeUsers,
  }
})

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
    return { users: 0, admins: 0, moderators: 0 }
  }
  return {
    users: Math.round((pieData.value.users / total) * 100),
    admins: Math.round((pieData.value.admins / total) * 100),
    moderators: Math.round((pieData.value.moderators / total) * 100),
  }
})

const doughnutPercentages = computed(() => {
  const total = doughnutData.value.total
  if (total === 0) {
    return { published: 0, draft: 0, archived: 0 }
  }
  return {
    published: Math.round((doughnutData.value.published / total) * 100),
    draft: Math.round((doughnutData.value.draft / total) * 100),
    archived: Math.round((doughnutData.value.archived / total) * 100),
  }
})

// Methods
const createLineChart = () => {
  if (!lineChartRef.value) return

  const ctx = lineChartRef.value.getContext('2d')
  lineChart = new Chart(ctx, {
    type: 'line',
    data: lineChartData.value,
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: showLegend.value,
        },
        title: {
          display: false,
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#36a2eb',
          borderWidth: 2,
          displayColors: true,
          callbacks: {
            label: function (context) {
              return `Registrations: ${context.parsed.y} users`
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
        x: {
          grid: {
            display: false,
          },
        },
      },
      animation: {
        duration: enableAnimations.value ? 1000 : 0,
      },
      onClick: (event, activeElements) => {
        if (activeElements.length > 0) {
          const index = activeElements[0].index
          const label = lineChartData.value.labels[index]
          const value = lineChartData.value.datasets[0].data[index]
          clickedDataPoint.value = { label, value }
        }
      },
      onHover: (event, activeElements) => {
        event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default'
      },
    },
  })
}

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
          display: showLegend.value,
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
        duration: enableAnimations.value ? 1000 : 0,
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
      labels: ['Users', 'Admins', 'Moderators'],
      datasets: [
        {
          data: [pieData.value.users, pieData.value.admins, pieData.value.moderators],
          backgroundColor: ['#36a2eb', '#ff6384', '#ffce56'],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: showLegend.value,
          position: 'bottom',
        },
      },
      animation: {
        duration: enableAnimations.value ? 1000 : 0,
      },
    },
  })
}

const createDoughnutChart = () => {
  if (!doughnutChartRef.value) return

  const ctx = doughnutChartRef.value.getContext('2d')
  doughnutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Published', 'Draft', 'Archived'],
      datasets: [
        {
          data: [
            doughnutData.value.published,
            doughnutData.value.draft,
            doughnutData.value.archived,
          ],
          backgroundColor: ['#28a745', '#ffc107', '#6c757d'],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: showLegend.value,
          position: 'bottom',
        },
      },
      animation: {
        duration: enableAnimations.value ? 1000 : 0,
      },
    },
  })
}

// Update time range and refresh line chart
const updateTimeRange = async () => {
  clickedDataPoint.value = null
  generateUserGrowthData()
  if (lineChart) {
    lineChart.data = lineChartData.value
    lineChart.update('active')
  }
}

const refreshData = async () => {
  clickedDataPoint.value = null
  // Refresh data from Firebase
  await fetchFirestoreData()

  // Update all charts
  if (lineChart) {
    lineChart.data = lineChartData.value
    lineChart.update('active')
  }
  if (barChart) {
    barChart.data = barChartData.value
    barChart.update('active')
  }
  if (pieChart) {
    pieChart.data.datasets[0].data = [
      pieData.value.users,
      pieData.value.admins,
      pieData.value.moderators,
    ]
    pieChart.update('active')
  }
  if (doughnutChart) {
    doughnutChart.data.datasets[0].data = [
      doughnutData.value.published,
      doughnutData.value.draft,
      doughnutData.value.archived,
    ]
    doughnutChart.update('active')
  }
}

const exportChartData = () => {
  const data = {
    timestamp: new Date().toISOString(),
    summary: {
      totalUsers: users.value.length,
      totalRecipes: recipes.value.length,
      activeUsers: users.value.filter((u) => u.isActive).length,
    },
    userGrowth: lineChartData.value,
    recipeCategories: barChartData.value,
    userRoles: pieData.value,
    recipeStatus: doughnutData.value,
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `analytics-data-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const toggleAnimations = () => {
  if (lineChart) lineChart.options.animation.duration = enableAnimations.value ? 1000 : 0
  if (barChart) barChart.options.animation.duration = enableAnimations.value ? 1000 : 0
  if (pieChart) pieChart.options.animation.duration = enableAnimations.value ? 1000 : 0
  if (doughnutChart) doughnutChart.options.animation.duration = enableAnimations.value ? 1000 : 0
}

const toggleLegend = () => {
  if (lineChart) {
    lineChart.options.plugins.legend.display = showLegend.value
    lineChart.update()
  }
  if (barChart) {
    barChart.options.plugins.legend.display = showLegend.value
    barChart.update()
  }
  if (pieChart) {
    pieChart.options.plugins.legend.display = showLegend.value
    pieChart.update()
  }
  if (doughnutChart) {
    doughnutChart.options.plugins.legend.display = showLegend.value
    doughnutChart.update()
  }
}

// Watch for chart type changes
watch(activeChart, async (newType) => {
  await nextTick()
  if (newType === 'line' && !lineChart) createLineChart()
  if (newType === 'bar' && !barChart) createBarChart()
  if (newType === 'pie' && !pieChart) createPieChart()
  if (newType === 'doughnut' && !doughnutChart) createDoughnutChart()
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
