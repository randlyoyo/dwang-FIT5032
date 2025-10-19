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
          <div class="btn-group ms-2" role="group">
            <button @click="showExportOptions" class="btn-export">
              <i class="bi bi-download"></i> Export Data
            </button>
            <button
              type="button"
              class="btn-export dropdown-toggle dropdown-toggle-split"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <span class="visually-hidden">Toggle Dropdown</span>
            </button>
            <ul class="dropdown-menu">
              <li>
                <button class="dropdown-item" @click="exportUsers('csv')">
                  <i class="bi bi-file-earmark-spreadsheet me-2"></i>Export as CSV
                </button>
              </li>
              <li>
                <button class="dropdown-item" @click="exportUsers('json')">
                  <i class="bi bi-file-earmark-code me-2"></i>Export as JSON
                </button>
              </li>
              <li>
                <button class="dropdown-item" @click="exportUsers('pdf')">
                  <i class="bi bi-file-earmark-pdf me-2"></i>Export as PDF
                </button>
              </li>
            </ul>
          </div>
        </div>

        <table border="1">
          <thead>
            <tr>
              <th @click="sortBy('name')" class="sortable">Name {{ getSortArrow('name') }}</th>
              <th @click="sortBy('email')" class="sortable">Email {{ getSortArrow('email') }}</th>
              <th @click="sortBy('role')" class="sortable">Role {{ getSortArrow('role') }}</th>
              <th @click="sortBy('joinDate')" class="sortable">
                Registration Date {{ getSortArrow('joinDate') }}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in paginatedUsers" :key="user.uid">
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span class="badge" :class="user.role === 'admin' ? 'bg-danger' : 'bg-primary'">
                  {{ user.role }}
                </span>
              </td>
              <td>{{ formatDate(user.joinDate) }}</td>
              <td>
                <button class="btn btn-sm btn-danger" @click="deleteUser(user.uid, user.email)">
                  <i class="bi bi-trash"></i> Delete
                </button>
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

    <!-- Add User Modal -->
    <div v-if="showAddUserModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Add New User</h3>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitAddUser">
            <div class="form-group">
              <label for="newUserEmail">Email Address *</label>
              <input
                type="email"
                id="newUserEmail"
                v-model="newUser.email"
                class="form-control"
                required
              />
            </div>

            <div class="form-group">
              <label for="newUserPassword">Password *</label>
              <input
                type="password"
                id="newUserPassword"
                v-model="newUser.password"
                class="form-control"
                required
                minlength="8"
              />
              <small class="form-text"
                >Minimum 8 characters, include uppercase, lowercase, number and special
                character</small
              >
            </div>

            <div class="form-group">
              <label for="newUserName">Full Name *</label>
              <input
                type="text"
                id="newUserName"
                v-model="newUser.displayName"
                class="form-control"
                required
              />
            </div>

            <div class="form-group">
              <label for="newUserRole">Role *</label>
              <select id="newUserRole" v-model="newUser.role" class="form-control" required>
                <option value="">Select Role</option>
                <option value="user">Regular User</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
              <button type="submit" class="btn btn-success" :disabled="isSubmitting">
                <span v-if="isSubmitting">Creating...</span>
                <span v-else>Create User</span>
              </button>
            </div>
          </form>
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
import firebaseAuthService from '../services/firebaseAuth.js'
import * as cloudFunctions from '../services/cloudFunctions.js'

const db = getFirestore(app)

// User data from Firestore
const users = ref([])
const loading = ref(true)
const error = ref(null)

// Add user modal state
const showAddUserModal = ref(false)
const isSubmitting = ref(false)
const newUser = ref({
  email: '',
  password: '',
  displayName: '',
  role: '',
})

