<template>
  <div class="container-fluid mt-4">
    <div class="row">
      <div class="col-12">
        <h1 class="mb-4"><i class="bi bi-geo-alt-fill me-2"></i>Healthy Food Stores Near You</h1>
        <p class="lead mb-4">
          Find organic markets, health food stores, and farmer's markets in Melbourne. Get
          directions and discover the best places to buy healthy ingredients for your recipes!
        </p>
      </div>
    </div>

    <!-- Feature Cards -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card text-center feature-card">
          <div class="card-body">
            <i class="bi bi-map text-primary" style="font-size: 2rem"></i>
            <h6 class="mt-2">Interactive Map</h6>
            <small class="text-muted">Browse stores on map</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center feature-card">
          <div class="card-body">
            <i class="bi bi-search text-success" style="font-size: 2rem"></i>
            <h6 class="mt-2">Nearby Search</h6>
            <small class="text-muted">Find stores near you</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center feature-card">
          <div class="card-body">
            <i class="bi bi-signpost-2 text-warning" style="font-size: 2rem"></i>
            <h6 class="mt-2">Directions</h6>
            <small class="text-muted">Get route guidance</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center feature-card">
          <div class="card-body">
            <i class="bi bi-info-circle text-info" style="font-size: 2rem"></i>
            <h6 class="mt-2">Store Info</h6>
            <small class="text-muted">Hours, ratings & more</small>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <!-- Map Container -->
      <div class="col-lg-8 mb-4">
        <div class="card map-card">
          <div class="card-header bg-success text-white">
            <i class="bi bi-map me-2"></i>Map View
            <button
              v-if="userLocation"
              class="btn btn-sm btn-light float-end"
              @click="centerOnUser"
            >
              <i class="bi bi-geo-fill"></i> My Location
            </button>
          </div>
          <div class="card-body p-0">
            <div v-if="loading" class="map-loading">
              <div class="spinner-border text-success" role="status">
                <span class="visually-hidden">Loading map...</span>
              </div>
              <p class="mt-3">Loading Google Maps...</p>
            </div>
            <div v-else-if="error" class="alert alert-danger m-3">
              <i class="bi bi-exclamation-triangle me-2"></i>
              {{ error }}
            </div>
            <div ref="mapContainer" class="map-container"></div>
          </div>
        </div>

        <!-- Travel Mode Selection (shown when directions are active) -->
        <div v-if="showDirections" class="card mt-3">
          <div class="card-body">
            <h6 class="card-title"><i class="bi bi-compass me-2"></i>Travel Mode</h6>
            <div class="btn-group" role="group">
              <button
                v-for="mode in travelModes"
                :key="mode.value"
                type="button"
                class="btn"
                :class="selectedTravelMode === mode.value ? 'btn-success' : 'btn-outline-success'"
                @click="changeTravelMode(mode.value)"
              >
                <i :class="mode.icon"></i> {{ mode.label }}
              </button>
            </div>
            <button class="btn btn-outline-danger ms-3" @click="clearDirections">
              <i class="bi bi-x-circle"></i> Clear Route
            </button>
          </div>
        </div>
      </div>

      <!-- Stores List -->
      <div class="col-lg-4 mb-4">
        <div class="card stores-card">
          <div class="card-header bg-primary text-white">
            <i class="bi bi-shop me-2"></i>Healthy Food Stores
            <span class="badge bg-light text-dark float-end">{{ displayedStores.length }}</span>
          </div>
          <div class="card-body p-0">
            <!-- Search Bar -->
            <div class="p-3 border-bottom">
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-search"></i></span>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Search stores..."
                  v-model="searchQuery"
                />
              </div>
            </div>

            <!-- Filter Buttons -->
            <div class="p-3 border-bottom">
              <div class="btn-group btn-group-sm w-100" role="group">
                <button
                  type="button"
                  class="btn"
                  :class="filterCategory === 'all' ? 'btn-success' : 'btn-outline-success'"
                  @click="filterCategory = 'all'"
                >
                  All
                </button>
                <button
                  type="button"
                  class="btn"
                  :class="filterCategory === 'organic' ? 'btn-success' : 'btn-outline-success'"
                  @click="filterCategory = 'organic'"
                >
                  Organic
                </button>
                <button
                  type="button"
                  class="btn"
                  :class="filterCategory === 'market' ? 'btn-success' : 'btn-outline-success'"
                  @click="filterCategory = 'market'"
                >
                  Markets
                </button>
              </div>
            </div>

            <!-- Sort Options -->
            <div class="p-3 border-bottom">
              <select class="form-select form-select-sm" v-model="sortBy">
                <option value="name">Sort by Name</option>
                <option value="rating">Sort by Rating</option>
                <option value="distance" :disabled="!userLocation">Sort by Distance</option>
              </select>
            </div>

            <!-- Stores List -->
            <div class="stores-list">
              <div
                v-for="store in sortedStores"
                :key="store.id"
                class="store-item"
                :class="{ active: selectedStore?.id === store.id }"
                @click="selectStore(store)"
              >
                <div class="d-flex align-items-start">
                  <div class="store-icon me-3">{{ getCategoryIcon(store.category) }}</div>
                  <div class="flex-grow-1">
                    <h6 class="mb-1">{{ store.name }}</h6>
                    <p class="text-muted small mb-1">
                      <i class="bi bi-tag me-1"></i>{{ store.category }}
                    </p>
                    <p class="text-muted small mb-1">
                      <i class="bi bi-geo-alt me-1"></i>{{ store.address }}
                    </p>
                    <div class="d-flex align-items-center mb-2">
                      <span class="badge bg-warning text-dark me-2">
                        <i class="bi bi-star-fill"></i> {{ store.rating }}
                      </span>
                      <span v-if="store.distance" class="badge bg-info text-dark">
                        <i class="bi bi-pin-map-fill"></i> {{ formatDistance(store.distance) }}
                      </span>
                    </div>
                    <div class="store-features">
                      <span
                        v-for="feature in store.features"
                        :key="feature"
                        class="badge bg-success me-1 mb-1"
                      >
                        {{ feature }}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  v-if="userLocation"
                  class="btn btn-sm btn-outline-primary mt-2 w-100"
                  @click.stop="getDirectionsToStore(store)"
                >
                  <i class="bi bi-compass"></i> Get Directions
                </button>
              </div>

              <div v-if="sortedStores.length === 0" class="text-center py-5 text-muted">
                <i class="bi bi-search" style="font-size: 3rem"></i>
                <p class="mt-3">No stores found</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Route Information Panel -->
    <div v-if="routeInfo" class="row mt-3">
      <div class="col-12">
        <div class="alert alert-success">
          <h5 class="alert-heading">
            <i class="bi bi-signpost-2 me-2"></i>Route to {{ selectedStore.name }}
          </h5>
          <hr />
          <div class="row">
            <div class="col-md-4">
              <p class="mb-1"><strong>Distance:</strong> {{ routeInfo.distance }}</p>
            </div>
            <div class="col-md-4">
              <p class="mb-1"><strong>Duration:</strong> {{ routeInfo.duration }}</p>
            </div>
            <div class="col-md-4">
              <p class="mb-1"><strong>Mode:</strong> {{ selectedTravelMode }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import geolocationService from '../services/geolocationService.js'
import googleMapsConfig, {
  categoryIcons,
  formatDistance,
  formatDuration,
} from '../config/googleMaps.js'

const mapContainer = ref(null)
const loading = ref(true)
const error = ref(null)
const userLocation = ref(null)
const selectedStore = ref(null)
const showDirections = ref(false)
const routeInfo = ref(null)
const searchQuery = ref('')
const filterCategory = ref('all')
const sortBy = ref('name')
const selectedTravelMode = ref('DRIVING')

const travelModes = [
  { value: 'DRIVING', label: 'Drive', icon: 'bi bi-car-front' },
  { value: 'WALKING', label: 'Walk', icon: 'bi bi-person-walking' },
  { value: 'BICYCLING', label: 'Bike', icon: 'bi bi-bicycle' },
  { value: 'TRANSIT', label: 'Transit', icon: 'bi bi-bus-front' },
]

const stores = ref([...googleMapsConfig.healthyStores])

// Computed: Filtered stores
const displayedStores = computed(() => {
  let filtered = stores.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (store) =>
        store.name.toLowerCase().includes(query) ||
        store.category.toLowerCase().includes(query) ||
        store.address.toLowerCase().includes(query),
    )
  }

  // Category filter
  if (filterCategory.value !== 'all') {
    if (filterCategory.value === 'organic') {
      filtered = filtered.filter((store) => store.category.includes('Organic'))
    } else if (filterCategory.value === 'market') {
      filtered = filtered.filter((store) => store.category.includes('Market'))
    }
  }

  return filtered
})

