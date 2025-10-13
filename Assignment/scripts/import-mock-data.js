/**
 * Import Mock Data to Firebase Firestore
 *
 * This script imports mock data (users and recipes) from JSON files into Firestore.
 *
 * Usage:
 * 1. Create mock data on Mockaroo (https://www.mockaroo.com/)
 * 2. Download as JSON and place in data/ folder
 * 3. Run: node scripts/import-mock-data.js
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Firebase configuration (from your firebase.js)
const firebaseConfig = {
  apiKey: 'AIzaSyCiHLtSu1gPIw_EAa4DUQbK5RGJA_gXkdE',
  authDomain: 'assignment-cfc8f.firebaseapp.com',
  projectId: 'assignment-cfc8f',
  storageBucket: 'assignment-cfc8f.firebasestorage.app',
  messagingSenderId: '838358223615',
  appId: '1:838358223615:web:aedd47372fe13c28649aca',
  measurementId: 'G-JYQKQDTYTM',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

/**
 * Clear all documents from a collection
 */
async function clearCollection(collectionName) {
  console.log(`🗑️  Clearing collection: ${collectionName}...`)
  const querySnapshot = await getDocs(collection(db, collectionName))
  const deletePromises = querySnapshot.docs.map((document) =>
    deleteDoc(doc(db, collectionName, document.id)),
  )
  await Promise.all(deletePromises)
  console.log(`✅ Cleared ${querySnapshot.size} documents from ${collectionName}`)
}

/**
 * Import data to Firestore
 */
async function importData(collectionName, data) {
  console.log(`\n📤 Importing ${data.length} documents to ${collectionName}...`)
  let successCount = 0
  let errorCount = 0

  for (const item of data) {
    try {
      await addDoc(collection(db, collectionName), item)
      successCount++
      if (successCount % 10 === 0) {
        console.log(`   ✓ Imported ${successCount}/${data.length}...`)
      }
    } catch (error) {
      console.error(`   ✗ Error importing document:`, error)
      errorCount++
    }
  }

  console.log(`\n✅ Import complete for ${collectionName}:`)
  console.log(`   • Success: ${successCount}`)
  console.log(`   • Errors: ${errorCount}`)
}

/**
 * Load JSON data from file
 */
function loadJSONData(filename) {
  const filePath = path.join(__dirname, '..', 'data', filename)
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`)
    console.log(`\nPlease create the file with mock data from Mockaroo.`)
    return null
  }
  const rawData = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(rawData)
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting Firebase Firestore Data Import...\n')
  console.log('='.repeat(60))

  try {
    // Import Users
    const users = loadJSONData('mock-users.json')
    if (users) {
      await clearCollection('users')
      await importData('users', users)
    }

    // Import Recipes
    const recipes = loadJSONData('mock-recipes.json')
    if (recipes) {
      await clearCollection('recipes')
      await importData('recipes', recipes)
    }

    console.log('\n' + '='.repeat(60))
    console.log('🎉 All data imported successfully!')
    console.log('\n💡 Next steps:')
    console.log('   1. Open your app: http://localhost:5173')
    console.log('   2. Navigate to User Management or Recipe Management')
    console.log('   3. You should see the imported data!')
  } catch (error) {
    console.error('\n❌ Import failed:', error)
    process.exit(1)
  }

  process.exit(0)
}

// Run the script
main()

