/**
 * Google Maps API Configuration
 *
 * Configuration for Google Maps integration including:
 * - Maps JavaScript API
 * - Places API
 * - Directions API
 * - Geocoding API
 */

export const googleMapsConfig = {
  // API Key - Get from Google Cloud Console
  // https://console.cloud.google.com/apis/credentials
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',

  // API Version
  version: 'weekly',

  // Required libraries
  libraries: ['places', 'geometry', 'marker'],

  // Default map center (Melbourne, Australia)
  defaultCenter: {
    lat: -37.8136,
    lng: 144.9631,
  },

  // Default zoom level
  defaultZoom: 13,

  // Map styling options
  mapOptions: {
    zoomControl: true,
    mapTypeControl: true,
    scaleControl: true,
    streetViewControl: true,
    rotateControl: true,
    fullscreenControl: true,
    disableDefaultUI: false,
    gestureHandling: 'cooperative',
  },

  // Search options for Places API
  searchOptions: {
    radius: 5000, // 5km radius
    types: ['grocery_or_supermarket', 'health', 'food', 'store'],
  },

  // Healthy food stores - predefined locations
  healthyStores: [
    {
      id: 1,
      name: 'Coles Organic Market',
      category: 'Supermarket',
      address: '123 Collins St, Melbourne VIC 3000',
      position: { lat: -37.8163, lng: 144.9631 },
      phone: '(03) 9123 4567',
      hours: 'Mon-Sun: 8AM-10PM',
      rating: 4.5,
      description: 'Wide range of organic and healthy food options',
      features: ['Organic', 'Vegan Options', 'Gluten-Free'],
    },
    {
      id: 2,
      name: "Farmer's Market - Queen Victoria",
      category: "Farmer's Market",
      address: 'Queen Victoria Market, Melbourne VIC 3000',
      position: { lat: -37.8076, lng: 144.9568 },
      phone: '(03) 9320 5822',
      hours: 'Tue, Thu, Fri, Sat, Sun: 6AM-2PM',
      rating: 4.8,
      description: 'Fresh local produce from Victorian farmers',
      features: ['Fresh Produce', 'Local', 'Seasonal'],
    },
    {
      id: 3,
      name: 'Wholefoods Organic',
      category: 'Health Food Store',
      address: '456 Brunswick St, Fitzroy VIC 3065',
      position: { lat: -37.7994, lng: 144.9789 },
      phone: '(03) 9419 9988',
      hours: 'Mon-Sat: 9AM-7PM, Sun: 10AM-6PM',
      rating: 4.6,
      description: 'Certified organic groceries and supplements',
      features: ['Organic Certified', 'Supplements', 'Bulk Foods'],
    },
    {
      id: 4,
      name: 'Green Life Grocers',
      category: 'Grocery Store',
      address: '789 Chapel St, Prahran VIC 3181',
      position: { lat: -37.8519, lng: 145.0009 },
      phone: '(03) 9529 5544',
      hours: 'Mon-Sun: 7AM-9PM',
      rating: 4.4,
      description: 'Fresh organic fruits and vegetables daily',
      features: ['Fresh Produce', 'Organic', 'Local Suppliers'],
    },
    {
      id: 5,
      name: 'The Source Bulk Foods',
      category: 'Health Food Store',
      address: '321 Lygon St, Carlton VIC 3053',
      position: { lat: -37.8029, lng: 144.9687 },
      phone: '(03) 9347 7788',
      hours: 'Mon-Fri: 9AM-6PM, Sat-Sun: 9AM-5PM',
      rating: 4.7,
      description: 'Package-free bulk organic foods',
      features: ['Bulk Foods', 'Zero Waste', 'Organic'],
    },
    {
      id: 6,
      name: 'Organic Shop',
      category: 'Organic Store',
      address: '555 High St, Northcote VIC 3070',
      position: { lat: -37.7693, lng: 144.9999 },
      phone: '(03) 9481 3322',
      hours: 'Mon-Sun: 8AM-8PM',
      rating: 4.5,
      description: 'Everything organic, from food to cosmetics',
      features: ['Organic', 'Eco-Friendly', 'Natural Products'],
    },
  ],

  // Marker icons
  markerIcons: {
    userLocation: {
      path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
      fillColor: '#4285F4',
      fillOpacity: 1,
      strokeColor: '#fff',
      strokeWeight: 2,
      scale: 2,
    },
    healthyStore: {
      path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
      fillColor: '#34A853',
      fillOpacity: 1,
      strokeColor: '#fff',
      strokeWeight: 2,
      scale: 1.5,
    },
  },

  // Travel modes for directions
  travelModes: {
    DRIVING: 'DRIVING',
    WALKING: 'WALKING',
    BICYCLING: 'BICYCLING',
    TRANSIT: 'TRANSIT',
  },

  // Distance calculation units
  units: {
    METRIC: 'METRIC', // kilometers
    IMPERIAL: 'IMPERIAL', // miles
  },
}

// Category icons mapping
export const categoryIcons = {
  Supermarket: '🛒',
  "Farmer's Market": '🌾',
  'Health Food Store': '🥗',
  'Grocery Store': '🍎',
  'Organic Store': '🌱',
}

// Get marker color by category
export function getMarkerColorByCategory(category) {
  const colors = {
    Supermarket: '#4285F4', // Blue
    "Farmer's Market": '#FBBC04', // Yellow
    'Health Food Store': '#34A853', // Green
    'Grocery Store': '#EA4335', // Red
    'Organic Store': '#9C27B0', // Purple
  }
  return colors[category] || '#757575' // Grey default
}

// Format distance for display
export function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}

// Format duration for display
export function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}

export default googleMapsConfig



