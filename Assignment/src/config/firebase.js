// Firebase configuration file
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Firebase configuration - obtained from Firebase console
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

// Initialize Firebase Auth
export const auth = getAuth(app)

// Initialize Firestore
export const db = getFirestore(app)

// Export app instance (supports named and default exports)
export { app }
export default app
