<template>
  <div class="container mt-5">
    <div class="user-management">
      <h2>User Management</h2>

      <!-- Loading State -->
      <div v-if="loading" class="text-center my-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading users from Firestore...</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="alert alert-warning">
        <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
      </div>

      <div class="table-controls" v-if="!loading">
        <div class="search-bar">
          <label>Search: </label>
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            v-model="searchQuery"
          />
          <button @click="addUser">Add User</button>
          <button @click="fetchUsers" class="ms-2">
            <i class="bi bi-arrow-clockwise"></i> Refresh
          </button>
          <button @click="exportUsers" class="ms-2 btn-export">
            <i class="bi bi-download"></i> Export Data
          </button>
        </div>

        <table border="1">
          <thead>
            <tr>
              <th @click="sortBy('id')" class="sortable">ID {{ getSortArrow('id') }}</th>
              <th @click="sortBy('name')" class="sortable">Name {{ getSortArrow('name') }}</th>
              <th @click="sortBy('email')" class="sortable">Email {{ getSortArrow('email') }}</th>
              <th @click="sortBy('role')" class="sortable">Role {{ getSortArrow('role') }}</th>
              <th @click="sortBy('status')" class="sortable">
                Status {{ getSortArrow('status') }}
              </th>
              <th @click="sortBy('joinDate')" class="sortable">
                Join Date {{ getSortArrow('joinDate') }}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in paginatedUsers" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.role }}</td>
              <td>{{ user.status }}</td>
              <td>{{ formatDate(user.joinDate) }}</td>
              <td>
                <button @click="editUser(user)">Edit</button>
                <button @click="deleteUser(user.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="pagination-info">
          <p>
            Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredUsers.length }} entries
            <span v-if="searchQuery">(filtered from {{ users.length }} total entries)</span>
          </p>
          <div class="pagination">
            <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
              Previous
            </button>
            <button
              v-for="page in totalPages"
              :key="page"
              @click="changePage(page)"
              :class="{ active: currentPage === page }"
            >
              {{ page }}
            </button>
            <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore'
import { app } from '../config/firebase.js'

const db = getFirestore(app)

// User data from Firestore
const users = ref([])
const loading = ref(true)
const error = ref(null)

// Fetch users from Firestore
const fetchUsers = async () => {
  try {
    loading.value = true
    error.value = null
    const querySnapshot = await getDocs(collection(db, 'users'))
    users.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().fullName || doc.data().name || 'Unknown',
      email: doc.data().email || '',
      role: doc.data().role || 'user',
      status: doc.data().status || 'active',
      joinDate: doc.data().createdAt || doc.data().joinDate || new Date().toISOString(),
      ...doc.data(),
    }))
    console.log('Fetched users from Firestore:', users.value.length)
  } catch (err) {
    console.error('Error fetching users:', err)
    error.value = 'Failed to load users. Please check your Firebase connection.'
    // Fallback to mock data if Firestore fails
    users.value = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
        status: 'inactive',
        joinDate: '2024-03-10',
      },
      {
        id: 4,
        name: 'Alice Brown',
        email: 'alice@example.com',
        role: 'admin',
        status: 'active',
        joinDate: '2024-01-25',
      },
      {
        id: 5,
        name: 'Charlie Wilson',
        email: 'charlie@example.com',
        role: 'user',
        status: 'active',
        joinDate: '2024-04-05',
      },
      {
        id: 6,
        name: 'Diana Martinez',
        email: 'diana@example.com',
        role: 'user',
        status: 'inactive',
        joinDate: '2024-02-15',
      },
      {
        id: 7,
        name: 'Edward Taylor',
        email: 'edward@example.com',
        role: 'admin',
        status: 'active',
        joinDate: '2024-03-20',
      },
      {
        id: 8,
        name: 'Fiona Anderson',
        email: 'fiona@example.com',
        role: 'user',
        status: 'active',
        joinDate: '2024-04-10',
      },
      {
        id: 9,
        name: 'George Thomas',
        email: 'george@example.com',
        role: 'user',
        status: 'inactive',
        joinDate: '2024-01-30',
      },
      {
        id: 10,
        name: 'Hannah Jackson',
        email: 'hannah@example.com',
        role: 'user',
        status: 'active',
        joinDate: '2024-02-25',
      },
      {
        id: 11,
        name: 'Ian White',
        email: 'ian@example.com',
        role: 'admin',
        status: 'active',
        joinDate: '2024-03-15',
      },
      {
        id: 12,
        name: 'Julia Harris',
        email: 'julia@example.com',
        role: 'user',
        status: 'active',
        status: 'active',
        joinDate: '2024-04-01',
      },
    ]
  } finally {
    loading.value = false
  }
}