// Computed: Sorted stores
const sortedStores = computed(() => {
  const sorted = [...displayedStores.value]

  if (sortBy.value === 'name') {
    return sorted.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortBy.value === 'rating') {
    return sorted.sort((a, b) => b.rating - a.rating)
  } else if (sortBy.value === 'distance' && userLocation.value) {
    return sorted.sort((a, b) => (a.distance || 0) - (b.distance || 0))
  }

  return sorted
})

// Initialize map
async function initializeMap() {
  try {
    loading.value = true
    error.value = null

    // Initialize Google Maps API
    await geolocationService.initialize()

    // Create map
    geolocationService.createMap(mapContainer.value)

    // Try to get user location
    try {
      userLocation.value = await geolocationService.getUserLocation()
      geolocationService.centerMap(userLocation.value)

      // Add user location marker
      geolocationService.addMarker(userLocation.value, {
        title: 'Your Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
      })

      // Calculate distances
      calculateDistances()
    } catch (locationError) {
      console.warn('Could not get user location:', locationError)
      // Use default center if location access denied
    }

    // Add store markers
    addStoreMarkers()

    // Fit bounds to show all markers
    geolocationService.fitBounds()

    loading.value = false
  } catch (err) {
    console.error('Map initialization error:', err)
    error.value = 'Failed to load map. Please check your internet connection.'
    loading.value = false
  }
}

