<template>
  <div class="container-fluid mt-4">
    <div class="row">
      <div class="col-12">
        <h1 class="mb-4">
          <i class="bi bi-geo-alt-fill me-2"></i>Healthy Food Stores Near You (Mapbox)
        </h1>
        <p class="lead mb-4">
          Find organic markets, health food stores, and farmer's markets in Melbourne using Mapbox.
        </p>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header bg-info text-white">
            <i class="bi bi-search me-2"></i>Search Any Location
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-5">
                <label class="form-label">From (Start Point)</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="searchOrigin"
                  @input="handleOriginInput"
                  @focus="handleOriginFocus"
                  placeholder="Enter starting address or place..."
                />
              </div>
              <div class="col-md-5">
                <label class="form-label">To (Destination)</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="searchDestination"
                  @input="handleDestinationInput"
                  @focus="handleDestinationFocus"
                  placeholder="Enter destination address or place..."
                />
              </div>
              <div class="col-md-2 d-flex align-items-end">
                <button class="btn btn-primary w-100" @click="searchAndNavigate">
                  <i class="bi bi-signpost-2-fill me-2"></i>Navigate
                </button>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="mt-3">
              <button class="btn btn-sm btn-outline-success me-2" @click="useMyLocation">
                <i class="bi bi-geo-alt-fill me-1"></i>Use My Location
              </button>
              <button class="btn btn-sm btn-outline-danger" @click="clearSearch">
                <i class="bi bi-x-circle me-1"></i>Clear
              </button>
            </div>

            <!-- Loading State -->
            <div v-if="isSearching" class="mt-3">
              <div class="alert alert-info d-flex align-items-center">
                <div class="spinner-border spinner-border-sm me-2" role="status">
                  <span class="visually-hidden">Searching...</span>
                </div>
                <span>Searching locations...</span>
              </div>
            </div>

            <!-- Search Results -->
            <div
              v-if="!isSearching && searchResults.length > 0"
              class="mt-3"
              ref="searchResultsRef"
            >
              <div class="search-results-label mb-2">
                <small class="text-muted">
                  <i class="bi bi-search me-1"></i>
                  Found {{ searchResults.length }} location{{ searchResults.length > 1 ? 's' : '' }}
                </small>
              </div>
              <div class="search-results-container">
                <div
                  v-for="(result, index) in searchResults"
                  :key="index"
                  class="search-result-item"
                  @click="selectSearchResult(result)"
                >
                  <div class="result-icon">
                    <i :class="getPlaceIcon(result.place_type)"></i>
                  </div>
                  <div class="result-content">
                    <div class="result-name">{{ getPlaceName(result) }}</div>
                    <div class="result-address">
                      <i class="bi bi-geo-alt-fill me-1"></i>
                      {{ getPlaceAddress(result) }}
                    </div>
                    <div class="result-meta">
                      <span class="badge bg-secondary me-2">
                        {{ getPlaceType(result) }}
                      </span>
                      <span v-if="result.properties?.distance" class="text-muted small">
                        <i class="bi bi-pin-map me-1"></i>
                        {{ formatDistance(result.properties.distance) }}
                      </span>
                    </div>
                  </div>
                  <div class="result-arrow">
                    <i class="bi bi-chevron-right"></i>
                  </div>
                </div>
              </div>
            </div>

            <!-- No Results -->
            <div v-if="!isSearching && showNoResults" class="mt-3">
              <div class="alert alert-warning">
                <i class="bi bi-exclamation-triangle me-2"></i>
                No locations found. Try a different search term.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Map Container -->
    <div class="row">
      <div class="col-lg-8 mb-4">
        <div class="card">
          <div
            class="card-header bg-success text-white d-flex justify-content-between align-items-center"
          >
            <span><i class="bi bi-map me-2"></i>Map View</span>
            <div class="btn-group btn-group-sm">
              <button
                class="btn btn-light"
                :class="{ active: travelMode === 'driving' }"
                @click="changeTravelMode('driving')"
              >
                <i class="bi bi-car-front"></i>
              </button>
              <button
                class="btn btn-light"
                :class="{ active: travelMode === 'walking' }"
                @click="changeTravelMode('walking')"
              >
                <i class="bi bi-person-walking"></i>
              </button>
              <button
                class="btn btn-light"
                :class="{ active: travelMode === 'cycling' }"
                @click="changeTravelMode('cycling')"
              >
                <i class="bi bi-bicycle"></i>
              </button>
            </div>
          </div>
          <div class="card-body p-0">
            <!-- Zoom hint message -->
            <div v-if="showZoomHint" class="alert alert-info m-3" role="alert">
              <i class="bi bi-zoom-in me-2"></i>
              <strong>Zoom in to see store markers</strong> - Please zoom in closer to view stores
              in the area.
            </div>
            <div ref="mapContainer" class="mapbox-map"></div>
          </div>
        </div>
      </div>

      <!-- Store List -->
      <div class="col-lg-4 mb-4">
        <div class="card">
          <div class="card-header bg-primary text-white">
            <i class="bi bi-shop me-2"></i>Stores ({{ filteredStores.length }})
          </div>
          <div class="card-body store-list">
            <div v-for="store in filteredStores" :key="store.id" class="store-card mb-3">
              <h5>{{ store.name }}</h5>
              <p class="mb-1"><i class="bi bi-tag"></i> {{ store.category }}</p>
              <p class="mb-1"><i class="bi bi-geo-alt"></i> {{ store.address }}</p>
              <p class="mb-1"><i class="bi bi-star-fill text-warning"></i> {{ store.rating }}</p>
              <div class="btn-group-vertical w-100">
                <button class="btn btn-sm btn-success" @click="flyToStore(store)">
                  <i class="bi bi-geo-alt-fill"></i> View on Map
                </button>
                <button class="btn btn-sm btn-primary" @click="getDirections(store)">
                  <i class="bi bi-signpost-2-fill"></i> Get Directions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Messages -->
    <div v-if="error" class="alert alert-danger mt-3">
      <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
    </div>
    <div v-if="loading" class="alert alert-info mt-3">
      <i class="bi bi-hourglass-split me-2"></i>Loading map...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions'
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/config/firebase'

