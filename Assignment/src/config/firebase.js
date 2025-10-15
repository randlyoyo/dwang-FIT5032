// Firebase配置文件
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Firebase配置 - 从Firebase控制台获取
const firebaseConfig = {
  apiKey: 'AIzaSyCiHLtSu1gPIw_EAa4DUQbK5RGJA_gXkdE',
  authDomain: 'assignment-cfc8f.firebaseapp.com',
  projectId: 'assignment-cfc8f',
  storageBucket: 'assignment-cfc8f.firebasestorage.app',
  messagingSenderId: '838358223615',
  appId: '1:838358223615:web:aedd47372fe13c28649aca',
  measurementId: 'G-JYQKQDTYTM',
}

// 初始化Firebase
const app = initializeApp(firebaseConfig)

// 初始化Firebase Auth
export const auth = getAuth(app)

// 初始化Firestore
export const db = getFirestore(app)

// 导出 app 实例（支持命名导出和默认导出）
export { app }
export default app
