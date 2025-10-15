// Firebase Auth服务
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
} from 'firebase/auth'
import { auth, db } from '../config/firebase.js'
import { doc, setDoc, getDoc } from 'firebase/firestore'

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

      // 从Firestore获取用户额外信息
      let registrationDate = null
      let role = 'user'

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          console.log('Fetched user data from Firestore:', userData)
          registrationDate = userData.registrationDate
          role = userData.role || 'user'
          console.log('Extracted role:', role, 'registrationDate:', registrationDate)
        } else {
          console.warn('User document does not exist in Firestore for uid:', user.uid)
        }
      } catch (firestoreError) {
        console.error('Could not fetch user data from Firestore:', firestoreError)
      }

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          role: role,
          registrationDate: registrationDate,
        },
      }
    } catch (error) {
      console.error('Sign in error:', error)
      return {
        success: false,
        error: `GitHub sign-in failed: ${error.message || this.getErrorMessage(error)}`,
      }
    }
  }

  // 用户注册
  async signUp(email, password, displayName, role = 'user', registrationDate) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password)
      const user = userCredential.user

      // 更新用户显示名称
      await updateProfile(user, {
        displayName: displayName,
      })

      // 保存用户信息到Firestore
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        role: role,
        registrationDate: registrationDate || new Date().toISOString(),
        emailVerified: user.emailVerified,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      console.log('Saving user data to Firestore:', userData)

      // 将用户数据保存到Firestore的users集合
      await setDoc(doc(db, 'users', user.uid), userData)

      console.log('User data saved successfully to Firestore')

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: displayName,
          emailVerified: user.emailVerified,
          role: role,
          registrationDate: userData.registrationDate,
        },
        message: 'Registration successful! You can now log in.',
      }
    } catch (error) {
      console.error('Sign up error:', error)
      return {
        success: false,
        error: `GitHub sign-in failed: ${error.message || this.getErrorMessage(error)}`,
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
        error: `GitHub sign-in failed: ${error.message || this.getErrorMessage(error)}`,
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
        error: `GitHub sign-in failed: ${error.message || this.getErrorMessage(error)}`,
      }
    }
  }

  // Google登录
  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider()

      // 添加自定义参数
      provider.setCustomParameters({
        prompt: 'select_account',
      })

      console.log('Attempting Google sign in with provider:', provider)
      const result = await signInWithPopup(this.auth, provider)
      const user = result.user

      // 检查用户是否已存在
      let userData = null
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          userData = userDoc.data()
        }
      } catch (error) {
        console.warn('Could not fetch user data from Firestore:', error)
      }

      // 如果用户不存在，创建新用户记录
      if (!userData) {
        const newUserData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: 'user',
          registrationDate: new Date().toISOString(),
          emailVerified: user.emailVerified,
          provider: 'google',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        await setDoc(doc(db, 'users', user.uid), newUserData)
        userData = newUserData
      }

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          role: userData?.role || 'user',
          registrationDate: userData?.registrationDate,
        },
      }
    } catch (error) {
      console.error('Google sign in error:', error)

      // 详细的错误信息
      if (error.code === 'auth/unauthorized-domain') {
        return {
          success: false,
          error:
            'This domain is not authorized for Google sign-in. Please contact the administrator.',
        }
      } else if (error.code === 'auth/popup-closed-by-user') {
        return {
          success: false,
          error: 'Sign-in popup was closed. Please try again.',
        }
      } else if (error.code === 'auth/popup-blocked') {
        return {
          success: false,
          error: 'Sign-in popup was blocked. Please allow popups for this site.',
        }
      } else if (error.code === 'auth/redirect-uri-mismatch') {
        return {
          success: false,
          error: 'OAuth redirect URI mismatch. Please check Firebase console configuration.',
        }
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        return {
          success: false,
          error:
            'An account already exists with this email using a different sign-in method. Please use your original sign-in method or contact support to link accounts.',
        }
      }

      return {
        success: false,
        error: `GitHub sign-in failed: ${error.message || this.getErrorMessage(error)}`,
      }
    }
  }

  // GitHub登录
  async signInWithGitHub() {
    try {
      const provider = new GithubAuthProvider()

      // 添加自定义参数
      provider.addScope('user:email')
      provider.addScope('read:user')

      console.log('Attempting GitHub sign in with provider:', provider)
      console.log('GitHub provider scopes:', provider.scopes)
      console.log('Firebase Auth instance:', this.auth)

      const result = await signInWithPopup(this.auth, provider)
      const user = result.user

      // 检查用户是否已存在
      let userData = null
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          userData = userDoc.data()
        }
      } catch (error) {
        console.warn('Could not fetch user data from Firestore:', error)
      }

      // 如果用户不存在，创建新用户记录
      if (!userData) {
        const newUserData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: 'user',
          registrationDate: new Date().toISOString(),
          emailVerified: user.emailVerified,
          provider: 'github',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        await setDoc(doc(db, 'users', user.uid), newUserData)
        userData = newUserData
      }

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          role: userData?.role || 'user',
          registrationDate: userData?.registrationDate,
        },
      }
    } catch (error) {
      console.error('GitHub sign in error:', error)
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      console.error('Full error object:', error)

      // 详细的错误信息
      if (error.code === 'auth/unauthorized-domain') {
        return {
          success: false,
          error:
            'This domain is not authorized for GitHub sign-in. Please contact the administrator.',
        }
      } else if (error.code === 'auth/popup-closed-by-user') {
        return {
          success: false,
          error: 'Sign-in popup was closed. Please try again.',
        }
      } else if (error.code === 'auth/popup-blocked') {
        return {
          success: false,
          error: 'Sign-in popup was blocked. Please allow popups for this site.',
        }
      } else if (error.code === 'auth/redirect-uri-mismatch') {
        return {
          success: false,
          error: 'OAuth redirect URI mismatch. Please check Firebase console configuration.',
        }
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        return {
          success: false,
          error:
            'An account already exists with this email using a different sign-in method. Please use your original sign-in method or contact support to link accounts.',
        }
      }

      return {
        success: false,
        error: `GitHub sign-in failed: ${error.message || this.getErrorMessage(error)}`,
      }
    }
  }

  // 获取用户信息（用于本地存储）
  async getUserData() {
    if (!this.currentUser) return null

    // 尝试从Firestore获取完整的用户信息
    let registrationDate = null
    let role = 'user'

    try {
      const userDoc = await getDoc(doc(db, 'users', this.currentUser.uid))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        registrationDate = userData.registrationDate
        role = userData.role || 'user'
      }
    } catch (error) {
      console.warn('Could not fetch user data from Firestore:', error)
    }

    return {
      uid: this.currentUser.uid,
      email: this.currentUser.email,
      displayName: this.currentUser.displayName,
      emailVerified: this.currentUser.emailVerified,
      role: role,
      registrationDate: registrationDate,
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