// Mapbox configuration - directly use token (temporary test)
const MAPBOX_TOKEN =
  import.meta.env.VITE_MAPBOX_TOKEN ||
  'pk.eyJ1IjoiMTIzMzIxMjB4IiwiYSI6ImNtZ2tldjBrbTBsNDgyam9rMWdpZzQwbzcifQ.FAPetllCkZacwvrffUsdfA'

// Debug information
console.log('🔍 Mapbox Debug Info:')
console.log('  - Env Token exists:', import.meta.env.VITE_MAPBOX_TOKEN ? '✅ YES' : '❌ NO')
console.log('  - Using Token length:', MAPBOX_TOKEN ? MAPBOX_TOKEN.length : 0)
console.log(
  '  - Token source:',
  import.meta.env.VITE_MAPBOX_TOKEN ? 'Environment Variable' : 'Hardcoded Fallback',
)
console.log(
  '  - Available env vars:',
  Object.keys(import.meta.env).filter((k) => k.startsWith('VITE_')),
)

// State
const mapContainer = ref(null)
const map = ref(null)
const loading = ref(true)
const error = ref('')
const markers = ref([])
const directions = ref(null)
const userLocation = ref(null)
const travelMode = ref('driving')

// Search related state
const searchOrigin = ref('')
const searchDestination = ref('')
const searchResults = ref([])
const searchResultsRef = ref(null) // Search results container reference
const searchType = ref('') // 'origin' or 'destination'
const selectedOrigin = ref(null)
const selectedDestination = ref(null)
const isSearching = ref(false)
const showNoResults = ref(false)
let searchTimeout = null // Debounce timer

// Store data from Firebase
const stores = ref([])
const allStores = ref([]) // Cache all stores for filtering
const MIN_ZOOM_FOR_MARKERS = 12 // Only show markers when zoomed in
const showZoomHint = ref(false)

// Load stores from Firestore
const loadStores = async () => {
  try {
    console.log('Loading stores from Firestore...')
    const storesRef = collection(db, 'stores')
    const snapshot = await getDocs(storesRef)

    allStores.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    stores.value = allStores.value
    console.log(`Loaded ${allStores.value.length} stores from Firestore`)
  } catch (error) {
    console.error('Error loading stores:', error)
    // Fallback to empty array if error
    allStores.value = []
    stores.value = []
  }
}

