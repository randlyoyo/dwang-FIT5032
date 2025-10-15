<template>
  <div>
    <PageHeader
      :title="isLogin ? 'Welcome Back' : 'Join Our Community'"
      :description="
        isLogin
          ? 'Sign in to access your healthy recipes'
          : 'Create an account to start sharing recipes'
      "
    />
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow-sm">
            <div class="card-body p-4">
              <form @submit.prevent="handleSubmit">
                <div class="mb-3">
                  <label for="email" class="form-label">Email Address</label>
                  <input
                    type="email"
                    class="form-control"
                    :class="{ 'is-invalid': errors.email }"
                    id="email"
                    v-model="formData.email"
                    @blur="validateEmail"
                    @input="clearError('email')"
                    required
                  />
                  <div v-if="errors.email" class="invalid-feedback">{{ errors.email }}</div>
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">Password</label>
                  <input
                    type="password"
                    class="form-control"
                    :class="{ 'is-invalid': errors.password }"
                    id="password"
                    v-model="formData.password"
                    @blur="validatePassword"
                    @input="checkPasswordRequirements"
                    required
                  />
                  <div v-if="errors.password" class="invalid-feedback">{{ errors.password }}</div>

                  <!-- 密码验证规则显示 -->
                  <div v-if="!isLogin && formData.password" class="password-requirements mt-2">
                    <div class="requirements-title">Password Requirements:</div>
                    <div
                      class="requirement-item"
                      :class="{ completed: passwordRequirements.length }"
                    >
                      <i
                        class="bi"
                        :class="
                          passwordRequirements.length
                            ? 'bi-check-circle-fill text-success'
                            : 'bi-circle text-muted'
                        "
                      ></i>
                      <span>At least 8 characters</span>
                    </div>
                    <div
                      class="requirement-item"
                      :class="{ completed: passwordRequirements.lowercase }"
                    >
                      <i
                        class="bi"
                        :class="
                          passwordRequirements.lowercase
                            ? 'bi-check-circle-fill text-success'
                            : 'bi-circle text-muted'
                        "
                      ></i>
                      <span>At least one lowercase letter</span>
                    </div>
                    <div
                      class="requirement-item"
                      :class="{ completed: passwordRequirements.uppercase }"
                    >
                      <i
                        class="bi"
                        :class="
                          passwordRequirements.uppercase
                            ? 'bi-check-circle-fill text-success'
                            : 'bi-circle text-muted'
                        "
                      ></i>
                      <span>At least one uppercase letter</span>
                    </div>
                    <div
                      class="requirement-item"
                      :class="{ completed: passwordRequirements.number }"
                    >
                      <i
                        class="bi"
                        :class="
                          passwordRequirements.number
                            ? 'bi-check-circle-fill text-success'
                            : 'bi-circle text-muted'
                        "
                      ></i>
                      <span>At least one number</span>
                    </div>
                    <div
                      class="requirement-item"
                      :class="{ completed: passwordRequirements.special }"
                    >
                      <i
                        class="bi"
                        :class="
                          passwordRequirements.special
                            ? 'bi-check-circle-fill text-success'
                            : 'bi-circle text-muted'
                        "
                      ></i>
                      <span>At least one special character (@$!%*?&.)</span>
                    </div>
                  </div>
                </div>

                <div v-if="!isLogin" class="mb-3">
                  <label for="confirmPassword" class="form-label">Confirm Password</label>
                  <input
                    type="password"
                    class="form-control"
                    :class="{ 'is-invalid': errors.confirmPassword }"
                    id="confirmPassword"
                    v-model="formData.confirmPassword"
                    @blur="validateConfirmPassword"
                    @input="validateConfirmPassword"
                    required
                  />
                  <div v-if="errors.confirmPassword" class="invalid-feedback">
                    {{ errors.confirmPassword }}
                  </div>
                </div>

                <div v-if="!isLogin" class="mb-3">
                  <label for="fullName" class="form-label">Full Name</label>
                  <input
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.fullName }"
                    id="fullName"
                    v-model="formData.fullName"
                    @blur="validateFullName"
                    @input="clearError('fullName')"
                    required
                  />
                  <div v-if="errors.fullName" class="invalid-feedback">{{ errors.fullName }}</div>
                </div>

                <!-- 认证消息显示 -->
                <div
                  v-if="authMessage"
                  class="alert"
                  :class="
                    authMessage.includes('successful') || authMessage.includes('success')
                      ? 'alert-success'
                      : 'alert-danger'
                  "
                >
                  {{ authMessage }}
                </div>

                <!-- 第三方登录选项 -->
                <div class="mb-3">
                  <div class="text-center mb-3">
                    <span class="text-muted">Or continue with</span>
                  </div>

                  <!-- Firebase UI 容器 -->
                  <div id="firebaseui-auth-container"></div>

                  <!-- 第三方登录按钮 -->
                  <div id="manual-auth-buttons">
                    <div class="row g-2">
                      <div class="col-6">
                        <button
                          type="button"
                          class="btn btn-outline-danger w-100"
                          @click="handleGoogleSignIn"
                          :disabled="isLoading"
                        >
                          <i class="bi bi-google me-2"></i>
                          Google
                        </button>
                      </div>
                      <div class="col-6">
                        <button
                          type="button"
                          class="btn btn-outline-dark w-100"
                          @click="handleGitHubSignIn"
                          :disabled="isLoading"
                        >
                          <i class="bi bi-github me-2"></i>
                          GitHub
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="d-grid gap-2">
                  <button type="submit" class="btn btn-success" :disabled="isLoading">
                    <span
                      v-if="isLoading"
                      class="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    {{ isLoading ? 'Processing...' : isLogin ? 'Login' : 'Register' }}
                  </button>
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="toggleMode"
                    :disabled="isLoading"
                  >
                    {{ isLogin ? 'Need an account? Register' : 'Already have an account? Login' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import PageHeader from './PageHeader.vue'
import { ref, reactive, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authMiddleware } from '../middleware/auth.js'
import firebaseAuthService from '../services/firebaseAuth.js'
import { auth } from '../config/firebase.js'

const router = useRouter()
const route = useRoute()
const emit = defineEmits(['authenticated'])

const isLogin = ref(true)

const formData = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  fullName: '',
})

