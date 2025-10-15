<template>
  <div class="appointment-booking-page">
    <!-- Hero Section -->
    <section class="hero-section text-white text-center">
      <div class="hero-overlay">
        <div class="container">
          <div class="hero-icon mb-4">
            <i class="bi bi-calendar-check display-1"></i>
          </div>
          <h1 class="display-3 fw-bold mb-3">Appointment Booking</h1>
          <p class="lead mb-4">
            Schedule your nutrition consultations and cooking sessions with our certified experts
          </p>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="py-5">
      <div class="container">
        <div class="row justify-content-center">
          <!-- Booking Form -->
          <div class="col-lg-8">
            <div class="card">
              <div class="card-header bg-success text-white">
                <h5 class="mb-0">
                  <i class="bi bi-plus-circle me-2"></i>
                  Book Appointment
                </h5>
              </div>
              <div class="card-body">
                <form @submit.prevent="bookAppointment" v-if="!bookingSuccess">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Service Type</label>
                        <select class="form-select" v-model="bookingForm.serviceType" required>
                          <option value="">Select a service</option>
                          <option value="nutrition-consultation">Nutrition Consultation</option>
                          <option value="cooking-session">Cooking Session</option>
                          <option value="meal-planning">Meal Planning</option>
                          <option value="dietary-assessment">Dietary Assessment</option>
                        </select>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Duration (minutes)</label>
                        <select class="form-select" v-model="bookingForm.duration" required>
                          <option value="30">30 minutes</option>
                          <option value="60">60 minutes</option>
                          <option value="90">90 minutes</option>
                          <option value="120">120 minutes</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Date</label>
                        <input
                          type="date"
                          class="form-control"
                          v-model="bookingForm.date"
                          :min="minDate"
                          required
                        />
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Time</label>
                        <select class="form-select" v-model="bookingForm.time" required>
                          <option value="">Select time</option>
                          <option value="09:00">9:00 AM</option>
                          <option value="09:30">9:30 AM</option>
                          <option value="10:00">10:00 AM</option>
                          <option value="10:30">10:30 AM</option>
                          <option value="11:00">11:00 AM</option>
                          <option value="11:30">11:30 AM</option>
                          <option value="12:00">12:00 PM</option>
                          <option value="12:30">12:30 PM</option>
                          <option value="13:00">1:00 PM</option>
                          <option value="13:30">1:30 PM</option>
                          <option value="14:00">2:00 PM</option>
                          <option value="14:30">2:30 PM</option>
                          <option value="15:00">3:00 PM</option>
                          <option value="15:30">3:30 PM</option>
                          <option value="16:00">4:00 PM</option>
                          <option value="16:30">4:30 PM</option>
                          <option value="17:00">5:00 PM</option>
                          <option value="17:30">5:30 PM</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Notes (Optional)</label>
                    <textarea
                      class="form-control"
                      rows="3"
                      v-model="bookingForm.notes"
                      placeholder="Any specific requirements or questions..."
                    ></textarea>
                  </div>

                  <div class="d-grid">
                    <button
                      type="submit"
                      class="btn btn-success"
                      :disabled="isBooking || !isValidBooking"
                    >
                      <span v-if="isBooking" class="spinner-border spinner-border-sm me-2"></span>
                      Book Appointment
                    </button>
                  </div>
                </form>

                <!-- Success Message -->
                <div v-if="bookingSuccess" class="text-center">
                  <div class="alert alert-success">
                    <i class="bi bi-check-circle-fill me-2"></i>
                    <strong>Appointment Booked Successfully!</strong>
                  </div>
                  <p class="text-muted">You will receive a confirmation email shortly.</p>
                  <button class="btn btn-outline-primary" @click="resetForm">
                    Book Another Appointment
                  </button>
                </div>
              </div>
            </div>

            <!-- Conflict Warning -->
            <div v-if="conflictWarning" class="card mt-3 border-warning">
              <div class="card-body">
                <div class="d-flex align-items-center">
                  <i class="bi bi-exclamation-triangle-fill text-warning me-2"></i>
                  <div>
                    <h6 class="mb-1">Scheduling Conflict Detected</h6>
                    <small class="text-muted">
                      The selected time conflicts with an existing appointment. Please choose a
                      different time.
                    </small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Booking Guidelines -->
            <div class="card mt-3">
              <div class="card-header">
                <h6 class="mb-0">
                  <i class="bi bi-info-circle me-2"></i>
                  Booking Guidelines
                </h6>
              </div>
              <div class="card-body">
                <ul class="list-unstyled mb-0">
                  <li class="mb-2">
                    <i class="bi bi-clock text-primary me-2"></i>
                    <small>Bookings available 9 AM - 6 PM</small>
                  </li>
                  <li class="mb-2">
                    <i class="bi bi-calendar-x text-primary me-2"></i>
                    <small>No bookings on weekends</small>
                  </li>
                  <li class="mb-2">
                    <i class="bi bi-hourglass text-primary me-2"></i>
                    <small>Minimum 24 hours advance notice</small>
                  </li>
                  <li>
                    <i class="bi bi-people text-primary me-2"></i>
                    <small>One appointment per person per day</small>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../config/firebase.js'