// Update visible stores based on map bounds and zoom
const updateVisibleStores = () => {
  if (!map.value) return

  const zoom = map.value.getZoom()

  // Show zoom hint if zoom level is too low
  if (zoom < MIN_ZOOM_FOR_MARKERS) {
    showZoomHint.value = true
    stores.value = []
    return
  }

  showZoomHint.value = false
  const bounds = map.value.getBounds()

  // Filter stores within current map bounds
  stores.value = allStores.value.filter((store) => {
    return (
      store.lng >= bounds.getWest() &&
      store.lng <= bounds.getEast() &&
      store.lat >= bounds.getSouth() &&
      store.lat <= bounds.getNorth()
    )
  })

  console.log(`Showing ${stores.value.length} stores in current view`)
}

const filteredStores = computed(() => stores.value)

// Click outside to close search results
const handleClickOutside = (event) => {
  if (searchResultsRef.value && !searchResultsRef.value.contains(event.target)) {
    // Check that click is not on input box
    const isInputClick =
      event.target.closest('input[type="text"]') ||
      event.target.closest('.search-results-container')
    if (!isInputClick) {
      searchResults.value = []
      showNoResults.value = false
    }
  }
}

// Initialize map
onMounted(async () => {
  try {
    console.log('🗺️ Initializing Mapbox with token length:', MAPBOX_TOKEN.length)

    if (!MAPBOX_TOKEN || MAPBOX_TOKEN.length < 50) {
      error.value = 'Mapbox token not configured or invalid.'
      loading.value = false
      return
    }

    // Load stores from Firestore first
    await loadStores()

    // Set Mapbox token
    mapboxgl.accessToken = MAPBOX_TOKEN

    // Create map
    map.value = new mapboxgl.Map({
      container: mapContainer.value,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [144.9631, -37.8136], // Melbourne
      zoom: 12,
    })

    // Wait for map to load
    map.value.on('load', () => {
      console.log('Mapbox map loaded successfully')
      updateVisibleStores()
      addStoreMarkers()
      loading.value = false
    })

    // Add map movement listeners
    map.value.on('moveend', () => {
      updateVisibleStores()
      clearMarkers()
      addStoreMarkers()
    })

    map.value.on('zoomend', () => {
      updateVisibleStores()
      clearMarkers()
      addStoreMarkers()
    })

    // Add navigation control
    map.value.addControl(new mapboxgl.NavigationControl())

    // Initialize Directions control
    directions.value = new MapboxDirections({
      accessToken: MAPBOX_TOKEN,
      unit: 'metric',
      profile: 'mapbox/driving',
      controls: {
        inputs: false, // Hide default input box
        instructions: true,
        profileSwitcher: true, // Show travel mode switcher
      },
    })

    // Get user location
    getUserLocation()

    // Add click outside listener to close search results
    document.addEventListener('click', handleClickOutside)

    // Error handling
    map.value.on('error', (e) => {
      console.error('Map error:', e)
      error.value = 'Failed to load map. Please check your Mapbox token.'
      loading.value = false
    })
  } catch (err) {
    console.error('Failed to initialize map:', err)
    error.value = 'Failed to initialize map: ' + err.message
    loading.value = false
  }
})

// Cleanup on component unmount
onUnmounted(() => {
  // Remove click outside listener
  document.removeEventListener('click', handleClickOutside)

  // Clear timer
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
})

// Clear all markers from map
const clearMarkers = () => {
  markers.value.forEach((marker) => marker.remove())
  markers.value = []
}

