
<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-md-8 offset-md-2">
        <h1 class="text-center">Nutrition Education Program Registration</h1>
        <p class="text-center text-muted mb-4">Join our comprehensive nutrition education program and start your journey to better health</p>
        <form @submit.prevent="submitForm">
          <div class="row mb-3">
            <div class="col-sm-6">
              <label for="username" class="form-label">Full Name</label>
              <input
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.username }"
                id="username"
                @blur="() => validateName(true)"
                @input="() => validateName(false)"
                v-model="formData.username" />
              <div v-if="errors.username" class="invalid-feedback">{{ errors.username }}</div>
            </div>
            <div class="col-sm-6">
              <label for="password" class="form-label">Email Address</label>
              <input
                type="email"
                class="form-control"
                :class="{ 'is-invalid': errors.password }"
                id="password"
                @blur="() => validateEmail(true)"
                @input="() => validateEmail(false)"
                v-model="formData.password">
              <div v-if="errors.password" class="invalid-feedback">{{ errors.password }}</div>
            </div>
          </div>

          <div class="row mb-3">
            <div class="col-md-6">
              <div class="form-check">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="isAustralian"
                  v-model="formData.isAustralian">
                <label class="form-check-label" for="isAustralian">
                  Australian Resident
                </label>
              </div>
            </div>
            <div class="col-md-6">
              <label for="gender" class="form-label">Age Group</label>
              <select
                class="form-select"
                :class="{ 'is-invalid': errors.gender }"
                id="gender"
                v-model="formData.gender">
                <option value="">Select Age Group</option>
                <option value="18-25">18-25 years</option>
                <option value="26-35">26-35 years</option>
                <option value="36-45">36-45 years</option>
                <option value="46-55">46-55 years</option>
                <option value="56-65">56-65 years</option>
                <option value="65+">65+ years</option>
              </select>
              <div v-if="errors.gender" class="invalid-feedback">{{ errors.gender }}</div>
            </div>
          </div>

          <div class="row mb-3">
            <div class="col-md-6">
              <label for="dietaryRestrictions" class="form-label">Dietary Restrictions</label>
              <select
                class="form-select"
                id="dietaryRestrictions"
                v-model="formData.dietaryRestrictions">
                <option value="">Select Dietary Restrictions</option>
                <option value="none">No restrictions</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="gluten-free">Gluten-free</option>
                <option value="dairy-free">Dairy-free</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="col-md-6">
              <label for="fitnessLevel" class="form-label">Current Fitness Level</label>
              <select
                class="form-select"
                id="fitnessLevel"
                v-model="formData.fitnessLevel">
                <option value="">Select Fitness Level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div class="mb-3">
            <label for="reason" class="form-label">Why do you want to join our nutrition program?</label>
            <textarea
              class="form-control"
              :class="{ 'is-invalid': errors.reason }"
              id="reason"
              rows="3"
              v-model="formData.reason"
              placeholder="Tell us about your nutrition goals, health concerns, or what you hope to learn..."></textarea>
            <div v-if="errors.reason" class="invalid-feedback">{{ errors.reason }}</div>
          </div>

          <div class="text-center">
            <button type="submit" class="btn btn-success me-2">Join Program</button>
            <button type="button" class="btn btn-secondary"
              @click="clearForm">Clear Form</button>
          </div>
        </form>
      </div>
    </div>
  </div>


  
  <!-- Participants Display Section -->
  <div class="container mt-5" v-if="submittedCards.length > 0">
    <div class="row">
      <div class="col-12">
        <h2 class="text-center mb-4">Program Participants</h2>
        <div class="row">
          <div v-for="(card, index) in submittedCards" :key="index" class="col-lg-4 col-md-6 col-sm-12 mb-3">
            <div class="card h-100">
              <div class="card-header bg-success text-white">
                <h5 class="mb-0">Participant #{{ index + 1 }}</h5>
              </div>
              <ul class="list-group list-group-flush">
                <li class="list-group-item d-flex justify-content-between">
                  <strong>Name:</strong>
                  <span>{{ card.username }}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between">
                  <strong>Email:</strong>
                  <span>{{ card.password }}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between">
                  <strong>Australian Resident:</strong>
                  <span :class="card.isAustralian ? 'text-success' : 'text-danger'">
                    {{ card.isAustralian ? 'Yes' : 'No' }}
                  </span>
                </li>
                <li class="list-group-item d-flex justify-content-between">
                  <strong>Age Group:</strong>
                  <span class="text-capitalize">{{ card.gender }}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between">
                  <strong>Dietary Restrictions:</strong>
                  <span>{{ card.dietaryRestrictions || 'Not specified' }}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between">
                  <strong>Fitness Level:</strong>
                  <span>{{ card.fitnessLevel || 'Not specified' }}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between">
                  <strong>Goals:</strong>
                  <span>{{ card.reason || 'Not specified' }}</span>
                </li>
              </ul>
              <div class="card-footer">
                <button @click="removeCard(index)" class="btn btn-danger btn-sm">
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const formData = ref({
    username: '',
    password: '',
    isAustralian: false,
    reason: '',
    gender: '',
    dietaryRestrictions: '',
    fitnessLevel: ''
});