// Fetch users from Firestore
const fetchUsers = async () => {
  try {
    loading.value = true
    error.value = null
    const querySnapshot = await getDocs(collection(db, 'users'))
    users.value = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        uid: doc.id,
        name: data.displayName || data.fullName || data.name || 'Unknown User',
        email: data.email || '',
        role: data.role || 'user',
        joinDate: data.registrationDate || data.createdAt || new Date().toISOString(),
        lastLogin: data.lastLogin || 'N/A',
        isActive: data.isActive !== undefined ? data.isActive : true,
        emailVerified: data.emailVerified !== undefined ? data.emailVerified : false,
        photoURL: data.photoURL || 'N/A',
        displayName: data.displayName || 'N/A',
        fullName: data.fullName || 'N/A',
      }
    })
    console.log('Fetched users from Firestore:', users.value)
  } catch (err) {
    console.error('Error fetching users:', err)
    error.value = 'Failed to load users. Please check your Firebase connection.'
    users.value = []
  } finally {
    loading.value = false
  }
}

// Search and filter
const searchQuery = ref('')
const sortColumn = ref('name')
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
      user.role.toLowerCase().includes(query),
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
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
}

const addUser = () => {
  showAddUserModal.value = true
}

const closeModal = () => {
  showAddUserModal.value = false
  newUser.value = {
    email: '',
    password: '',
    displayName: '',
    role: '',
  }
}

const submitAddUser = async () => {
  try {
    isSubmitting.value = true

    // Use Firebase Auth to create user
    const registrationDate = new Date().toISOString()
    const result = await firebaseAuthService.signUp(
      newUser.value.email,
      newUser.value.password,
      newUser.value.displayName,
      newUser.value.role,
      registrationDate,
    )

    if (result.success) {
      alert(`User ${newUser.value.email} created successfully with role: ${newUser.value.role}`)
      closeModal()
      await fetchUsers()
    } else {
      alert('Failed to create user: ' + result.error)
    }
  } catch (error) {
    console.error('Error creating user:', error)
    alert('Failed to create user: ' + error.message)
  } finally {
    isSubmitting.value = false
  }
}

const deleteUser = async (uid, email) => {
  if (
    !confirm(
      `Are you sure you want to delete user: ${email}?\n\nNote: This will only delete the Firestore data, not the Firebase Auth account.`,
    )
  ) {
    return
  }

  try {
    await deleteDoc(doc(db, 'users', uid))
    alert('User deleted successfully from Firestore!')
    await fetchUsers()
  } catch (error) {
    console.error('Error deleting user:', error)
    alert('Failed to delete user: ' + error.message)
  }
}

// Export users data
// Show export options modal
const showExportOptions = () => {
  if (!filteredUsers.value || filteredUsers.value.length === 0) {
    alert('No users to export. Please add some users first.')
    return
  }

  // For now, default to CSV (backward compatibility)
  exportUsers('csv')
}

// Export users data with format selection
const exportUsers = (format = 'csv') => {
  try {
    // Check if there are users to export
    if (!filteredUsers.value || filteredUsers.value.length === 0) {
      alert('No users to export. Please add some users first.')
      return
    }

    console.log(
      `Starting ${format.toUpperCase()} user export with`,
      filteredUsers.value.length,
      'users',
    )

    const exportData = filteredUsers.value.map((user) => {
      // Safely handle timestamp
      const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'N/A'
        try {
          if (timestamp.seconds) {
            return new Date(timestamp.seconds * 1000).toISOString()
          } else if (timestamp.toDate) {
            return timestamp.toDate().toISOString()
          } else if (timestamp instanceof Date) {
            return timestamp.toISOString()
          } else {
            return new Date(timestamp).toISOString()
          }
        } catch (e) {
          console.warn('Error formatting timestamp:', e)
          return 'N/A'
        }
      }

      return {
        UID: user.uid || 'N/A',
        Name: user.name || 'N/A',
        Email: user.email || 'N/A',
        Role: user.role || 'N/A',
        'Registration Date': formatTimestamp(user.joinDate),
        'Last Login': formatTimestamp(user.lastLogin),
        'Is Active': user.isActive !== undefined ? user.isActive : 'N/A',
        'Email Verified': user.emailVerified !== undefined ? user.emailVerified : 'N/A',
        'Photo URL': user.photoURL || 'N/A',
        'Display Name': user.displayName || 'N/A',
        'Full Name': user.fullName || 'N/A',
      }
    })

    console.log('User export data prepared:', exportData.length, 'records')

    if (exportData.length === 0) {
      alert('No data to export.')
      return
    }

    // Export based on format
    switch (format.toLowerCase()) {
      case 'csv':
        exportUsersAsCSV(exportData)
        break
      case 'json':
        exportUsersAsJSON(exportData)
        break
      case 'pdf':
        exportUsersAsPDF(exportData)
        break
      default:
        alert('Unsupported export format: ' + format)
        return
    }

    console.log(`${format.toUpperCase()} user export completed successfully`)
    alert(`Successfully exported ${exportData.length} users as ${format.toUpperCase()}!`)
  } catch (error) {
    console.error('Export failed:', error)
    alert('Export failed: ' + error.message)
  }
}