// Add store markers
const addStoreMarkers = () => {
  stores.value.forEach((store) => {
    // Create marker element
    const el = document.createElement('div')
    el.className = 'custom-marker'
    el.innerHTML = '📍'
    el.style.fontSize = '24px'
    el.style.cursor = 'pointer'

    // Create popup window
    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
      <div style="padding: 10px;">
        <h6 style="margin: 0 0 5px 0;">${store.name}</h6>
        <p style="margin: 0; font-size: 12px; color: #666;">${store.category}</p>
        <p style="margin: 5px 0; font-size: 12px;">${store.address}</p>
        <p style="margin: 0; font-size: 12px;">
          <span style="color: #ffa500;">⭐</span> ${store.rating || 'N/A'}
        </p>
      </div>
    `)

    // Create marker
    const marker = new mapboxgl.Marker(el)
      .setLngLat([store.lng, store.lat])
      .setPopup(popup)
      .addTo(map.value)

    markers.value.push(marker)
  })
}

// Get user location
const getUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation.value = {
          lng: position.coords.longitude,
          lat: position.coords.latitude,
        }
        console.log('✅ User location obtained:', userLocation.value)

        // Add user location marker
        new mapboxgl.Marker({ color: '#0080ff' })
          .setLngLat([userLocation.value.lng, userLocation.value.lat])
          .setPopup(
            new mapboxgl.Popup().setHTML('<div style="padding: 5px;">📍 Your Location</div>'),
          )
          .addTo(map.value)
      },
      (error) => {
        console.warn('Could not get user location:', error.message)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    )
  }
}

// Fly to specified store
const flyToStore = (store) => {
  if (!map.value) return

  map.value.flyTo({
    center: [store.lng, store.lat],
    zoom: 15,
    essential: true,
  })

  // Show popup window for this store
  const marker = markers.value.find((m) => {
    const lngLat = m.getLngLat()
    return lngLat.lng === store.lng && lngLat.lat === store.lat
  })

  if (marker) {
    marker.togglePopup()
  }
}

// Get route navigation
const getDirections = (store) => {
  if (!map.value || !directions.value) {
    alert('Map not ready yet. Please wait a moment.')
    return
  }

  if (!userLocation.value) {
    alert(
      '📍 Please allow location access to get directions.\n\nYour browser will ask for permission to access your location.',
    )
    // Try to get user location again
    getUserLocation()
    return
  }

  // Clear previous route
  if (map.value.getLayer('mapbox-gl-directions')) {
    directions.value.removeRoutes()
  }

  // Add Directions control to map (if not already added)
  if (!map.value.hasControl(directions.value)) {
    map.value.addControl(directions.value, 'top-left')
  }

  // Set origin and destination
  directions.value.setOrigin([userLocation.value.lng, userLocation.value.lat])
  directions.value.setDestination([store.lng, store.lat])

  // Fly to route view
  map.value.flyTo({
    center: [store.lng, store.lat],
    zoom: 13,
    essential: true,
  })

  console.log(`🗺️ Getting directions to: ${store.name}`)
}

// Handle origin input (real-time search with debounce)
const handleOriginInput = () => {
  // Clear previous timer
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  // Reset selected origin
  if (selectedOrigin.value && searchOrigin.value !== 'My Location') {
    selectedOrigin.value = null
  }

  // Clear results if input is empty or too short
  if (!searchOrigin.value || searchOrigin.value.length < 3) {
    searchResults.value = []
    showNoResults.value = false
    return
  }

  // Set new timer to execute search after 500ms
  searchTimeout = setTimeout(() => {
    searchType.value = 'origin'
    searchLocation('origin')
  }, 500)
}

// Handle destination input (real-time search with debounce)
const handleDestinationInput = () => {
  // Clear previous timer
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  // Reset selected destination
  if (selectedDestination.value) {
    selectedDestination.value = null
  }

  // Clear results if input is empty or too short
  if (!searchDestination.value || searchDestination.value.length < 3) {
    searchResults.value = []
    showNoResults.value = false
    return
  }

  // Set new timer to execute search after 500ms
  searchTimeout = setTimeout(() => {
    searchType.value = 'destination'
    searchLocation('destination')
  }, 500)
}

// Handle origin input box focus
const handleOriginFocus = () => {
  searchType.value = 'origin'
  // Redisplay search results if input exists and is long enough
  if (
    searchOrigin.value &&
    searchOrigin.value.length >= 3 &&
    searchOrigin.value !== 'My Location'
  ) {
    searchLocation('origin')
  }
}

// Handle destination input box focus
const handleDestinationFocus = () => {
  searchType.value = 'destination'
  // Redisplay search results if input exists and is long enough
  if (searchDestination.value && searchDestination.value.length >= 3) {
    searchLocation('destination')
  }
}

// Use my location as origin
const useMyLocation = () => {
  if (userLocation.value) {
    selectedOrigin.value = [userLocation.value.lng, userLocation.value.lat]
    searchOrigin.value = 'My Location'
    console.log('Using user location as origin')
  } else {
    alert('Getting your location...')
    getUserLocation()
    setTimeout(() => {
      if (userLocation.value) {
        selectedOrigin.value = [userLocation.value.lng, userLocation.value.lat]
        searchOrigin.value = 'My Location'
      } else {
        alert('Could not get your location. Please allow location access.')
      }
    }, 2000)
  }
}

// Search location (using Mapbox Geocoding API)
const searchLocation = async (type) => {
  searchType.value = type
  const query = type === 'origin' ? searchOrigin.value : searchDestination.value

  if (!query || query.length < 3) {
    searchResults.value = []
    showNoResults.value = false
    return
  }

  if (query === 'My Location') {
    searchResults.value = []
    showNoResults.value = false
    return
  }

  try {
    isSearching.value = true
    showNoResults.value = false
    searchResults.value = []

    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=5&proximity=144.9631,-37.8136`,
    )
    const data = await response.json()

    if (data.features && data.features.length > 0) {
      searchResults.value = data.features
      showNoResults.value = false
    } else {
      searchResults.value = []
      showNoResults.value = true
    }
  } catch (err) {
    console.error('Search error:', err)
    searchResults.value = []
    showNoResults.value = true
  } finally {
    isSearching.value = false
  }
}

