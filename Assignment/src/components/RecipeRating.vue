<template>
  <div class="recipe-rating-component">
    <div v-if="!hasRated" class="rating-input">
      <h6 class="mb-3">Rate this recipe:</h6>
      <div class="star-rating">
        <span
          v-for="star in 5"
          :key="star"
          class="star"
          :class="{ active: star <= currentRating, hover: star <= hoverRating }"
          @click="setRating(star)"
          @mouseenter="hoverRating = star"
          @mouseleave="hoverRating = 0"
        >
          ★
        </span>
      </div>
      <div class="mt-2">
        <textarea
          v-model="reviewText"
          class="form-control form-control-sm"
          placeholder="Write a review about this recipe (optional)"
          rows="2"
          maxlength="300"
        ></textarea>
        <small class="text-muted">{{ reviewText.length }}/300 characters</small>
      </div>
      <button
        @click="submitRating"
        class="btn btn-success btn-sm mt-2"
        :disabled="currentRating === 0"
      >
        Submit Rating
      </button>
    </div>

    <div v-else class="rating-display">
      <div class="d-flex align-items-center">
        <div class="star-rating-display me-2">
          <span
            v-for="star in 5"
            :key="star"
            class="star-display"
            :class="{ active: star <= userRating }"
          >
            ★
          </span>
        </div>
        <span class="rating-text">{{ userRating }}/5</span>
      </div>
      <p v-if="userReview" class="review-text mt-2">{{ userReview }}</p>
      <button @click="editRating" class="btn btn-outline-primary btn-sm mt-1">Edit Rating</button>
    </div>

    <!-- Overall Rating Display for this recipe -->
    <div v-if="overallRating > 0" class="overall-rating mt-3">
      <h6>Overall Rating: {{ overallRating.toFixed(1) }}/5</h6>
      <div class="star-rating-display">
        <span
          v-for="star in 5"
          :key="star"
          class="star-display"
          :class="{ active: star <= Math.round(overallRating) }"
        >
          ★
        </span>
      </div>
      <small class="text-muted">Based on {{ totalRatings }} rating(s)</small>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  recipeId: {
    type: Number,
    required: true,
  },
  recipeName: {
    type: String,
    required: true,
  },
})

const currentRating = ref(0)
const hoverRating = ref(0)
const reviewText = ref('')
const hasRated = ref(false)
const userRating = ref(0)
const userReview = ref('')
const allRatings = ref([])

const overallRating = computed(() => {
  if (allRatings.value.length === 0) return 0
  const sum = allRatings.value.reduce((acc, rating) => acc + rating.rating, 0)
  return sum / allRatings.value.length
})

const totalRatings = computed(() => allRatings.value.length)

onMounted(() => {
  loadRatings()
  checkUserRating()
})

const loadRatings = () => {
  const ratings = JSON.parse(localStorage.getItem('recipeRatings') || '{}')
  allRatings.value = ratings[props.recipeId] || []
}

const checkUserRating = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
  if (currentUser.uid) {
    const userRatingData = allRatings.value.find((rating) => rating.userId === currentUser.uid)
    if (userRatingData) {
      hasRated.value = true
      userRating.value = userRatingData.rating
      userReview.value = userRatingData.review || ''
    }
  }
}

const setRating = (rating) => {
  currentRating.value = rating
}

const submitRating = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')

  if (!currentUser.uid) {
    alert('Please login to rate recipes')
    return
  }

  const ratingData = {
    userId: currentUser.uid,
    userName: currentUser.fullName || currentUser.displayName || currentUser.email,
    recipeId: props.recipeId,
    recipeName: props.recipeName,
    rating: currentRating.value,
    review: reviewText.value.trim(),
    timestamp: new Date().toISOString(),
  }

  // Update ratings in localStorage
  const ratings = JSON.parse(localStorage.getItem('recipeRatings') || '{}')
  if (!ratings[props.recipeId]) {
    ratings[props.recipeId] = []
  }

  // Remove existing rating from this user
  ratings[props.recipeId] = ratings[props.recipeId].filter((r) => r.userId !== currentUser.uid)

  // Add new rating
  ratings[props.recipeId].push(ratingData)

  localStorage.setItem('recipeRatings', JSON.stringify(ratings))

  // Update local state
  loadRatings()
  hasRated.value = true
  userRating.value = currentRating.value
  userReview.value = reviewText.value.trim()

  alert('Rating submitted successfully!')
}

const editRating = () => {
  hasRated.value = false
  currentRating.value = userRating.value
  reviewText.value = userReview.value
}
</script>

<style scoped>
.recipe-rating-component {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.star-rating {
  display: flex;
  gap: 5px;
  margin-bottom: 10px;
}

.star {
  font-size: 20px;
  color: #ddd;
  cursor: pointer;
  transition: color 0.2s;
}

.star.active,
.star.hover {
  color: #ffc107;
}

.star-rating-display {
  display: flex;
  gap: 2px;
}

.star-display {
  font-size: 16px;
  color: #ddd;
}

.star-display.active {
  color: #ffc107;
}

.rating-text {
  font-weight: bold;
  color: #198754;
}

.review-text {
  font-style: italic;
  color: #666;
  background-color: white;
  padding: 8px;
  border-radius: 5px;
  border-left: 3px solid #198754;
  font-size: 0.9rem;
}

.overall-rating {
  padding: 10px;
  background-color: white;
  border-radius: 5px;
  border: 1px solid #ddd;
}

.overall-rating h6 {
  margin-bottom: 5px;
  color: #198754;
}
</style>
