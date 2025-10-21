// Import store data to Firestore
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore'

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDSH-wN-Bns6XR2k4H5OXc0rrHBMQPRiEs',
  authDomain: 'assignment-cfc8f.firebaseapp.com',
  projectId: 'assignment-cfc8f',
  storageBucket: 'assignment-cfc8f.firebasestorage.app',
  messagingSenderId: '649587775986',
  appId: '1:649587775986:web:9784eb96b6fa9af4ced0d9',
  measurementId: 'G-M5C5J55VF2',
}

// Initialize Firebase (only if not already initialized)
let app
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

const db = getFirestore(app)

// Melbourne healthy food stores data
const stores = [
  // CBD Area
  {
    name: 'Coles Organic Market',
    category: 'Supermarket',
    address: '123 Collins St, Melbourne VIC 3000',
    lng: 144.9631,
    lat: -37.8163,
    rating: 4.5,
    phone: '+61 3 9654 1234',
    hours: 'Mon-Sun: 7AM-10PM',
    description: 'Premium organic supermarket offering fresh produce and health foods.',
  },
  {
    name: 'Queen Victoria Market',
    category: "Farmer's Market",
    address: 'Queen Victoria Market, Melbourne VIC 3000',
    lng: 144.9568,
    lat: -37.8076,
    rating: 4.8,
    phone: '+61 3 9320 5822',
    hours: 'Tue, Thu, Fri, Sat, Sun: 6AM-3PM',
    description: 'Historic market with fresh fruits, vegetables, and organic products.',
  },
  {
    name: 'Spencer Outlet Centre Fresh Food',
    category: 'Grocery Store',
    address: '201 Spencer St, Melbourne VIC 3000',
    lng: 144.9545,
    lat: -37.8184,
    rating: 4.3,
    phone: '+61 3 9642 3000',
    hours: 'Mon-Sat: 8AM-8PM, Sun: 9AM-7PM',
    description: 'Fresh food market with local and organic options.',
  },

  // Fitzroy & Carlton
  {
    name: 'Wholefoods Organic',
    category: 'Health Food Store',
    address: '456 Brunswick St, Fitzroy VIC 3065',
    lng: 144.9789,
    lat: -37.7994,
    rating: 4.6,
    phone: '+61 3 9417 0205',
    hours: 'Mon-Sun: 8AM-9PM',
    description: 'Comprehensive organic and health food store with supplements.',
  },
  {
    name: 'The Source Bulk Foods Carlton',
    category: 'Health Food Store',
    address: '321 Lygon St, Carlton VIC 3053',
    lng: 144.9687,
    lat: -37.8029,
    rating: 4.7,
    phone: '+61 3 9347 5566',
    hours: 'Mon-Fri: 9AM-6PM, Sat-Sun: 10AM-5PM',
    description: 'Zero-waste bulk food store with organic and sustainable products.',
  },
  {
    name: 'Terra Madre',
    category: 'Organic Store',
    address: '201 Rathdowne St, Carlton VIC 3053',
    lng: 144.9708,
    lat: -37.8015,
    rating: 4.8,
    phone: '+61 3 9347 8870',
    hours: 'Mon-Sun: 8AM-7PM',
    description: 'Premium organic grocery store and cafe with local produce.',
  },

  // Northcote & Preston
  {
    name: 'Organic Shop Northcote',
    category: 'Organic Store',
    address: '555 High St, Northcote VIC 3070',
    lng: 144.9999,
    lat: -37.7693,
    rating: 4.5,
    phone: '+61 3 9482 2200',
    hours: 'Mon-Sun: 8AM-8PM',
    description: 'Family-owned organic store with fresh produce and groceries.',
  },
  {
    name: 'Preston Market',
    category: "Farmer's Market",
    address: '2 Centreway, Preston VIC 3072',
    lng: 145.0011,
    lat: -37.7393,
    rating: 4.6,
    phone: '+61 3 9470 2777',
    hours: 'Wed-Fri: 8AM-5PM, Sat-Sun: 7AM-5PM',
    description: 'Diverse market with fresh produce, meat, and specialty foods.',
  },

  // South Melbourne & Prahran
  {
    name: 'Green Life Grocers',
    category: 'Grocery Store',
    address: '789 Chapel St, Prahran VIC 3181',
    lng: 145.0009,
    lat: -37.8519,
    rating: 4.4,
    phone: '+61 3 9529 3888',
    hours: 'Mon-Sun: 7AM-9PM',
    description: 'Fresh grocer specializing in organic and locally-sourced produce.',
  },
  {
    name: 'South Melbourne Market',
    category: "Farmer's Market",
    address: 'Corner Coventry & Cecil Streets, South Melbourne VIC 3205',
    lng: 144.961,
    lat: -37.8304,
    rating: 4.7,
    phone: '+61 3 9209 6295',
    hours: 'Wed, Sat, Sun: 8AM-4PM, Fri: 8AM-5PM',
    description: 'Popular market with fresh food, deli, and organic produce.',
  },
  {
    name: 'Prahran Market',
    category: "Farmer's Market",
    address: '163 Commercial Rd, South Yarra VIC 3141',
    lng: 145.0027,
    lat: -37.8521,
    rating: 4.6,
    phone: '+61 3 8290 8220',
    hours: 'Tue, Thu, Fri, Sat: 7AM-5PM, Sun: 10AM-3PM',
    description: 'Historic market offering fresh produce, meat, and specialty foods.',
  },

  // Richmond & Collingwood
  {
    name: 'Richmond Harvest Wholefoods',
    category: 'Health Food Store',
    address: '88 Bridge Rd, Richmond VIC 3121',
    lng: 144.9892,
    lat: -37.8198,
    rating: 4.5,
    phone: '+61 3 9428 5111',
    hours: 'Mon-Sun: 9AM-7PM',
    description: 'Bulk wholefoods and organic products with eco-friendly focus.',
  },
  {
    name: 'Collingwood Organic Food Co-op',
    category: 'Organic Store',
    address: '45 Rokeby St, Collingwood VIC 3066',
    lng: 144.9895,
    lat: -37.8025,
    rating: 4.6,
    phone: '+61 3 9419 6006',
    hours: 'Mon-Sat: 10AM-6PM, Sun: 11AM-5PM',
    description: 'Community-owned co-op with organic and sustainable products.',
  },

  // St Kilda & Brighton
  {
    name: 'St Kilda Organic Farmers Market',
    category: "Farmer's Market",
    address: 'Acland St, St Kilda VIC 3182',
    lng: 144.9785,
    lat: -37.8686,
    rating: 4.5,
    phone: '+61 3 9534 0505',
    hours: 'Saturday: 8AM-1PM',
    description: 'Weekly farmers market with certified organic produce.',
  },
  {
    name: 'Brighton Organic Market',
    category: 'Organic Store',
    address: '28 Bay St, Brighton VIC 3186',
    lng: 145.0039,
    lat: -37.9075,
    rating: 4.4,
    phone: '+61 3 9592 4000',
    hours: 'Mon-Sun: 8AM-7PM',
    description: 'Boutique organic store with premium local produce.',
  },

  // Brunswick & Coburg
  {
    name: 'The Source Bulk Foods Brunswick',
    category: 'Health Food Store',
    address: '398 Sydney Rd, Brunswick VIC 3056',
    lng: 144.9625,
    lat: -37.7677,
    rating: 4.7,
    phone: '+61 3 9387 0099',
    hours: 'Mon-Fri: 9AM-6PM, Sat-Sun: 10AM-5PM',
    description: 'Sustainable bulk food store with organic options.',
  },
  {
    name: 'Coburg Farmers Market',
    category: "Farmer's Market",
    address: 'Bridges Reserve, Coburg VIC 3058',
    lng: 144.9645,
    lat: -37.7395,
    rating: 4.5,
    phone: '+61 3 9354 6000',
    hours: 'Saturday: 8AM-12:30PM',
    description: 'Community farmers market with fresh local produce.',
  },

  // Hawthorn & Camberwell
  {
    name: 'Hawthorn Wholefoods',
    category: 'Health Food Store',
    address: '723 Glenferrie Rd, Hawthorn VIC 3122',
    lng: 145.029,
    lat: -37.822,
    rating: 4.6,
    phone: '+61 3 9819 5244',
    hours: 'Mon-Sun: 9AM-6PM',
    description: 'Established health food store with vitamins and supplements.',
  },
  {
    name: 'Camberwell Sunday Market',
    category: "Farmer's Market",
    address: 'Station St, Camberwell VIC 3124',
    lng: 145.0579,
    lat: -37.8265,
    rating: 4.4,
    phone: '+61 3 9882 2466',
    hours: 'Sunday: 7AM-12:30PM',
    description: 'Large Sunday market with fresh produce and organic vendors.',
  },

  // Footscray & Yarraville
  {
    name: 'Footscray Community Farmers Market',
    category: "Farmer's Market",
    address: 'Leeds St, Footscray VIC 3011',
    lng: 144.8998,
    lat: -37.7995,
    rating: 4.5,
    phone: '+61 3 9688 0000',
    hours: 'Saturday: 8AM-1PM',
    description: 'Vibrant market with multicultural produce and organic options.',
  },
  {
    name: 'Yarraville Health Foods',
    category: 'Health Food Store',
    address: '90 Anderson St, Yarraville VIC 3013',
    lng: 144.8892,
    lat: -37.8159,
    rating: 4.3,
    phone: '+61 3 9314 3388',
    hours: 'Mon-Fri: 9AM-5:30PM, Sat: 9AM-3PM',
    description: 'Local health food store with organic and gluten-free products.',
  },
]

