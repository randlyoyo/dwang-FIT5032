<template>
  <div class="card shadow">
    <div class="card-header bg-info text-white">
      <h3 class="h5 mb-0">
        <i class="bi bi-code-slash me-2"></i>
        RESTful API Access & Documentation
      </h3>
    </div>
    <div class="card-body">
      <div class="row">
        <!-- Left: API Keys & Settings -->
        <div class="col-lg-6">
          <h5>API Key Management</h5>

          <!-- Generate API Key -->
          <div class="card mb-3">
            <div class="card-body">
              <h6>Your API Keys</h6>
              <div v-if="apiKeys.length === 0" class="alert alert-warning">
                <i class="bi bi-exclamation-triangle me-2"></i>
                No API keys yet. Generate your first one below.
              </div>

              <div v-for="key in apiKeys" :key="key.id" class="mb-3">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{{ key.name }}</strong>
                    <div class="small text-muted">Created: {{ formatDate(key.created) }}</div>
                  </div>
                  <div>
                    <span class="badge" :class="key.active ? 'bg-success' : 'bg-secondary'">
                      {{ key.active ? 'Active' : 'Revoked' }}
                    </span>
                  </div>
                </div>
                <div class="input-group mt-2">
                  <input
                    type="text"
                    class="form-control font-monospace"
                    :value="key.key"
                    readonly
                  />
                  <button class="btn btn-outline-secondary" @click="copyToClipboard(key.key)">
                    <i class="bi bi-clipboard"></i>
                  </button>
                  <button
                    class="btn btn-outline-danger"
                    @click="revokeKey(key.id)"
                    v-if="key.active"
                  >
                    <i class="bi bi-x-circle"></i> Revoke
                  </button>
                </div>
                <div class="mt-2">
                  <small class="text-muted">
                    Usage: {{ key.usage }} / {{ key.limit }} requests ({{ key.usagePercent }}%)
                  </small>
                  <div class="progress" style="height: 5px">
                    <div
                      class="progress-bar"
                      :class="getUsageColor(key.usagePercent)"
                      :style="{ width: key.usagePercent + '%' }"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Generate New Key Form -->
              <div class="mt-3">
                <h6>Generate New API Key</h6>
                <div class="input-group mb-2">
                  <input
                    type="text"
                    class="form-control"
                    v-model="newKeyName"
                    placeholder="Key name (e.g., Production App)"
                  />
                  <button class="btn btn-primary" @click="generateApiKey" :disabled="isGenerating">
                    <span v-if="isGenerating">
                      <span class="spinner-border spinner-border-sm me-1"></span>
                      Generating...
                    </span>
                    <span v-else>
                      <i class="bi bi-key me-1"></i>
                      Generate
                    </span>
                  </button>
                </div>
                <div class="form-text">Choose a descriptive name for your API key</div>
              </div>
            </div>
          </div>

          <!-- Rate Limiting -->
          <div class="card mb-3">
            <div class="card-body">
              <h6>Rate Limiting</h6>
              <table class="table table-sm">
                <tbody>
                  <tr>
                    <td>Requests per hour:</td>
                    <td><strong>1,000</strong></td>
                  </tr>
                  <tr>
                    <td>Requests per day:</td>
                    <td><strong>10,000</strong></td>
                  </tr>
                  <tr>
                    <td>Concurrent requests:</td>
                    <td><strong>10</strong></td>
                  </tr>
                  <tr>
                    <td>Max payload size:</td>
                    <td><strong>10 MB</strong></td>
                  </tr>
                </tbody>
              </table>
              <div class="alert alert-info mb-0">
                <i class="bi bi-info-circle me-2"></i>
                <small>Upgrade to Premium for higher limits</small>
              </div>
            </div>
          </div>

          <!-- API Statistics -->
          <div class="card">
            <div class="card-body">
              <h6>API Usage Statistics (Last 30 Days)</h6>
              <div class="row text-center">
                <div class="col-6 mb-3">
                  <div class="stat-box">
                    <div class="stat-value">{{ totalRequests }}</div>
                    <div class="stat-label">Total Requests</div>
                  </div>
                </div>
                <div class="col-6 mb-3">
                  <div class="stat-box">
                    <div class="stat-value">{{ successRate }}%</div>
                    <div class="stat-label">Success Rate</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="stat-box">
                    <div class="stat-value">{{ avgResponseTime }}ms</div>
                    <div class="stat-label">Avg Response</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="stat-box">
                    <div class="stat-value">{{ errorCount }}</div>
                    <div class="stat-label">Errors</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: API Documentation & Testing -->
        <div class="col-lg-6">
          <h5>API Endpoints & Testing</h5>

          <!-- Base URL -->
          <div class="alert alert-secondary">
            <strong>Base URL:</strong>
            <code>https://api.healthyrecipe.com/v1</code>
          </div>

          <!-- Endpoints -->
          <div class="accordion" id="apiEndpoints">
            <!-- Get Recipes -->
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button
                  class="accordion-button"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#endpoint1"
                >
                  <span class="badge bg-success me-2">GET</span>
                  /recipes
                </button>
              </h2>
              <div id="endpoint1" class="accordion-collapse collapse show" data-bs-parent="#apiEndpoints">
                <div class="accordion-body">
                  <p><strong>Description:</strong> Retrieve list of recipes</p>
                  <p><strong>Query Parameters:</strong></p>
                  <ul class="small">
                    <li><code>page</code> - Page number (default: 1)</li>
                    <li><code>limit</code> - Items per page (default: 10)</li>
                    <li><code>category</code> - Filter by category</li>
                    <li><code>sort</code> - Sort by field (name, date, rating)</li>
                  </ul>
                  <p><strong>Example Request:</strong></p>
                  <pre class="bg-dark text-white p-2 rounded"><code>curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.healthyrecipe.com/v1/recipes?limit=5</code></pre>
                  <button class="btn btn-sm btn-primary" @click="testEndpoint('GET', '/recipes')">
                    <i class="bi bi-play-circle me-1"></i>
                    Test Endpoint
                  </button>
                </div>
              </div>
            </div>

            <!-- Get Recipe by ID -->
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#endpoint2"
                >
                  <span class="badge bg-success me-2">GET</span>
                  /recipes/:id
                </button>
              </h2>
              <div id="endpoint2" class="accordion-collapse collapse" data-bs-parent="#apiEndpoints">
                <div class="accordion-body">
                  <p><strong>Description:</strong> Get single recipe by ID</p>
                  <p><strong>Example Request:</strong></p>
                  <pre class="bg-dark text-white p-2 rounded"><code>curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.healthyrecipe.com/v1/recipes/123</code></pre>
                  <button class="btn btn-sm btn-primary" @click="testEndpoint('GET', '/recipes/1')">
                    <i class="bi bi-play-circle me-1"></i>
                    Test Endpoint
                  </button>
                </div>
              </div>
            </div>

            <!-- Create Recipe -->
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#endpoint3"
                >
                  <span class="badge bg-primary me-2">POST</span>
                  /recipes
                </button>
              </h2>
              <div id="endpoint3" class="accordion-collapse collapse" data-bs-parent="#apiEndpoints">
                <div class="accordion-body">
                  <p><strong>Description:</strong> Create a new recipe</p>
                  <p><strong>Request Body:</strong></p>
                  <pre class="bg-dark text-white p-2 rounded"><code>{
  "name": "Healthy Salad",
  "category": "Vegetarian",
  "prepTime": 15,
  "ingredients": ["lettuce", "tomato"],
  "instructions": "Mix all ingredients"
}</code></pre>
                  <button class="btn btn-sm btn-primary" @click="testEndpoint('POST', '/recipes')">
                    <i class="bi bi-play-circle me-1"></i>
                    Test Endpoint
                  </button>
                </div>
              </div>
            </div>

            <!-- Update Recipe -->
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#endpoint4"
                >
                  <span class="badge bg-warning me-2">PUT</span>
                  /recipes/:id
                </button>
              </h2>
              <div id="endpoint4" class="accordion-collapse collapse" data-bs-parent="#apiEndpoints">
                <div class="accordion-body">
                  <p><strong>Description:</strong> Update existing recipe</p>
                  <button class="btn btn-sm btn-primary" @click="testEndpoint('PUT', '/recipes/1')">
                    <i class="bi bi-play-circle me-1"></i>
                    Test Endpoint
                  </button>
                </div>
              </div>
            </div>

            <!-- Delete Recipe -->
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#endpoint5"
                >
                  <span class="badge bg-danger me-2">DELETE</span>
                  /recipes/:id
                </button>
              </h2>
              <div id="endpoint5" class="accordion-collapse collapse" data-bs-parent="#apiEndpoints">
                <div class="accordion-body">
                  <p><strong>Description:</strong> Delete a recipe</p>
                  <button class="btn btn-sm btn-primary" @click="testEndpoint('DELETE', '/recipes/1')">
                    <i class="bi bi-play-circle me-1"></i>
                    Test Endpoint
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Test Response -->
          <div v-if="testResponse" class="card mt-3">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
              <strong>Test Response</strong>
              <span class="badge" :class="testResponse.success ? 'bg-success' : 'bg-danger'">
                {{ testResponse.status }}
              </span>
            </div>
            <div class="card-body">
              <pre class="bg-dark text-white p-2 rounded mb-0"><code>{{ testResponse.data }}</code></pre>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent API Requests Log -->
      <div class="row mt-4">
        <div class="col-12">
          <h5>Recent API Requests (Last 10)</h5>
          <div class="table-responsive">
            <table class="table table-sm table-hover">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Method</th>
                  <th>Endpoint</th>
                  <th>Status</th>
                  <th>Response Time</th>
                  <th>API Key</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="log in recentLogs" :key="log.id">
                  <td>{{ formatTime(log.timestamp) }}</td>
                  <td>
                    <span class="badge" :class="getMethodBadge(log.method)">
                      {{ log.method }}
                    </span>
                  </td>
                  <td><code>{{ log.endpoint }}</code></td>
                  <td>
                    <span class="badge" :class="log.status < 400 ? 'bg-success' : 'bg-danger'">
                      {{ log.status }}
                    </span>
                  </td>
                  <td>{{ log.responseTime }}ms</td>
                  <td><code class="small">{{ log.keyPreview }}</code></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// State
