<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header bg-success text-white text-center">
            <h4>{{ isLogin ? 'Login' : 'Register' }}</h4>
          </div>
          <div class="card-body">
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
                  required>
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
                  required>
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
                  required>
                <div v-if="errors.confirmPassword" class="invalid-feedback">{{ errors.confirmPassword }}</div>
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
                  required>
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
                  required>
                  <option value="">Select Account Type</option>
                  <option value="user">Regular User</option>
                  <option value="admin">Administrator</option>
                </select>
                <div v-if="errors.role" class="invalid-feedback">{{ errors.role }}</div>
              </div>

              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-success">
                  {{ isLogin ? 'Login' : 'Register' }}
                </button>
                <button type="button" class="btn btn-outline-secondary" @click="toggleMode">
                  {{ isLogin ? 'Need an account? Register' : 'Already have an account? Login' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const emit = defineEmits(['authenticated'])

const isLogin = ref(true)
const formData = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  fullName: '',
  role: ''
})

const errors = reactive({
  email: null,
  password: null,
  confirmPassword: null,
  fullName: null,
  role: null
})

const toggleMode = () => {
  isLogin.value = !isLogin.value
  clearAllErrors()
  resetForm()
}

const resetForm = () => {
  formData.email = ''
  formData.password = ''
  formData.confirmPassword = ''
  formData.fullName = ''
  formData.role = ''
}

const clearAllErrors = () => {
  Object.keys(errors).forEach(key => {
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
  } else if (formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters long'
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
    } else {
      errors.fullName = null
    }
  }
}

const handleSubmit = () => {
  // Validate all fields
  validateEmail()
  validatePassword()
  if (!isLogin.value) {
    validateConfirmPassword()
    validateFullName()
  }

  // Check if there are any errors
  const hasErrors = Object.values(errors).some(error => error !== null)

  if (!hasErrors) {
    // Simulate authentication
    const user = {
      email: formData.email,
      fullName: formData.fullName || 'User',
      role: formData.role || 'user',
      id: Date.now()
    }

    // Store user in localStorage
    localStorage.setItem('currentUser', JSON.stringify(user))

    // Store all users for login simulation
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    if (!isLogin.value) {
      users.push(user)
      localStorage.setItem('users', JSON.stringify(users))
    }

    emit('authenticated', user)
    alert(isLogin.value ? 'Login successful!' : 'Registration successful!')
  }
}
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
