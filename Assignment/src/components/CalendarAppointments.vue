<template>
  <div class="card shadow">
    <div class="card-header bg-primary text-white">
      <h3 class="h5 mb-0">
        <i class="bi bi-calendar-check me-2"></i>
        Calendar-based Nutritionist Appointments
      </h3>
    </div>
    <div class="card-body">
      <div class="row">
        <!-- Left: Calendar -->
        <div class="col-lg-7">
          <h5>Select Appointment Date & Time</h5>
          <div class="calendar-container mb-3">
            <!-- Month Navigation -->
            <div class="d-flex justify-content-between align-items-center mb-3">
              <button class="btn btn-outline-primary" @click="previousMonth">
                <i class="bi bi-chevron-left"></i>
              </button>
              <h5 class="mb-0">{{ currentMonthYear }}</h5>
              <button class="btn btn-outline-primary" @click="nextMonth">
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>

            <!-- Calendar Grid -->
            <div class="calendar-grid">
              <div class="calendar-header" v-for="day in weekDays" :key="day">
                {{ day }}
              </div>
              <div
                v-for="date in calendarDates"
                :key="date.dateString"
                class="calendar-day"
                :class="{
                  'other-month': !date.isCurrentMonth,
                  today: date.isToday,
                  past: date.isPast,
                  selected: selectedDate === date.dateString,
                  'has-appointments': hasAppointments(date.dateString),
                }"
                @click="selectDate(date)"
              >
                <div class="day-number">{{ date.day }}</div>
                <div v-if="hasAppointments(date.dateString)" class="appointment-indicator">
                  {{ getAppointmentCount(date.dateString) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Time Slots -->
          <div v-if="selectedDate && !isPastDate(selectedDate)">
            <h6>Available Time Slots for {{ formatDate(selectedDate) }}</h6>
            <div class="time-slots">
              <button
                v-for="slot in availableTimeSlots"
                :key="slot"
                class="btn btn-outline-primary btn-sm m-1"
                :class="{ active: selectedTime === slot }"
                :disabled="isSlotBooked(selectedDate, slot)"
                @click="selectedTime = slot"
              >
                {{ slot }}
                <span v-if="isSlotBooked(selectedDate, slot)" class="badge bg-danger ms-1">
                  Booked
                </span>
              </button>
            </div>
          </div>

          <div v-if="isPastDate(selectedDate)" class="alert alert-warning mt-3">
            <i class="bi bi-exclamation-triangle me-2"></i>
            Cannot book appointments for past dates.
          </div>
        </div>

        <!-- Right: Booking Form -->
        <div class="col-lg-5">
          <h5>Appointment Details</h5>

          <form @submit.prevent="bookAppointment">
            <div class="mb-3">
              <label class="form-label">Your Name</label>
              <input
                type="text"
                class="form-control"
                v-model="bookingForm.name"
                required
                placeholder="Enter your full name"
              />
            </div>

            <div class="mb-3">
              <label class="form-label">Email</label>
              <input
                type="email"
                class="form-control"
                v-model="bookingForm.email"
                required
                placeholder="your@email.com"
              />
            </div>

            <div class="mb-3">
              <label class="form-label">Phone</label>
              <input
                type="tel"
                class="form-control"
                v-model="bookingForm.phone"
                required
                placeholder="(123) 456-7890"
              />
            </div>

            <div class="mb-3">
              <label class="form-label">Consultation Type</label>
              <select class="form-select" v-model="bookingForm.consultationType" required>
                <option value="">Select type...</option>
                <option value="initial">Initial Consultation (60 min)</option>
                <option value="followup">Follow-up (30 min)</option>
                <option value="meal-plan">Meal Plan Review (45 min)</option>
                <option value="nutrition">Nutrition Assessment (90 min)</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">Notes (Optional)</label>
              <textarea
                class="form-control"
                v-model="bookingForm.notes"
                rows="3"
                placeholder="Any specific concerns or topics..."
              ></textarea>
            </div>

            <div class="mb-3">
              <strong>Selected Date:</strong>
              {{ selectedDate ? formatDate(selectedDate) : 'Not selected' }}
            </div>
            <div class="mb-3">
              <strong>Selected Time:</strong>
              {{ selectedTime || 'Not selected' }}
            </div>

            <button type="submit" class="btn btn-primary w-100" :disabled="!canBook || isBooking">
              <span v-if="isBooking">
                <span class="spinner-border spinner-border-sm me-2"></span>
                Booking...
              </span>
              <span v-else>
                <i class="bi bi-calendar-plus me-2"></i>
                Book Appointment
              </span>
            </button>
          </form>

          <!-- Booking Success -->
          <div v-if="bookingSuccess" class="alert alert-success mt-3">
            <i class="bi bi-check-circle me-2"></i>
            <strong>Appointment booked successfully!</strong>
            <div class="small mt-1">Confirmation email sent to {{ bookingForm.email }}</div>
          </div>
        </div>
      </div>

      <!-- Upcoming Appointments -->
      <div class="row mt-4">
        <div class="col-12">
          <h5>Your Upcoming Appointments ({{ upcomingAppointments.length }})</h5>
          <div v-if="upcomingAppointments.length === 0" class="alert alert-info">
            <i class="bi bi-info-circle me-2"></i>
            No upcoming appointments. Book one above!
          </div>
          <div v-else class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="apt in upcomingAppointments" :key="apt.id">
                  <td>{{ formatDate(apt.date) }}</td>
                  <td>{{ apt.time }}</td>
                  <td>{{ apt.name }}</td>
                  <td>
                    <span class="badge bg-info">{{ getConsultationLabel(apt.type) }}</span>
                  </td>
                  <td>
                    <span class="badge bg-success">Confirmed</span>
                  </td>
                  <td>
                    <button class="btn btn-sm btn-danger" @click="cancelAppointment(apt.id)">
                      <i class="bi bi-x-circle"></i> Cancel
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Calendar state
const currentDate = ref(new Date())
const selectedDate = ref(null)
const selectedTime = ref(null)

// Booking state
const bookingForm = ref({
  name: '',
  email: '',
  phone: '',
  consultationType: '',
  notes: '',
})

const isBooking = ref(false)
const bookingSuccess = ref(false)

// Appointments database (simulated)
const appointments = ref([])

// Constants
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const availableTimeSlots = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
]

// Computed
const currentMonthYear = computed(() => {
  const date = currentDate.value
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

const calendarDates = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const prevLastDay = new Date(year, month, 0)

  const firstDayOfWeek = firstDay.getDay()
  const lastDate = lastDay.getDate()
  const prevLastDate = prevLastDay.getDate()

  const dates = []

  // Previous month days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevLastDate - i
    const date = new Date(year, month - 1, day)
    dates.push({
      day,
      dateString: formatDateString(date),
      isCurrentMonth: false,
      isToday: false,
      isPast: date < new Date().setHours(0, 0, 0, 0),
    })
  }

  // Current month days
  for (let day = 1; day <= lastDate; day++) {
    const date = new Date(year, month, day)
    const today = new Date()
    dates.push({
      day,
      dateString: formatDateString(date),
      isCurrentMonth: true,
      isToday:
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear(),
      isPast: date < new Date().setHours(0, 0, 0, 0),
    })
  }

  // Next month days
  const remainingDays = 42 - dates.length // 6 rows * 7 days
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day)
    dates.push({
      day,
      dateString: formatDateString(date),
      isCurrentMonth: false,
      isToday: false,
      isPast: false,
    })
  }

  return dates
})

