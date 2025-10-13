/**
 * Geolocation Service
 *
 * Handles geolocation operations including:
 * - User location tracking
 * - Distance calculations
 * - Place searches
 * - Directions and routing
 */

import googleMapsConfig from '../config/googleMaps.js'

class GeolocationService {
  constructor() {
    this.google = null
    this.map = null
    this.userLocation = null
    this.markers = []
    this.directionsService = null
    this.directionsRenderer = null
    this.placesService = null
    this.isLoaded = false
    this.mapsLibrary = null
    this.placesLibrary = null
    this.geometryLibrary = null
  }

  /**
   * Initialize Google Maps API
   */
  async initialize() {
    if (this.isLoaded && this.google) {
      return this.google
    }

    try {
      // Load the Google Maps script if not already loaded
      await this.loadGoogleMapsScript()

      // Set google reference from window
      this.google = window.google
      this.isLoaded = true
      console.log('Google Maps API loaded successfully')
      return this.google
    } catch (error) {
      console.error('Failed to load Google Maps API:', error)
      throw error
    }
  }

  /**
   * Load Google Maps script dynamically
   */
  async loadGoogleMapsScript() {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google && window.google.maps) {
        console.log('Google Maps already loaded')
        resolve()
        return
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve())
        existingScript.addEventListener('error', () =>
          reject(new Error('Failed to load Google Maps')),
        )
        return
      }

      // Create and load script
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsConfig.apiKey}&libraries=places,geometry&v=weekly`
      script.async = true
      script.defer = true

      script.onload = () => {
        console.log('Google Maps script loaded')
        resolve()
      }
      script.onerror = () => reject(new Error('Failed to load Google Maps script'))

      document.head.appendChild(script)
    })
  }

  /**
   * Create a map instance
   * @param {HTMLElement} mapElement - DOM element to render map
   * @param {Object} options - Map options
   */
  createMap(mapElement, options = {}) {
    if (!this.google) {
      throw new Error('Google Maps API not loaded. Call initialize() first.')
    }

    const mapOptions = {
      center: options.center || googleMapsConfig.defaultCenter,
      zoom: options.zoom || googleMapsConfig.defaultZoom,
      ...googleMapsConfig.mapOptions,
      ...options,
    }

    this.map = new this.google.maps.Map(mapElement, mapOptions)

    // Initialize services
    this.directionsService = new this.google.maps.DirectionsService()
    this.directionsRenderer = new this.google.maps.DirectionsRenderer()
    this.directionsRenderer.setMap(this.map)
    this.placesService = new this.google.maps.places.PlacesService(this.map)

    return this.map
  }

  /**
   * Get user's current location
   * @returns {Promise<Object>} User location {lat, lng}
   */
  async getUserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          resolve(this.userLocation)
        },
        (error) => {
          console.error('Error getting user location:', error)
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      )
    })
  }

  /**
   * Add marker to map
   * @param {Object} position - {lat, lng}
   * @param {Object} options - Marker options
   */
  addMarker(position, options = {}) {
    if (!this.map) {
      throw new Error('Map not initialized')
    }

    const marker = new this.google.maps.Marker({
      position,
      map: this.map,
      ...options,
    })

    this.markers.push(marker)
    return marker
  }

  /**
   * Add info window to marker
   * @param {Object} marker - Google Maps marker
   * @param {string} content - HTML content
   */
  addInfoWindow(marker, content) {
    const infoWindow = new this.google.maps.InfoWindow({
      content,
    })

    marker.addListener('click', () => {
      infoWindow.open(this.map, marker)
    })

    return infoWindow
  }

  /**
   * Clear all markers from map
   */
  clearMarkers() {
    this.markers.forEach((marker) => marker.setMap(null))
    this.markers = []
  }

  /**
   * Calculate distance between two points
   * @param {Object} origin - {lat, lng}
   * @param {Object} destination - {lat, lng}
   * @returns {number} Distance in meters
   */
  calculateDistance(origin, destination) {
    if (!this.google) {
      throw new Error('Google Maps API not loaded')
    }

    const originLatLng = new this.google.maps.LatLng(origin.lat, origin.lng)
    const destLatLng = new this.google.maps.LatLng(destination.lat, destination.lng)

    return this.google.maps.geometry.spherical.computeDistanceBetween(originLatLng, destLatLng)
  }

  /**
   * Get directions between two points
   * @param {Object} origin - {lat, lng}
   * @param {Object} destination - {lat, lng}
   * @param {string} travelMode - DRIVING, WALKING, BICYCLING, TRANSIT
   */
  async getDirections(origin, destination, travelMode = 'DRIVING') {
    if (!this.directionsService) {
      throw new Error('Directions service not initialized')
    }

    return new Promise((resolve, reject) => {
      this.directionsService.route(
        {
          origin,
          destination,
          travelMode: this.google.maps.TravelMode[travelMode],
        },
        (result, status) => {
          if (status === 'OK') {
            resolve(result)
          } else {
            reject(new Error(`Directions request failed: ${status}`))
          }
        },
      )
    })
  }

  /**
   * Display directions on map
   * @param {Object} directionsResult - Result from getDirections()
   */
  displayDirections(directionsResult) {
    if (!this.directionsRenderer) {
      throw new Error('Directions renderer not initialized')
    }

    this.directionsRenderer.setDirections(directionsResult)
  }

  /**
   * Clear directions from map
   */
  clearDirections() {
    if (this.directionsRenderer) {
      this.directionsRenderer.setDirections({ routes: [] })
    }
  }

  /**
   * Search nearby places
   * @param {Object} location - {lat, lng}
   * @param {number} radius - Search radius in meters
   * @param {string} type - Place type
   */
  async searchNearbyPlaces(location, radius = 5000, type = 'grocery_or_supermarket') {
    if (!this.placesService) {
      throw new Error('Places service not initialized')
    }

    return new Promise((resolve, reject) => {
      const request = {
        location: new this.google.maps.LatLng(location.lat, location.lng),
        radius,
        type: [type],
      }

      this.placesService.nearbySearch(request, (results, status) => {
        if (status === this.google.maps.places.PlacesServiceStatus.OK) {
          resolve(results)
        } else {
          reject(new Error(`Places search failed: ${status}`))
        }
      })
    })
  }

  /**
   * Get place details
   * @param {string} placeId - Google Place ID
   */
  async getPlaceDetails(placeId) {
    if (!this.placesService) {
      throw new Error('Places service not initialized')
    }

    return new Promise((resolve, reject) => {
      const request = {
        placeId,
        fields: [
          'name',
          'rating',
          'formatted_address',
          'formatted_phone_number',
          'opening_hours',
          'photos',
          'geometry',
        ],
      }

      this.placesService.getDetails(request, (place, status) => {
        if (status === this.google.maps.places.PlacesServiceStatus.OK) {
          resolve(place)
        } else {
          reject(new Error(`Place details request failed: ${status}`))
        }
      })
    })
  }

  /**
   * Center map on location
   * @param {Object} location - {lat, lng}
   * @param {number} zoom - Optional zoom level
   */
  centerMap(location, zoom) {
    if (!this.map) {
      throw new Error('Map not initialized')
    }

    this.map.setCenter(location)
    if (zoom !== undefined) {
      this.map.setZoom(zoom)
    }
  }

  /**
   * Fit map to show all markers
   */
  fitBounds() {
    if (!this.map || this.markers.length === 0) {
      return
    }

    const bounds = new this.google.maps.LatLngBounds()
    this.markers.forEach((marker) => {
      bounds.extend(marker.getPosition())
    })

    this.map.fitBounds(bounds)
  }

  /**
   * Geocode address to coordinates
   * @param {string} address - Address string
   */
  async geocodeAddress(address) {
    if (!this.google) {
      throw new Error('Google Maps API not loaded')
    }

    const geocoder = new this.google.maps.Geocoder()

    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK') {
          const location = results[0].geometry.location
          resolve({
            lat: location.lat(),
            lng: location.lng(),
            formatted_address: results[0].formatted_address,
          })
        } else {
          reject(new Error(`Geocoding failed: ${status}`))
        }
      })
    })
  }

  /**
   * Reverse geocode coordinates to address
   * @param {Object} location - {lat, lng}
   */
  async reverseGeocode(location) {
    if (!this.google) {
      throw new Error('Google Maps API not loaded')
    }

    const geocoder = new this.google.maps.Geocoder()

    return new Promise((resolve, reject) => {
      geocoder.geocode({ location }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve(results[0].formatted_address)
        } else {
          reject(new Error(`Reverse geocoding failed: ${status}`))
        }
      })
    })
  }
}

// Create singleton instance
const geolocationService = new GeolocationService()

export default geolocationService