// Export users as CSV
const exportUsersAsCSV = (data) => {
  const headers = Object.keys(data[0])
  console.log('CSV headers:', headers)

  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header] || ''
          const stringValue = String(value)
          // Handle line breaks and special characters
          const escapedValue = stringValue
            .replace(/"/g, '""')
            .replace(/\n/g, ' ')
            .replace(/\r/g, ' ')
          return `"${escapedValue}"`
        })
        .join(','),
    ),
  ].join('\n')

  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Export users as JSON
const exportUsersAsJSON = (data) => {
  const jsonContent = JSON.stringify(
    {
      exportDate: new Date().toISOString(),
      totalRecords: data.length,
      data: data,
    },
    null,
    2,
  )

  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.json`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Export users as PDF
const exportUsersAsPDF = (data) => {
  // Create a simple HTML table for PDF generation
  const headers = Object.keys(data[0])

  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Users Export</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #007bff; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #007bff; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        .export-info { margin-bottom: 20px; text-align: center; color: #666; }
      </style>
    </head>
    <body>
      <h1>Healthy Recipe Hub - Users Export</h1>
      <div class="export-info">
        <p>Export Date: ${new Date().toLocaleDateString()}</p>
        <p>Total Users: ${data.length}</p>
      </div>
      <table>
        <thead>
          <tr>
            ${headers.map((header) => `<th>${header}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data
            .map(
              (row) => `
            <tr>
              ${headers.map((header) => `<td>${row[header] || ''}</td>`).join('')}
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    </body>
    </html>
  `

  // Create a new window and print
  const printWindow = window.open('', '_blank')
  printWindow.document.write(htmlContent)
  printWindow.document.close()

  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    printWindow.print()
    printWindow.close()
  }
}

// Cloud Functions integration: Get user statistics
const userStats = ref(null)
const loadingStats = ref(false)

const getUserStats = async () => {
  try {
    loadingStats.value = true
    const result = await cloudFunctions.getUserStats()
    userStats.value = result.stats
    return result.stats
  } catch (error) {
    console.error('Error getting user stats:', error)
    return null
  } finally {
    loadingStats.value = false
  }
}

// Cloud Functions集成：更新用户角色
const updateUserRole = async (userId, newRole) => {
  try {
    const result = await cloudFunctions.updateUserRole({
      targetUserId: userId,
      newRole: newRole,
    })

    if (result.success) {
      // 更新本地用户数据
      const user = users.value.find((u) => u.uid === userId)
      if (user) {
        user.role = newRole
      }
      alert(`User role updated to ${newRole}`)
    }

    return result
  } catch (error) {
    console.error('Error updating user role:', error)
    alert('Failed to update user role: ' + error.message)
    return null
  }
}

// Cloud Functions集成：发送欢迎邮件
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const result = await cloudFunctions.sendWelcomeEmail({
      email: userEmail,
      displayName: userName,
    })

    if (result.success) {
      alert('Welcome email sent successfully!')
    }

    return result
  } catch (error) {
    console.error('Error sending welcome email:', error)
    alert('Failed to send welcome email: ' + error.message)
    return null
  }
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

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #999;
  line-height: 1;
  padding: 0;
  width: 30px;
  height: 30px;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
}

.form-text {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #666;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
  margin-top: 20px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover {
  background-color: #218838;
}

.btn-success:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.bg-primary {
  background-color: #007bff;
  color: white;
}

.bg-danger {
  background-color: #dc3545;
  color: white;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-danger:hover {
  background-color: #c82333;
}
</style>