const submittedCards = ref([]);

// Load data from localStorage on component mount
onMounted(() => {
    const savedData = localStorage.getItem('nutritionParticipants');
    if (savedData) {
        submittedCards.value = JSON.parse(savedData);
    }
});

const submitForm = () => {
    // Validate all fields
    validateName(true);
    validateEmail(true);
    validateAgeGroup(true);
    validateReason(true);

    // Check if there are any errors
    if (!errors.value.username && !errors.value.password && !errors.value.gender && !errors.value.reason) {
        // Add timestamp to the submission
        const submission = {
            ...formData.value,
            timestamp: new Date().toLocaleString(),
            id: Date.now()
        };

        submittedCards.value.push(submission);

        // Save to localStorage
        localStorage.setItem('nutritionParticipants', JSON.stringify(submittedCards.value));

        clearForm();

        // Show success message
        alert('Welcome to our Nutrition Education Program! We\'ll be in touch soon.');
    }
};

const clearForm = () => {
    formData.value = {
        username: '',
        password: '',
        isAustralian: false,
        reason: '',
        gender: '',
        dietaryRestrictions: '',
        fitnessLevel: ''
    };

    // Clear all errors
    Object.keys(errors.value).forEach(key => {
        errors.value[key] = null;
    });
};

const removeCard = (index) => {
    submittedCards.value.splice(index, 1);
    localStorage.setItem('nutritionParticipants', JSON.stringify(submittedCards.value));
};

const errors = ref({
    username: null,
    password: null,
    isAustralian: null,
    gender: null,
    reason: null
});

const validateName = (blur) => {
    const username = formData.value.username.trim();
    if (username.length < 3) {
        if (blur) {
            errors.value.username = 'Full name must be at least 3 characters long.';
        } else {
            errors.value.username = null;
        }
    } else if (username.length > 50) {
        if (blur) {
            errors.value.username = 'Full name must be less than 50 characters.';
        } else {
            errors.value.username = null;
        }
    } else {
        errors.value.username = null;
    }
};

const validateEmail = (blur) => {
    const email = formData.value.password;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
        if (blur) {
            errors.value.password = 'Email address is required.';
        }
    } else if (!emailRegex.test(email)) {
        if (blur) {
            errors.value.password = 'Please enter a valid email address.';
        }
    } else {
        errors.value.password = null;
    }
};

const validateAgeGroup = (blur) => {
    if (!formData.value.gender) {
        if (blur) {
            errors.value.gender = 'Please select your age group.';
        }
    } else {
        errors.value.gender = null;
    }
};

const validateReason = (blur) => {
    const reason = formData.value.reason.trim();
    if (reason.length < 10) {
        if (blur) {
            errors.value.reason = 'Please tell us more about your nutrition goals (at least 10 characters).';
        }
    } else {
        errors.value.reason = null;
    }
};
</script>

<style scoped>
.card {
    border: 1px solid #ccc;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.card-header {
    background-color: #198754;
    color: white;
    padding: 15px;
    border-radius: 10px 10px 0 0;
}

.list-group-item {
    padding: 12px 15px;
    border: none;
    border-bottom: 1px solid #eee;
}

.list-group-item:last-child {
    border-bottom: none;
}

.card-footer {
    background-color: #f8f9fa;
    border-top: 1px solid #eee;
    padding: 10px 15px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .col-md-8.offset-md-2 {
        margin-left: 0;
        margin-right: 0;
    }

    .card {
        margin-bottom: 1rem;
    }
}

@media (max-width: 576px) {
    .container {
        padding-left: 15px;
        padding-right: 15px;
    }

    .btn {
        width: 100%;
        margin-bottom: 0.5rem;
    }

    .btn + .btn {
        margin-left: 0;
    }
}

/* Form validation styling */
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