// Import function
async function importStores() {
  console.log('🚀 Starting store data import...')
  console.log(`📊 Total stores to import: ${stores.length}`)

  try {
    // Clear existing stores first
    console.log('\n🧹 Clearing existing stores...')
    const existingStores = await getDocs(collection(db, 'stores'))
    let deletedCount = 0

    for (const doc of existingStores.docs) {
      await deleteDoc(doc.ref)
      deletedCount++
    }

    console.log(`✅ Deleted ${deletedCount} existing stores`)

    // Add new stores
    console.log('\n📥 Adding new stores...')
    let successCount = 0
    let errorCount = 0

    for (const store of stores) {
      try {
        await addDoc(collection(db, 'stores'), store)
        successCount++
        console.log(`✓ Added: ${store.name}`)
      } catch (error) {
        errorCount++
        console.error(`✗ Failed to add ${store.name}:`, error.message)
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('📊 Import Summary:')
    console.log('='.repeat(50))
    console.log(`✅ Successfully imported: ${successCount} stores`)
    if (errorCount > 0) {
      console.log(`❌ Failed: ${errorCount} stores`)
    }
    console.log(`🗄️  Total in database: ${successCount} stores`)
    console.log('='.repeat(50))
    console.log('\n🎉 Store data import completed!')
    console.log('\n💡 Next steps:')
    console.log('   1. Run: npm run dev')
    console.log('   2. Navigate to Find Stores page')
    console.log('   3. Zoom in to see store markers')
    console.log('   4. Move map to load different stores')
  } catch (error) {
    console.error('❌ Import failed:', error)
    process.exit(1)
  }
}

// Run import
importStores()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error)
    process.exit(1)
  })