// Search and filter
const searchQuery = ref('')
const sortColumn = ref('id')
const sortDirection = ref('asc')
const currentPage = ref(1)
const itemsPerPage = 10

// Filtered users based on search query
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value

  const query = searchQuery.value.toLowerCase()
  return users.value.filter(
    (user) =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query) ||
      user.status.toLowerCase().includes(query),
  )
})

// Sorted users
const sortedUsers = computed(() => {
  return [...filteredUsers.value].sort((a, b) => {
    let aVal = a[sortColumn.value]
    let bVal = b[sortColumn.value]

    // Convert to string for comparison
    aVal = String(aVal).toLowerCase()
    bVal = String(bVal).toLowerCase()

    if (sortDirection.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })
})

// Pagination
const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / itemsPerPage)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * itemsPerPage
})

const endIndex = computed(() => {
  const end = currentPage.value * itemsPerPage
  return end > filteredUsers.value.length ? filteredUsers.value.length : end
})

const paginatedUsers = computed(() => {
  return sortedUsers.value.slice(startIndex.value, endIndex.value)
})

// Methods
const sortBy = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
}

const getSortArrow = (column) => {
  if (sortColumn.value !== column) return '⇅'
  return sortDirection.value === 'asc' ? '↑' : '↓'
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const addUser = () => {
  alert('Add User functionality - To be implemented')
}

const editUser = (user) => {
  alert(`Edit User: ${user.name}`)
}

const deleteUser = (id) => {
  if (confirm('Are you sure you want to delete this user?')) {
    const index = users.value.findIndex((u) => u.id === id)
    if (index > -1) {
      users.value.splice(index, 1)
    }
  }
}

// Export users data
const exportUsers = () => {
  const exportData = filteredUsers.value.map((user) => ({
    ID: user.id,
    Name: user.name,
    Email: user.email,
    Role: user.role,
    Status: user.status,
    'Join Date': user.joinDate,
  }))

  // Convert to CSV
  const headers = Object.keys(exportData[0])
  const csvContent = [
    headers.join(','),
    ...exportData.map((row) => headers.map((header) => `"${row[header]}"`).join(',')),
  ].join('\n')

  // Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Initialize: fetch users from Firestore
onMounted(() => {
  fetchUsers()
})

// Reset to first page when search changes
import { watch } from 'vue'
watch(searchQuery, () => {
  currentPage.value = 1
})
</script>

<style scoped>
.user-management {
  margin: 20px 0;
}

h2 {
  margin-bottom: 20px;
}

.search-bar {
  margin-bottom: 15px;
}

.search-bar label {
  margin-right: 10px;
}

.search-bar input {
  padding: 5px;
  margin-right: 10px;
  width: 300px;
}

.search-bar button {
  padding: 5px 15px;
}

.btn-export {
  background-color: #28a745;
  color: white;
  border: none;
}

.btn-export:hover {
  background-color: #218838;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

th,
td {
  padding: 10px;
  text-align: left;
}

th {
  background-color: #f0f0f0;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  background-color: #e0e0e0;
}

tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

tbody tr:hover {
  background-color: #f0f0f0;
}

td button {
  margin-right: 5px;
  padding: 3px 8px;
}

.pagination-info {
  margin-top: 15px;
}

.pagination {
  margin-top: 10px;
}

.pagination button {
  margin-right: 5px;
  padding: 5px 10px;
}

.pagination button.active {
  font-weight: bold;
  background-color: #007bff;
  color: white;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