const errors = reactive({
  email: null,
  password: null,
  confirmPassword: null,
  fullName: null,
})

// 密码验证规则状态
const passwordRequirements = reactive({
  length: false,
  lowercase: false,
  uppercase: false,
  number: false,
  special: false,
})

const isLoading = ref(false)
const authMessage = ref('')

const toggleMode = () => {
  // Just update URL, let the watcher handle the rest
  const newMode = isLogin.value ? 'register' : 'login'
  router.push({ name: 'Auth', query: { mode: newMode } })
}

// Watch for route query changes
watch(
  () => route.query.mode,
  (newMode) => {
    if (newMode === 'register') {
      isLogin.value = false
    } else {
      isLogin.value = true
    }
    clearAllErrors()
    resetForm()
  },
)

const resetForm = () => {
  formData.email = ''
  formData.password = ''
  formData.confirmPassword = ''
  formData.fullName = ''

  // 重置密码要求状态
  Object.keys(passwordRequirements).forEach((key) => {
    passwordRequirements[key] = false
  })
}

const clearAllErrors = () => {
  Object.keys(errors).forEach((key) => {
    errors[key] = null
  })
}

const clearError = (field) => {
  errors[field] = null
}

// 检查密码要求
const checkPasswordRequirements = () => {
  if (!isLogin.value && formData.password) {
    passwordRequirements.length = formData.password.length >= 8
    passwordRequirements.lowercase = /(?=.*[a-z])/.test(formData.password)
    passwordRequirements.uppercase = /(?=.*[A-Z])/.test(formData.password)
    passwordRequirements.number = /(?=.*\d)/.test(formData.password)
    passwordRequirements.special = /(?=.*[@$!%*?&.])/.test(formData.password)
  } else {
    // 重置所有要求状态
    Object.keys(passwordRequirements).forEach((key) => {
      passwordRequirements[key] = false
    })
  }

  // 清除密码错误
  clearError('password')

  // 如果确认密码已经输入，重新验证确认密码
  if (formData.confirmPassword) {
    validateConfirmPassword()
  }
}

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!formData.email) {
    errors.email = 'Email is required'
  } else if (!emailRegex.test(formData.email)) {
    errors.email = 'Please enter a valid email address'
  } else {
    errors.email = null
  }
}

const validatePassword = () => {
  if (!formData.password) {
    errors.password = 'Password is required'
  } else if (formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long'
  } else if (!/(?=.*[a-z])/.test(formData.password)) {
    errors.password = 'Password must contain at least one lowercase letter'
  } else if (!/(?=.*[A-Z])/.test(formData.password)) {
    errors.password = 'Password must contain at least one uppercase letter'
  } else if (!/(?=.*\d)/.test(formData.password)) {
    errors.password = 'Password must contain at least one number'
  } else if (!/(?=.*[@$!%*?&.])/.test(formData.password)) {
    errors.password = 'Password must contain at least one special character (@$!%*?&.)'
  } else {
    errors.password = null
  }
}