// Select search result
const selectSearchResult = (result) => {
  const [lng, lat] = result.center

  if (searchType.value === 'origin') {
    selectedOrigin.value = [lng, lat]
    searchOrigin.value = result.place_name
  } else {
    selectedDestination.value = [lng, lat]
    searchDestination.value = result.place_name
  }

  // Clear search results and status
  searchResults.value = []
  showNoResults.value = false
  isSearching.value = false

  // Fly to selected location
  map.value.flyTo({
    center: [lng, lat],
    zoom: 14,
    duration: 2000,
  })

  console.log(`📍 Selected: ${result.place_name}`)
}

// Search and navigate
const searchAndNavigate = async () => {
  // If origin is empty, try using user location
  if (!searchOrigin.value && !selectedOrigin.value) {
    useMyLocation()
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  // If destination is empty, prompt user
  if (!searchDestination.value && !selectedDestination.value) {
    alert('Please enter a destination')
    return
  }

  // If origin or destination hasn't been selected, search first
  if (!selectedOrigin.value && searchOrigin.value && searchOrigin.value !== 'My Location') {
    await searchLocation('origin')
    if (searchResults.value.length > 0) {
      selectSearchResult(searchResults.value[0])
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }

  if (!selectedDestination.value && searchDestination.value) {
    searchType.value = 'destination'
    await searchLocation('destination')
    if (searchResults.value.length > 0) {
      selectSearchResult(searchResults.value[0])
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }

  // Start navigation
  if (selectedOrigin.value && selectedDestination.value) {
    try {
      if (directions.value && map.value.hasControl(directions.value)) {
        map.value.removeControl(directions.value)
      }
    } catch {
      console.log('No previous directions')
    }

    directions.value = new MapboxDirections({
      accessToken: MAPBOX_TOKEN,
      unit: 'metric',
      profile: `mapbox/${travelMode.value}`,
      controls: {
        inputs: false,
        instructions: true,
        profileSwitcher: false,
      },
    })

    map.value.addControl(directions.value, 'top-left')
    directions.value.setOrigin(selectedOrigin.value)
    directions.value.setDestination(selectedDestination.value)

    console.log('🚀 Navigation started')
  } else {
    alert('Please select both origin and destination')
  }
}

// Switch travel mode
const changeTravelMode = (mode) => {
  travelMode.value = mode

  if (selectedOrigin.value && selectedDestination.value) {
    try {
      if (directions.value && map.value.hasControl(directions.value)) {
        map.value.removeControl(directions.value)
      }
    } catch {
      console.log('No directions to update')
    }

    directions.value = new MapboxDirections({
      accessToken: MAPBOX_TOKEN,
      unit: 'metric',
      profile: `mapbox/${mode}`,
      controls: {
        inputs: false,
        instructions: true,
        profileSwitcher: false,
      },
    })

    map.value.addControl(directions.value, 'top-left')
    directions.value.setOrigin(selectedOrigin.value)
    directions.value.setDestination(selectedDestination.value)

    console.log(`🚶 Travel mode: ${mode}`)
  }
}

// Clear search
const clearSearch = () => {
  searchOrigin.value = ''
  searchDestination.value = ''
  searchResults.value = []
  selectedOrigin.value = null
  selectedDestination.value = null
  isSearching.value = false
  showNoResults.value = false

  try {
    if (directions.value && map.value.hasControl(directions.value)) {
      map.value.removeControl(directions.value)
    }
  } catch {
    console.log('No directions to clear')
  }

  console.log('🧹 Search cleared')
}

// Get place icon
const getPlaceIcon = (placeTypes) => {
  if (!placeTypes || placeTypes.length === 0) return 'bi bi-geo-alt-fill text-primary'

  const type = placeTypes[0]
  const iconMap = {
    place: 'bi bi-building text-primary',
    locality: 'bi bi-building text-primary',
    neighborhood: 'bi bi-houses text-info',
    address: 'bi bi-house-door text-success',
    poi: 'bi bi-pin-map-fill text-danger',
    postcode: 'bi bi-mailbox text-warning',
    region: 'bi bi-map text-secondary',
    country: 'bi bi-globe text-primary',
  }

  return iconMap[type] || 'bi bi-geo-alt-fill text-primary'
}

// Get place name (main title)
const getPlaceName = (result) => {
  return result.text || result.place_name.split(',')[0]
}

// Get place address (detailed information)
const getPlaceAddress = (result) => {
  const parts = result.place_name.split(',')
  return parts.length > 1 ? parts.slice(1).join(',').trim() : result.place_name
}

// Get place type (display in English)
const getPlaceType = (result) => {
  if (!result.place_type || result.place_type.length === 0) return 'Location'

  const type = result.place_type[0]
  const typeMap = {
    place: 'City',
    locality: 'Town',
    neighborhood: 'Area',
    address: 'Address',
    poi: 'Point of Interest',
    postcode: 'Postal Code',
    region: 'Region',
    country: 'Country',
  }

  return typeMap[type] || 'Location'
}

// Format distance
const formatDistance = (distance) => {
  if (distance < 1000) {
    return `${Math.round(distance)}m away`
  } else {
    return `${(distance / 1000).toFixed(1)}km away`
  }
}

console.log('✅ MapboxStoreLocator component loaded')
</script>

<style scoped>
.mapbox-map {
  width: 100%;
  height: 600px;
  border-radius: 8px;
}

.store-list {
  max-height: 600px;
  overflow-y: auto;
}

.store-card {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f8f9fa;
}

.store-card:hover {
  background: #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.store-card h5 {
  color: #28a745;
  margin-bottom: 10px;
}

.store-card p {
  font-size: 14px;
  color: #666;
}

@media (max-width: 768px) {
  .mapbox-map {
    height: 400px;
  }
}

/* Search Results Styling */
.search-results-label {
  padding: 0 4px;
}

.search-results-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-result-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background: #f8f9fa;
  transform: translateX(4px);
}

.result-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f4f8;
  border-radius: 8px;
  margin-right: 12px;
  font-size: 1.2rem;
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-name {
  font-weight: 600;
  color: #212529;
  font-size: 0.95rem;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-address {
  color: #6c757d;
  font-size: 0.85rem;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-address i {
  flex-shrink: 0;
  font-size: 0.75rem;
}

.result-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.result-meta .badge {
  font-size: 0.7rem;
  font-weight: 500;
  padding: 3px 8px;
}

.result-arrow {
  flex-shrink: 0;
  color: #adb5bd;
  font-size: 1rem;
  margin-left: 12px;
  transition: all 0.2s ease;
}

.search-result-item:hover .result-arrow {
  color: #495057;
  transform: translateX(4px);
}

/* Loading Spinner */
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
  border-width: 0.15em;
}

/* Scrollbar Styling */
.search-results-container::-webkit-scrollbar {
  width: 6px;
}

.search-results-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.search-results-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.search-results-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Mobile Responsive for Search Results */
@media (max-width: 768px) {
  .result-icon {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }

  .result-name {
    font-size: 0.9rem;
  }

  .result-address {
    font-size: 0.8rem;
  }

  .result-meta .badge {
    font-size: 0.65rem;
  }

  .search-results-container {
    max-height: 300px;
  }
}
</style>