const apiKeys = ref([])
const newKeyName = ref('')
const isGenerating = ref(false)
const testResponse = ref(null)
const recentLogs = ref([])

// Statistics
const totalRequests = ref(5280)
const successRate = ref(98.5)
const avgResponseTime = ref(145)
const errorCount = ref(79)

// Methods
const generateApiKey = () => {
  if (!newKeyName.value.trim()) {
    alert('Please enter a name for the API key')
    return
  }

  isGenerating.value = true

  setTimeout(() => {
    const newKey = {
      id: Date.now(),
      name: newKeyName.value,
      key: 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      created: new Date().toISOString(),
      active: true,
      usage: Math.floor(Math.random() * 500),
      limit: 1000,
      usagePercent: 0,
    }
    newKey.usagePercent = Math.round((newKey.usage / newKey.limit) * 100)

    apiKeys.value.push(newKey)
    localStorage.setItem('apiKeys', JSON.stringify(apiKeys.value))

    newKeyName.value = ''
    isGenerating.value = false
  }, 1000)
}

const revokeKey = (id) => {
  if (confirm('Are you sure you want to revoke this API key? This cannot be undone.')) {
    const key = apiKeys.value.find((k) => k.id === id)
    if (key) {
      key.active = false
      localStorage.setItem('apiKeys', JSON.stringify(apiKeys.value))
    }
  }
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    alert('API key copied to clipboard!')
  })
}