const validateConfirmPassword = () => {
  if (!isLogin.value) {
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    } else {
      errors.confirmPassword = null
    }
  }
}

const validateFullName = () => {
  if (!isLogin.value) {
    if (!formData.fullName) {
      errors.fullName = 'Full name is required'
    } else if (formData.fullName.length < 2) {
      errors.fullName = 'Full name must be at least 2 characters long'
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.fullName)) {
      errors.fullName = 'Full name can only contain letters, spaces, hyphens, and apostrophes'
    } else {
      errors.fullName = null
    }
  }
}

// Firebase UI 配置和初始化 - 使用官方最佳实践
const initializeFirebaseUI = () => {
  // 检查Firebase UI是否已加载
  if (typeof firebaseui === 'undefined') {
    console.warn('Firebase UI not loaded, retrying in 1 second...')
    setTimeout(initializeFirebaseUI, 1000)
    return
  }

  console.log('Firebase UI loaded successfully:', firebaseui)

  // 检查是否已有UI实例，避免重复初始化
  const existingUI = firebaseui.auth.AuthUI.getInstance()
  if (existingUI) {
    existingUI.reset()
  }

  // 导入Firebase UI
  const { auth } = firebaseAuthService
  console.log('Firebase Auth instance:', auth)

  const ui = new firebaseui.auth.AuthUI(auth)
  console.log('Firebase UI instance created:', ui)

  // 配置Firebase UI - 简化配置
  const uiConfig = {
    signInOptions: ['google.com', 'github.com'],
    signInFlow: 'popup',
    signInSuccessUrl: '/',
    callbacks: {
      signInSuccessWithAuthResult: (authResult, redirectUrl) => {
        // 处理登录成功
        const user = authResult.user
        const userData = {
          username: user.email,
          email: user.email,
          fullName: user.displayName,
          displayName: user.displayName,
          role: 'user',
          uid: user.uid,
          registrationDate: new Date().toISOString(),
          emailVerified: user.emailVerified,
          photoURL: user.photoURL,
        }

        console.log('Firebase UI Login - userData to save:', userData)

        if (authMiddleware.login(userData)) {
          emit('authenticated', userData)
          authMessage.value = 'Login successful!'
          setTimeout(() => {
            router.push({ name: 'Home' })
          }, 1000)
        } else {
          authMessage.value = 'Login failed due to security validation!'
        }

        return false // 阻止默认重定向
      },
      signInFailure: (error) => {
        console.error('Firebase UI sign in error:', error)
        authMessage.value = 'Login failed. Please try again.'
      },
      uiShown: () => {
        console.log('Firebase UI is shown')
      },
    },
  }

  // 启动Firebase UI
  console.log('Starting Firebase UI with config:', uiConfig)

  try {
    ui.start('#firebaseui-auth-container', uiConfig)
    console.log('Firebase UI started successfully')
  } catch (error) {
    console.error('Error starting Firebase UI:', error)
    authMessage.value = 'Failed to initialize login options. Please refresh the page.'
  }

  // 添加调试信息和备用方案
  setTimeout(() => {
    const container = document.getElementById('firebaseui-auth-container')
    const manualButtons = document.getElementById('manual-auth-buttons')

    if (container) {
      console.log('Firebase UI container content:', container.innerHTML)
      if (container.innerHTML.trim() === '') {
        console.warn('Firebase UI container is empty - showing manual buttons')
        if (manualButtons) {
          manualButtons.style.display = 'block'
        }
      }
    } else {
      console.error('Firebase UI container not found - showing manual buttons')
      if (manualButtons) {
        manualButtons.style.display = 'block'
      }
    }
  }, 3000)
}

