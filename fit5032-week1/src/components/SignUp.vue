<template>
  <div class="content">
    <h2>Create Account</h2>
    <p>Sign up to access nutrition resources</p>

    <form @submit.prevent="validateForm">
      <div class="form-group">
        <label for="firstName">First Name</label>
        <input type="text" id="firstName" v-model="signupForm.firstName">
        <div class="error" v-if="errors.firstName">{{ errors.firstName }}</div>
      </div>

      <div class="form-group">
        <label for="lastName">Last Name</label>
        <input type="text" id="lastName" v-model="signupForm.lastName">
        <div class="error" v-if="errors.lastName">{{ errors.lastName }}</div>
      </div>

      <div class="form-group">
        <label for="email">Email Address</label>
        <input type="email" id="email" v-model="signupForm.email">
        <div class="error" v-if="errors.email">{{ errors.email }}</div>
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" v-model="signupForm.password">
        <div class="error" v-if="errors.password">{{ errors.password }}</div>
      </div>

      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <input type="password" id="confirmPassword" v-model="signupForm.confirmPassword">
        <div class="error" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</div>
      </div>

      <div class="form-group">
        <label>I am primarily interested in:</label>
        <div style="margin-top: 10px;">
          <input type="radio" id="interestUser" value="user" v-model="signupForm.interest">
          <label for="interestUser" style="display: inline; font-weight: normal;">Nutrition resources</label>
        </div>
        <div>
          <input type="radio" id="interestProfessional" value="professional" v-model="signupForm.interest">
          <label for="interestProfessional" style="display: inline; font-weight: normal;">Professional resources</label>
        </div>
        <div class="error" v-if="errors.interest">{{ errors.interest }}</div>
      </div>

      <div class="form-group">
        <div>
          <input type="checkbox" id="terms" v-model="signupForm.agreeTerms">
          <label for="terms" style="display: inline; font-weight: normal;">I agree to the Terms and Conditions</label>
        </div>
        <div class="error" v-if="errors.agreeTerms">{{ errors.agreeTerms }}</div>
      </div>

      <button type="submit" class="submit-btn">Create Account</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'SignUp',
  data() {
    return {
      signupForm: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        interest: '',
        agreeTerms: false
      },
      errors: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        interest: '',
        agreeTerms: ''
      }
    }
  },
  methods: {
    validateForm() {
      // Reset errors
      Object.keys(this.errors).forEach(key => this.errors[key] = '')

      let isValid = true

      // First name validation
      if (!this.signupForm.firstName.trim()) {
        this.errors.firstName = 'First name is required'
        isValid = false
      }

      // Last name validation
      if (!this.signupForm.lastName.trim()) {
        this.errors.lastName = 'Last name is required'
        isValid = false
      }

      // Email validation
      if (!this.signupForm.email.trim()) {
        this.errors.email = 'Email is required'
        isValid = false
      } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(this.signupForm.email)) {
        this.errors.email = 'Please enter a valid email address'
        isValid = false
      }

      // Password validation
      if (!this.signupForm.password) {
        this.errors.password = 'Password is required'
        isValid = false
      } else if (this.signupForm.password.length < 8) {
        this.errors.password = 'Password must be at least 8 characters'
        isValid = false
      }

      // Confirm password validation
      if (!this.signupForm.confirmPassword) {
        this.errors.confirmPassword = 'Please confirm your password'
        isValid = false
      } else if (this.signupForm.password !== this.signupForm.confirmPassword) {
        this.errors.confirmPassword = 'Passwords do not match'
        isValid = false
      }

      // Interest validation
      if (!this.signupForm.interest) {
        this.errors.interest = 'Please select an interest'
        isValid = false
      }

      // Terms validation
      if (!this.signupForm.agreeTerms) {
        this.errors.agreeTerms = 'You must agree to the terms and conditions'
        isValid = false
      }

      if (isValid) {
        alert('Account created successfully!')
        // Reset form
        Object.keys(this.signupForm).forEach(key => {
          if (typeof this.signupForm[key] === 'string') {
            this.signupForm[key] = ''
          } else if (typeof this.signupForm[key] === 'boolean') {
            this.signupForm[key] = false
          }
        })
      }
    }
  }
}
</script>