const testEndpoint = (method, endpoint) => {
  testResponse.value = null

  setTimeout(() => {
    // Simulate API response
    const mockResponse = {
      success: true,
      status: 200,
      data: JSON.stringify(
        {
          success: true,
          data: {
            id: 1,
            name: 'Healthy Salad',
            category: 'Vegetarian',
            prepTime: 15,
            calories: 250,
            rating: 4.5,
          },
          message: 'Request successful',
        },
        null,
        2,
      ),
    }

    testResponse.value = mockResponse

    // Add to logs
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      method: method,
      endpoint: endpoint,
      status: 200,
      responseTime: Math.floor(Math.random() * 200) + 50,
      keyPreview: apiKeys.value[0]?.key.substring(0, 12) + '...' || 'No key',
    }
    recentLogs.value.unshift(newLog)
    if (recentLogs.value.length > 10) {
      recentLogs.value.pop()
    }
  }, 500)
}

const formatDate = (isoString) => {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatTime = (isoString) => {
  const date = new Date(isoString)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const getUsageColor = (percent) => {
  if (percent < 50) return 'bg-success'
  if (percent < 80) return 'bg-warning'
  return 'bg-danger'
}

const getMethodBadge = (method) => {
  const badges = {
    GET: 'bg-success',
    POST: 'bg-primary',
    PUT: 'bg-warning',
    DELETE: 'bg-danger',
  }
  return badges[method] || 'bg-secondary'
}

// Initialize sample logs
const initializeSampleLogs = () => {
  const methods = ['GET', 'POST', 'PUT', 'DELETE']
  const endpoints = ['/recipes', '/recipes/1', '/users', '/auth/login']

  for (let i = 0; i < 10; i++) {
    recentLogs.value.push({
      id: Date.now() + i,
      timestamp: new Date(Date.now() - i * 60000 * 5).toISOString(),
      method: methods[Math.floor(Math.random() * methods.length)],
      endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
      status: Math.random() > 0.1 ? 200 : 404,
      responseTime: Math.floor(Math.random() * 200) + 50,
      keyPreview: 'sk_abc123...',
    })
  }
}

// Load from localStorage
onMounted(() => {
  const saved = localStorage.getItem('apiKeys')
  if (saved) {
    apiKeys.value = JSON.parse(saved)
  }
  initializeSampleLogs()
})

console.log('✅ ApiAccess component loaded')
</script>

<style scoped>
.stat-box {
  padding: 15px;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: bold;
  color: #17a2b8;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
}

pre {
  font-size: 0.875rem;
  max-height: 300px;
  overflow-y: auto;
}

code {
  font-family: 'Courier New', monospace;
}
</style>