// 处理Google登录（手动按钮）
const handleGoogleSignIn = async () => {
  isLoading.value = true
  authMessage.value = ''

  try {
    const result = await firebaseAuthService.signInWithGoogle()

    if (result.success) {
      const userData = {
        username: result.user.email,
        email: result.user.email,
        fullName: result.user.displayName,
        displayName: result.user.displayName,
        role: result.user.role,
        uid: result.user.uid,
        registrationDate: result.user.registrationDate,
        emailVerified: result.user.emailVerified,
        photoURL: result.user.photoURL,
      }

      console.log('Google Login - userData to save:', userData)

      if (authMiddleware.login(userData)) {
        emit('authenticated', userData)
        authMessage.value = 'Google login successful!'
        setTimeout(() => {
          router.push({ name: 'Home' })
        }, 1000)
      } else {
        authMessage.value = 'Google login failed due to security validation!'
      }
    } else {
      authMessage.value = result.error
    }
  } catch (error) {
    console.error('Google sign in error:', error)
    authMessage.value = 'Google login failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}

// 处理GitHub登录（手动按钮）
const handleGitHubSignIn = async () => {
  isLoading.value = true
  authMessage.value = ''

  try {
    const result = await firebaseAuthService.signInWithGitHub()

    if (result.success) {
      const userData = {
        username: result.user.email,
        email: result.user.email,
        fullName: result.user.displayName,
        displayName: result.user.displayName,
        role: result.user.role,
        uid: result.user.uid,
        registrationDate: result.user.registrationDate,
        emailVerified: result.user.emailVerified,
        photoURL: result.user.photoURL,
      }

      console.log('GitHub Login - userData to save:', userData)

      if (authMiddleware.login(userData)) {
        emit('authenticated', userData)
        authMessage.value = 'GitHub login successful!'
        setTimeout(() => {
          router.push({ name: 'Home' })
        }, 1000)
      } else {
        authMessage.value = 'GitHub login failed due to security validation!'
      }
    } else {
      authMessage.value = result.error
    }
  } catch (error) {
    console.error('GitHub sign in error:', error)
    authMessage.value = 'GitHub login failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}

// 清理Firebase UI
const cleanupFirebaseUI = () => {
  const container = document.getElementById('firebaseui-auth-container')
  if (container) {
    container.innerHTML = ''
  }
}

const handleSubmit = async () => {
  // Validate all fields
  validateEmail()
  validatePassword()
  if (!isLogin.value) {
    validateConfirmPassword()
    validateFullName()
  }

  // Check if there are any errors
  const hasErrors = Object.values(errors).some((error) => error !== null)

  if (!hasErrors) {
    isLoading.value = true
    authMessage.value = ''

    try {
      if (isLogin.value) {
        // Firebase登录
        const result = await firebaseAuthService.signIn(formData.email, formData.password)

        if (result.success) {
          // 使用安全认证中间件存储用户信息
          const userData = {
            username: result.user.email,
            email: result.user.email,
            fullName: result.user.displayName,
            displayName: result.user.displayName,
            role: result.user.role,
            uid: result.user.uid,
            registrationDate: result.user.registrationDate,
            emailVerified: result.user.emailVerified,
          }

          console.log('Login - userData to save:', userData)

          if (authMiddleware.login(userData)) {
            emit('authenticated', userData)
            authMessage.value = 'Login successful!'
            // 登录成功后跳转到首页
            setTimeout(() => {
              router.push({ name: 'Home' })
            }, 1000)
          } else {
            authMessage.value = 'Login failed due to security validation!'
          }
        } else {
          authMessage.value = result.error
        }
      } else {
        // Firebase注册 - 所有注册用户默认为普通用户
        const registrationDate = new Date().toISOString()
        console.log('Registering user as regular user')
        const result = await firebaseAuthService.signUp(
          formData.email,
          formData.password,
          formData.fullName,
          'user', // 固定为普通用户
          registrationDate,
        )
        console.log('Registration result:', result)

        if (result.success) {
          authMessage.value = result.message
          // 注册成功后切换到登录模式
          setTimeout(() => {
            isLogin.value = true
            resetForm()
            clearAllErrors()
          }, 2000)
        } else {
          authMessage.value = result.error
        }
      }
    } catch (error) {
      console.error('Authentication error:', error)
      authMessage.value = 'An unexpected error occurred. Please try again.'
    } finally {
      isLoading.value = false
    }
  }
}

// 组件挂载时监听认证状态
onMounted(() => {
  // Check URL query parameter to set initial mode
  const mode = route.query.mode
  if (mode === 'register') {
    isLogin.value = false
  } else {
    isLogin.value = true
  }

  // Listen for Firebase auth state changes
  firebaseAuthService.onAuthStateChange((user) => {
    if (user) {
      // 用户已登录，获取用户数据
      const userData = firebaseAuthService.getUserData()
      if (userData) {
        const authUserData = {
          username: userData.email,
          email: userData.email,
          fullName: userData.displayName,
          role: userData.role,
          uid: userData.uid,
          emailVerified: userData.emailVerified,
        }

        // 使用安全认证中间件存储用户信息
        if (authMiddleware.login(authUserData)) {
          emit('authenticated', authUserData)
        }
      }
    }
  })

  // 初始化Firebase UI（可选）
  nextTick(() => {
    // 尝试初始化Firebase UI，但不依赖它
    try {
      initializeFirebaseUI()
    } catch (error) {
      console.warn('Firebase UI initialization failed, using manual buttons:', error)
    }
  })
})

// 组件卸载时清理监听器
onUnmounted(() => {
  // 清理认证状态监听器
  firebaseAuthService.removeAuthStateListener(() => {})

  // 清理Firebase UI
  cleanupFirebaseUI()
})
</script>

<style scoped>
.card {
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  background-color: #198754;
  color: white;
  padding: 15px;
  border-radius: 10px 10px 0 0;
}

.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  display: block;
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* 密码验证规则样式 */
.password-requirements {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px;
  margin-top: 8px;
}

.requirements-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
}

.requirement-item {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.requirement-item:last-child {
  margin-bottom: 0;
}

.requirement-item i {
  margin-right: 8px;
  font-size: 0.9rem;
}

.requirement-item.completed {
  color: #198754;
}

.requirement-item.completed span {
  text-decoration: line-through;
  opacity: 0.7;
}

/* Firebase UI 官方样式优化 */
#firebaseui-auth-container {
  margin-top: 1rem;
  font-family: 'Roboto', sans-serif;
}

/* 容器样式 */
.firebaseui-container {
  max-width: 100% !important;
  margin: 0 auto !important;
  padding: 0 !important;
}

/* 卡片样式 */
.firebaseui-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  border: 1px solid #e0e0e0 !important;
  border-radius: 8px !important;
  background: #fff !important;
  padding: 24px !important;
}

/* 按钮样式 */
.firebaseui-button {
  border-radius: 6px !important;
  font-weight: 500 !important;
  font-size: 14px !important;
  padding: 12px 16px !important;
  margin: 8px 0 !important;
  transition: all 0.2s ease !important;
  border: 1px solid #dadce0 !important;
  background: #fff !important;
  color: #3c4043 !important;
}

.firebaseui-button:hover {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
  border-color: #dadce0 !important;
}

/* Google按钮特殊样式 */
.firebaseui-button.firebaseui-idp-google {
  background: #fff !important;
  color: #3c4043 !important;
  border: 1px solid #dadce0 !important;
}

.firebaseui-button.firebaseui-idp-google:hover {
  background: #f8f9fa !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
}

/* GitHub按钮特殊样式 */
.firebaseui-button.firebaseui-idp-github {
  background: #24292e !important;
  color: #fff !important;
  border: 1px solid #24292e !important;
}

.firebaseui-button.firebaseui-idp-github:hover {
  background: #1a1e22 !important;
  border-color: #1a1e22 !important;
}

/* 标题样式 */
.firebaseui-title {
  font-size: 24px !important;
  font-weight: 400 !important;
  color: #3c4043 !important;
  margin-bottom: 16px !important;
}

/* 分隔线样式 */
.firebaseui-separator {
  margin: 16px 0 !important;
  border-top: 1px solid #dadce0 !important;
}

.firebaseui-separator-label {
  background: #fff !important;
  color: #5f6368 !important;
  font-size: 14px !important;
  padding: 0 16px !important;
}

/* 错误消息样式 */
.firebaseui-error {
  background: #fce8e6 !important;
  color: #d93025 !important;
  border: 1px solid #fce8e6 !important;
  border-radius: 4px !important;
  padding: 12px !important;
  margin: 8px 0 !important;
}

/* 加载状态样式 */
.firebaseui-loading {
  color: #5f6368 !important;
  font-size: 14px !important;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .firebaseui-card {
    padding: 16px !important;
    margin: 8px !important;
  }

  .firebaseui-button {
    font-size: 13px !important;
    padding: 10px 14px !important;
  }
}

/* 手动按钮样式 */
.btn-outline-danger {
  border-color: #db4437;
  color: #db4437;
}

.btn-outline-danger:hover {
  background-color: #db4437;
  border-color: #db4437;
  color: white;
}

.btn-outline-dark {
  border-color: #333;
  color: #333;
}

.btn-outline-dark:hover {
  background-color: #333;
  border-color: #333;
  color: white;
}

/* 第三方登录图标 */
.bi-google {
  color: #db4437;
}

.bi-github {
  color: #333;
}

.btn-outline-danger:hover .bi-google,
.btn-outline-dark:hover .bi-github {
  color: white;
}
</style>