const upcomingAppointments = computed(() => {
  const now = new Date()
  return appointments.value
    .filter((apt) => {
      const aptDate = new Date(apt.date + ' ' + apt.time)
      return aptDate >= now
    })
    .sort((a, b) => {
      const dateA = new Date(a.date + ' ' + a.time)
      const dateB = new Date(b.date + ' ' + b.time)
      return dateA - dateB
    })
})

const canBook = computed(() => {
  return (
    selectedDate.value &&
    selectedTime.value &&
    bookingForm.value.name &&
    bookingForm.value.email &&
    bookingForm.value.phone &&
    bookingForm.value.consultationType &&
    !isPastDate(selectedDate.value)
  )
})

// Methods
const formatDateString = (date) => {
  return date.toISOString().split('T')[0]
}

const formatDate = (dateString) => {
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const isPastDate = (dateString) => {
  const date = new Date(dateString + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const selectDate = (date) => {
  if (!date.isPast && date.isCurrentMonth) {
    selectedDate.value = date.dateString
    selectedTime.value = null
  }
}

const hasAppointments = (dateString) => {
  return appointments.value.some((apt) => apt.date === dateString)
}

const getAppointmentCount = (dateString) => {
  return appointments.value.filter((apt) => apt.date === dateString).length
}

const isSlotBooked = (date, time) => {
  return appointments.value.some((apt) => apt.date === date && apt.time === time)
}

const getConsultationLabel = (type) => {
  const labels = {
    initial: 'Initial (60m)',
    followup: 'Follow-up (30m)',
    'meal-plan': 'Meal Plan (45m)',
    nutrition: 'Nutrition (90m)',
  }
  return labels[type] || type
}

const bookAppointment = async () => {
  if (!canBook.value) return

  isBooking.value = true
  bookingSuccess.value = false

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1500))

  const newAppointment = {
    id: Date.now(),
    date: selectedDate.value,
    time: selectedTime.value,
    name: bookingForm.value.name,
    email: bookingForm.value.email,
    phone: bookingForm.value.phone,
    type: bookingForm.value.consultationType,
    notes: bookingForm.value.notes,
    status: 'confirmed',
  }

  appointments.value.push(newAppointment)

  // Save to localStorage
  localStorage.setItem('appointments', JSON.stringify(appointments.value))

  isBooking.value = false
  bookingSuccess.value = true

  // Reset form
  setTimeout(() => {
    bookingForm.value = {
      name: '',
      email: '',
      phone: '',
      consultationType: '',
      notes: '',
    }
    selectedDate.value = null
    selectedTime.value = null
    bookingSuccess.value = false
  }, 3000)
}

const cancelAppointment = (id) => {
  if (confirm('Are you sure you want to cancel this appointment?')) {
    appointments.value = appointments.value.filter((apt) => apt.id !== id)
    localStorage.setItem('appointments', JSON.stringify(appointments.value))
  }
}

// Load appointments from localStorage
onMounted(() => {
  const saved = localStorage.getItem('appointments')
  if (saved) {
    appointments.value = JSON.parse(saved)
  }
})

console.log('✅ CalendarAppointments component loaded')
</script>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  margin-bottom: 20px;
}

.calendar-header {
  text-align: center;
  font-weight: bold;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.calendar-day {
  position: relative;
  aspect-ratio: 1;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: white;
}

.calendar-day:hover:not(.past):not(.other-month) {
  background-color: #e7f3ff;
  border-color: #0d6efd;
  transform: scale(1.05);
}

.calendar-day.other-month {
  background-color: #f8f9fa;
  color: #adb5bd;
  cursor: default;
}

.calendar-day.today {
  border: 2px solid #0d6efd;
  font-weight: bold;
}

.calendar-day.past {
  background-color: #f8f9fa;
  color: #adb5bd;
  cursor: not-allowed;
}

.calendar-day.selected {
  background-color: #0d6efd;
  color: white;
  border-color: #0d6efd;
}

.calendar-day.has-appointments {
  border-color: #28a745;
  border-width: 2px;
}

.day-number {
  font-size: 16px;
  text-align: center;
}

.appointment-indicator {
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: #28a745;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
}

.time-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

@media (max-width: 768px) {
  .calendar-day {
    padding: 4px;
  }

  .day-number {
    font-size: 14px;
  }
}
</style>