// Add markers for all stores
function addStoreMarkers() {
  stores.value.forEach((store) => {
    const marker = geolocationService.addMarker(store.position, {
      title: store.name,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: getCategoryColor(store.category),
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 2,
      },
    })

    // Add info window
    const infoContent = createInfoWindowContent(store)
    geolocationService.addInfoWindow(marker, infoContent)

    // Click handler
    marker.addListener('click', () => {
      selectStore(store)
    })
  })
}

// Create info window HTML
function createInfoWindowContent(store) {
  return `
    <div class="store-info-window">
      <h6>${store.name}</h6>
      <p class="mb-1"><strong>${store.category}</strong></p>
      <p class="mb-1"><i class="bi bi-geo-alt"></i> ${store.address}</p>
      <p class="mb-1"><i class="bi bi-telephone"></i> ${store.phone}</p>
      <p class="mb-1"><i class="bi bi-clock"></i> ${store.hours}</p>
      <p class="mb-0"><i class="bi bi-star-fill text-warning"></i> ${store.rating}/5</p>
    </div>
  `
}

// Select a store
function selectStore(store) {
  selectedStore.value = store
  geolocationService.centerMap(store.position, 15)
}

// Get directions to store
async function getDirectionsToStore(store) {
  if (!userLocation.value) {
    alert('Please enable location access to get directions')
    return
  }

  try {
    selectedStore.value = store
    showDirections.value = true

    const result = await geolocationService.getDirections(
      userLocation.value,
      store.position,
      selectedTravelMode.value,
    )

    geolocationService.displayDirections(result)

    // Extract route info
    const route = result.routes[0].legs[0]
    routeInfo.value = {
      distance: route.distance.text,
      duration: route.duration.text,
    }
  } catch (err) {
    console.error('Directions error:', err)
    alert('Failed to get directions. Please try again.')
  }
}

// Change travel mode
async function changeTravelMode(mode) {
  selectedTravelMode.value = mode
  if (selectedStore.value && userLocation.value) {
    await getDirectionsToStore(selectedStore.value)
  }
}

// Clear directions
function clearDirections() {
  geolocationService.clearDirections()
  showDirections.value = false
  routeInfo.value = null
  selectedStore.value = null
}

// Center map on user location
function centerOnUser() {
  if (userLocation.value) {
    geolocationService.centerMap(userLocation.value, 14)
  }
}

// Calculate distances from user to all stores
function calculateDistances() {
  if (!userLocation.value) return

  stores.value.forEach((store) => {
    store.distance = geolocationService.calculateDistance(userLocation.value, store.position)
  })
}

// Get category icon
function getCategoryIcon(category) {
  return categoryIcons[category] || '🏪'
}

// Get category color
function getCategoryColor(category) {
  const colors = {
    Supermarket: '#4285F4',
    "Farmer's Market": '#FBBC04',
    'Health Food Store': '#34A853',
    'Grocery Store': '#EA4335',
    'Organic Store': '#9C27B0',
  }
  return colors[category] || '#757575'
}

// Lifecycle hooks
onMounted(() => {
  initializeMap()
})

onUnmounted(() => {
  // Cleanup if needed
})
</script>

<style scoped>
.map-container {
  height: 600px;
  width: 100%;
  position: relative;
}

.map-loading {
  height: 600px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #f8f9fa;
}

.feature-card {
  transition: transform 0.2s;
  cursor: default;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.map-card,
.stores-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: none;
}

.stores-list {
  max-height: 600px;
  overflow-y: auto;
}

.store-item {
  padding: 15px;
  border-bottom: 1px solid #e9ecef;
  cursor: pointer;
  transition: background-color 0.2s;
}

.store-item:hover {
  background-color: #f8f9fa;
}

.store-item.active {
  background-color: #e7f5ff;
  border-left: 3px solid #0d6efd;
}

.store-icon {
  font-size: 2rem;
  min-width: 50px;
  text-align: center;
}

.store-features .badge {
  font-size: 0.7rem;
}

/* Custom scrollbar */
.stores-list::-webkit-scrollbar {
  width: 8px;
}

.stores-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.stores-list::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.stores-list::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Info window styles */
:deep(.store-info-window) {
  font-family: inherit;
  padding: 10px;
  min-width: 200px;
}

:deep(.store-info-window h6) {
  margin-bottom: 10px;
  color: #198754;
}

:deep(.store-info-window p) {
  font-size: 0.9rem;
  margin-bottom: 5px;
}

@media (max-width: 768px) {
  .map-container {
    height: 400px;
  }

  .stores-list {
    max-height: 400px;
  }
}
</style>