// State
const appointments = ref([])
const isBooking = ref(false)
const bookingSuccess = ref(false)
const conflictWarning = ref(false)

// Booking form
const bookingForm = ref({
  serviceType: '',
  duration: 60,
  date: '',
  time: '',
  notes: '',
})

// Computed properties
const isValidBooking = computed(() => {
  return bookingForm.value.serviceType && bookingForm.value.date && bookingForm.value.time
})

const minDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})

// Methods
const fetchAppointments = async () => {
  try {
    const q = query(collection(db, 'appointments'), orderBy('start', 'asc'))
    const querySnapshot = await getDocs(q)

    appointments.value = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        start: data.start.toDate(),
        end: data.end.toDate(),
      }
    })
  } catch (error) {
    console.error('Error fetching appointments:', error)
  }
}

const checkConflict = (startTime, endTime) => {
  const start = new Date(startTime)
  const end = new Date(endTime)

  return appointments.value.some((appointment) => {
    const appStart = new Date(appointment.start)
    const appEnd = new Date(appointment.end)

    return start < appEnd && end > appStart
  })
}

const bookAppointment = async () => {
  if (!isValidBooking.value) return

  const startTime = new Date(`${bookingForm.value.date}T${bookingForm.value.time}`)
  const endTime = new Date(startTime.getTime() + bookingForm.value.duration * 60000)

  // Check for conflicts
  if (checkConflict(startTime, endTime)) {
    conflictWarning.value = true
    setTimeout(() => {
      conflictWarning.value = false
    }, 5000)
    return
  }

  isBooking.value = true

  try {
    const appointmentData = {
      serviceType: bookingForm.value.serviceType,
      start: startTime,
      end: endTime,
      duration: bookingForm.value.duration,
      notes: bookingForm.value.notes,
      status: 'confirmed',
      createdAt: new Date(),
    }

    await addDoc(collection(db, 'appointments'), appointmentData)

    bookingSuccess.value = true
    await fetchAppointments()
  } catch (error) {
    console.error('Error booking appointment:', error)
    alert('Failed to book appointment. Please try again.')
  } finally {
    isBooking.value = false
  }
}

const resetForm = () => {
  bookingForm.value = {
    serviceType: '',
    duration: 60,
    date: '',
    time: '',
    notes: '',
  }
  bookingSuccess.value = false
  conflictWarning.value = false
}

onMounted(async () => {
  await fetchAppointments()
})
</script>

<style scoped>
.hero-section {
  background:
    linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
    linear-gradient(135deg, #007bff 0%, #6f42c1 100%);
  min-height: 400px;
  display: flex;
  align-items: center;
  position: relative;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
}

.hero-icon {
  opacity: 0.9;
}

.card {
  border: none;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.card-header {
  border-bottom: none;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 2rem;
  }

  .hero-section .lead {
    font-size: 1rem;
  }
}
</style>
