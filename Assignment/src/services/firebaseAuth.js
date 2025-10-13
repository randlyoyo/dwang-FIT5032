// Firebase Auth服务
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { auth } from '../config/firebase.js'

class FirebaseAuthService {
  constructor() {
    this.auth = auth
    this.currentUser = null
    this.authStateListeners = []

    // 监听认证状态变化
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user
      this.authStateListeners.forEach((listener) => listener(user))
    })
  }

  // 添加认证状态监听器
  onAuthStateChange(callback) {
    this.authStateListeners.push(callback)
    // 立即调用一次，以防用户已经登录
    callback(this.currentUser)
  }

  // 移除认证状态监听器
  removeAuthStateListener(callback) {
    const index = this.authStateListeners.indexOf(callback)
    if (index > -1) {
      this.authStateListeners.splice(index, 1)
    }
  }

  // 用户登录
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password)
      const user = userCredential.user

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          role: user.role || 'user', // 从自定义claims获取角色
        },
      }
    } catch (error) {
      console.error('Sign in error:', error)
      return {
        success: false,
        error: this.getErrorMessage(error),
      }
    }
  }

  // 用户注册
  async signUp(email, password, displayName, role = 'user') {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password)
      const user = userCredential.user

      // 更新用户显示名称
      await updateProfile(user, {
        displayName: displayName,
      })

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: displayName,
          emailVerified: user.emailVerified,
          role: role,
        },
        message: 'Registration successful! You can now log in.',
      }
    } catch (error) {
      console.error('Sign up error:', error)
      return {
        success: false,
        error: this.getErrorMessage(error),
      }
    }
  }

  // 用户登出
  async signOut() {
    try {
      await signOut(this.auth)
      return { success: true }
    } catch (error) {
      console.error('Sign out error:', error)
      return {
        success: false,
        error: this.getErrorMessage(error),
      }
    }
  }

  // 获取当前用户
  getCurrentUser() {
    return this.currentUser
  }

  // 检查用户是否已认证
  isAuthenticated() {
    return !!this.currentUser
  }

  // 发送密码重置邮件
  async sendPasswordReset(email) {
    try {
      await sendPasswordResetEmail(this.auth, email)
      return {
        success: true,
        message: 'Password reset email sent successfully',
      }
    } catch (error) {
      console.error('Password reset error:', error)
      return {
        success: false,
        error: this.getErrorMessage(error),
      }
    }
  }

  // 获取用户信息（用于本地存储）
  getUserData() {
    if (!this.currentUser) return null

    return {
      uid: this.currentUser.uid,
      email: this.currentUser.email,
      displayName: this.currentUser.displayName,
      emailVerified: this.currentUser.emailVerified,
      role: this.currentUser.role || 'user',
    }
  }

  // 错误消息处理
  getErrorMessage(error) {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No user found with this email address'
      case 'auth/wrong-password':
        return 'Incorrect password'
      case 'auth/email-already-in-use':
        return 'An account with this email already exists'
      case 'auth/weak-password':
        return 'Password should be at least 6 characters'
      case 'auth/invalid-email':
        return 'Invalid email address'
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later'
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection'
      case 'auth/user-disabled':
        return 'This account has been disabled'
      default:
        return error.message || 'An error occurred during authentication'
    }
  }
}

// 创建单例实例
const firebaseAuthService = new FirebaseAuthService()

export default firebaseAuthService
