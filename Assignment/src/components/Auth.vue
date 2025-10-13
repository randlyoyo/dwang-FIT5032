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
                    @input="clearError('password')"
                    required
                  />
                  <div v-if="errors.password" class="invalid-feedback">{{ errors.password }}</div>
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
                    @input="clearError('confirmPassword')"
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

                <div v-if="!isLogin" class="mb-3">
                  <label for="role" class="form-label">Account Type</label>
                  <select
                    class="form-select"
                    :class="{ 'is-invalid': errors.role }"
                    id="role"
                    v-model="formData.role"
                    @change="clearError('role')"
                    required
                  >
                    <option value="">Select Account Type</option>
                    <option value="user">Regular User</option>
                    <option value="admin">Administrator</option>
                  </select>
                  <div v-if="errors.role" class="invalid-feedback">{{ errors.role }}</div>
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
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authMiddleware } from '../middleware/auth.js'
import firebaseAuthService from '../services/firebaseAuth.js'

const router = useRouter()
const route = useRoute()
const emit = defineEmits(['authenticated'])

const isLogin = ref(true)

const formData = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  fullName: '',
  role: '',
})

const errors = reactive({
  email: null,
  password: null,
  confirmPassword: null,
  fullName: null,
  role: null,
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
  formData.role = ''
}

const clearAllErrors = () => {
  Object.keys(errors).forEach((key) => {
    errors[key] = null
  })
}

const clearError = (field) => {
  errors[field] = null
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
  } else if (!/(?=.*[@$!%*?&])/.test(formData.password)) {
    errors.password = 'Password must contain at least one special character (@$!%*?&)'
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
            role: result.user.role,
            uid: result.user.uid,
            emailVerified: result.user.emailVerified,
          }

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
        // Firebase注册
        const result = await firebaseAuthService.signUp(
          formData.email,
          formData.password,
          formData.fullName,
          formData.role || 'user',
        )

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
})

// 组件卸载时清理监听器
onUnmounted(() => {
  // 清理认证状态监听器
  firebaseAuthService.removeAuthStateListener(() => {})
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
</style>
