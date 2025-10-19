<template>
  <div class="container-fluid py-4">
    <div class="row">
      <!-- Left Sidebar - Quick Actions -->
      <div class="col-md-2">
        <div class="d-grid gap-2">
          <button class="btn btn-primary btn-lg mb-3" @click="openCompose">
            <i class="bi bi-pencil-square me-2"></i>
            Compose
          </button>

          <div class="list-group">
            <a
              href="#"
              class="list-group-item list-group-item-action"
              :class="{ active: currentView === 'inbox' }"
              @click.prevent="currentView = 'inbox'"
            >
              <i class="bi bi-inbox me-2"></i>Inbox
            </a>
            <a
              href="#"
              class="list-group-item list-group-item-action"
              :class="{ active: currentView === 'sent' }"
              @click.prevent="currentView = 'sent'"
            >
              <i class="bi bi-send me-2"></i>Sent ({{ sendingStats.totalRequests }})
            </a>
            <a
              href="#"
              class="list-group-item list-group-item-action"
              :class="{ active: currentView === 'drafts' }"
              @click.prevent="currentView = 'drafts'"
            >
              <i class="bi bi-folder me-2"></i>Drafts ({{ drafts.length }})
            </a>
          </div>

          <!-- Statistics -->
          <div class="card mt-3">
            <div class="card-body p-2">
              <p class="small mb-1">
                <strong>Rate Limit:</strong>
              </p>
              <p class="small mb-0">{{ sendingStats.maxRequestsPerMinute }}/min</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Email Compose Area -->
      <div class="col-md-10">
        <!-- Compose Card -->
        <div v-if="isComposing" class="card shadow">
          <div class="card-header bg-light d-flex justify-content-between align-items-center">
            <h5 class="mb-0">New Message</h5>
            <button class="btn btn-sm btn-outline-secondary" @click="closeCompose">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleSubmit">
              <!-- Recipients -->
              <div class="mb-3">
                <label class="form-label">
                  <i class="bi bi-envelope me-2"></i>
                  To:
                  <small class="text-muted"> (Enter one or more email addresses) </small>
                </label>
                <div class="input-group mb-2">
                  <input
                    type="email"
                    class="form-control"
                    v-model="newRecipient"
                    placeholder="recipient@example.com"
                    @keypress.enter.prevent="addRecipient"
                  />
                  <button
                    type="button"
                    class="btn btn-outline-primary"
                    @click="addRecipient"
                    :disabled="!newRecipient.trim()"
                  >
                    <i class="bi bi-plus-lg"></i> Add
                  </button>
                </div>

                <!-- Recipients List -->
                <div v-if="recipients.length > 0" class="d-flex flex-wrap gap-2 mb-2">
                  <span
                    v-for="(email, index) in recipients"
                    :key="index"
                    class="badge bg-primary d-flex align-items-center"
                    style="font-size: 0.9rem; padding: 0.5rem 0.75rem"
                  >
                    {{ email }}
                    <i
                      class="bi bi-x-circle ms-2"
                      style="cursor: pointer"
                      @click="removeRecipient(index)"
                      title="Remove recipient"
                    ></i>
                  </span>
                </div>

                <!-- Recipients Count -->
                <div v-if="recipients.length > 0" class="text-muted small">
                  <i class="bi bi-people me-1"></i>
                  {{ recipients.length }} recipient{{ recipients.length > 1 ? 's' : '' }}
                </div>
                <div v-else class="text-muted small">
                  <i class="bi bi-info-circle me-1"></i>
                  No recipients added yet
                </div>
              </div>

              <!-- Common Fields -->
              <div class="mb-3">
                <label for="fromName" class="form-label">From:</label>
                <input
                  type="text"
                  class="form-control"
                  id="fromName"
                  v-model="formData.fromName"
                  placeholder="Your Name"
                  required
                />
              </div>

              <div class="mb-3">
                <label for="subject" class="form-label">Subject:</label>
                <input
                  type="text"
                  class="form-control"
                  id="subject"
                  v-model="formData.subject"
                  placeholder="Email subject"
                  required
                />
              </div>

              <div class="mb-3">
                <label for="message" class="form-label">Message:</label>
                <textarea
                  class="form-control"
                  id="message"
                  rows="8"
                  v-model="formData.message"
                  placeholder="Write your email message here..."
                  required
                ></textarea>
              </div>

              <!-- Attachments -->
              <div class="mb-3">
                <label class="form-label">
                  <i class="bi bi-paperclip me-2"></i>
                  Attachments (Optional)
                  <small class="text-muted d-block mt-1">
                    Max 500KB per file, max 3 files. Supported: images, PDF, DOC, TXT
                  </small>
                </label>
                <input
                  type="file"
                  class="form-control"
                  @change="handleFileSelect"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  ref="fileInput"
                />

                <!-- Selected Files List -->
                <div v-if="attachments.length > 0" class="mt-3">
                  <div
                    v-for="(file, index) in attachments"
                    :key="index"
                    class="d-flex align-items-center justify-content-between p-2 mb-2 border rounded bg-light"
                  >
                    <div class="d-flex align-items-center flex-grow-1">
                      <i class="me-2 fs-4" :class="getFileIconClass(file.type)"></i>
                      <div class="flex-grow-1">
                        <div class="small fw-bold text-truncate" style="max-width: 300px">
                          {{ file.name }}
                        </div>
                        <div class="text-muted" style="font-size: 0.75rem">
                          {{ formatFileSize(file.size) }}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-danger"
                      @click="removeAttachment(index)"
                      title="Remove attachment"
                    >
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </div>

                  <!-- Total Size Warning -->
                  <div v-if="totalAttachmentSize > 500000" class="alert alert-warning py-2 mb-0">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    <small>
                      Total size ({{ formatFileSize(totalAttachmentSize) }}) exceeds 500KB limit.
                      Please remove some files.
                    </small>
                  </div>
                  <div v-else class="text-muted small">
                    Total: {{ formatFileSize(totalAttachmentSize) }} / 500KB
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary flex-grow-1" :disabled="isLoading">
                  <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-send me-2"></i>
                  {{ getSendButtonText() }}
                </button>
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="saveDraft"
                  :disabled="isLoading"
                >
                  <i class="bi bi-save me-2"></i>
                  Save Draft
                </button>
              </div>
            </form>

            <!-- Status Messages -->
            <div v-if="message" class="alert mt-3" :class="messageType">
              {{ message }}
            </div>
          </div>
        </div>

        <!-- Drafts View -->
        <div v-else-if="currentView === 'drafts'" class="card shadow">
          <div class="card-header bg-light d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="bi bi-folder me-2"></i>
              Drafts ({{ drafts.length }})
            </h5>
            <button
              v-if="drafts.length > 0"
              class="btn btn-sm btn-outline-danger"
              @click="clearAllDrafts"
            >
              <i class="bi bi-trash me-2"></i>
              Clear All
            </button>
          </div>
          <div class="card-body">
            <div v-if="drafts.length === 0" class="text-center text-muted py-5">
              <i class="bi bi-folder2-open display-4 mb-3"></i>
              <p>No drafts saved yet</p>
              <button class="btn btn-primary mt-3" @click="openCompose">
                <i class="bi bi-pencil-square me-2"></i>
                Start Composing
              </button>
            </div>
            <div v-else class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Saved On</th>
                    <th>Subject</th>
                    <th>Recipients</th>
                    <th>Has Attachments</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="draft in drafts" :key="draft.id">
                    <td>{{ formatDate(draft.savedAt) }}</td>
                    <td>
                      <strong v-if="draft.subject">{{ draft.subject }}</strong>
                      <span v-else class="text-muted">(No Subject)</span>
                    </td>
                    <td>
                      <span v-if="draft.recipients.length > 0" class="badge bg-secondary">
                        {{ draft.recipients.length }}
                      </span>
                      <span v-else class="text-muted">None</span>
                    </td>
                    <td>
                      <i
                        v-if="draft.attachments && draft.attachments.length > 0"
                        class="bi bi-paperclip text-primary"
                      ></i>
                      <span v-else class="text-muted">-</span>
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button
                          class="btn btn-outline-primary"
                          @click="loadDraft(draft)"
                          title="Continue editing"
                        >
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button
                          class="btn btn-outline-danger"
                          @click="deleteDraft(draft.id)"
                          title="Delete draft"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Sent View -->
        <div v-else-if="currentView === 'sent'" class="card shadow">
          <div class="card-header bg-light d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="bi bi-send me-2"></i>
              Sent Emails ({{ campaignHistory.length }})
            </h5>
            <button
              v-if="campaignHistory.length > 0"
              class="btn btn-sm btn-outline-danger"
              @click="clearHistory"
            >
              <i class="bi bi-trash me-2"></i>
              Clear History
            </button>
          </div>
          <div class="card-body">
            <div v-if="campaignHistory.length === 0" class="text-center text-muted py-5">
              <i class="bi bi-inbox display-4 mb-3"></i>
              <p>No emails sent yet</p>
            </div>
            <div v-else>
              <!-- Email Cards View -->
              <div class="row g-3">
                <div v-for="item in campaignHistory" :key="item.id" class="col-md-12">
                  <div class="card email-card" :class="getStatusClass(item.status)">
                    <div class="card-body">
                      <div class="row align-items-center">
                        <!-- Left: Email Info -->
                        <div class="col-md-7">
                          <div class="d-flex align-items-start mb-2">
                            <div class="flex-grow-1">
                              <h6 class="mb-1">
                                <strong>{{ item.subject }}</strong>
                                <i
                                  v-if="item.hasAttachments"
                                  class="bi bi-paperclip ms-2 text-muted"
                                  :title="`${item.attachmentsCount} attachment(s)`"
                                ></i>
                              </h6>
                              <small class="text-muted">
                                <i class="bi bi-person me-1"></i>
                                From: {{ item.fromName }}
                              </small>
                            </div>
                            <span :class="getStatusBadgeClass(item.status)">
                              {{ getStatusText(item.status) }}
                            </span>
                          </div>

                          <div class="email-preview text-muted small mb-2">
                            {{ truncateMessage(item.message) }}
                          </div>

                          <div class="d-flex gap-2 flex-wrap">
                            <span class="badge bg-secondary">
                              <i class="bi bi-people me-1"></i>
                              {{ item.recipientCount }} recipient(s)
                            </span>
                            <span class="badge bg-info">
                              {{ item.type }}
                            </span>
                            <span v-if="item.successCount" class="badge bg-success">
                              <i class="bi bi-check-circle me-1"></i>
                              {{ item.successCount }} sent
                            </span>
                            <span v-if="item.failedCount" class="badge bg-danger">
                              <i class="bi bi-x-circle me-1"></i>
                              {{ item.failedCount }} failed
                            </span>
                          </div>
                        </div>

                        <!-- Right: Actions & Time -->
                        <div class="col-md-5 text-end">
                          <div class="mb-2">
                            <small class="text-muted">
                              <i class="bi bi-clock me-1"></i>
                              {{ formatDate(item.date) }}
                            </small>
                          </div>

                          <!-- Recipients List (Collapsed) -->
                          <div class="btn-group btn-group-sm mb-2" role="group">
                            <button
                              class="btn btn-outline-primary"
                              @click="viewEmailDetails(item)"
                              title="View details"
                            >
                              <i class="bi bi-eye"></i>
                              View
                            </button>
                            <button
                              class="btn btn-outline-secondary"
                              @click="resendEmail(item)"
                              title="Resend to same recipients"
                            >
                              <i class="bi bi-arrow-repeat"></i>
                              Resend
                            </button>
                            <button
                              class="btn btn-outline-danger"
                              @click="deleteHistoryItem(item.id)"
                              title="Delete from history"
                            >
                              <i class="bi bi-trash"></i>
                            </button>
                          </div>

                          <!-- Recipients Preview -->
                          <div class="text-muted small">
                            <strong>To:</strong>
                            <div class="recipients-preview">
                              <span v-if="item.recipientsList && item.recipientsList.length > 0">
                                <span
                                  v-for="(email, idx) in item.recipientsList.slice(0, 2)"
                                  :key="idx"
                                >
                                  {{ email
                                  }}<span v-if="idx < 1 && item.recipientsList.length > 1">, </span>
                                </span>
                                <span v-if="item.recipientsList.length > 2" class="text-primary">
                                  +{{ item.recipientsList.length - 2 }} more
                                </span>
                              </span>
                              <span v-else class="text-muted">
                                {{ item.recipientCount || 0 }} recipient(s)
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Email Details Modal -->
        <div
          v-if="selectedEmail"
          class="modal d-block"
          tabindex="-1"
          style="background: rgba(0, 0, 0, 0.5)"
          @click.self="selectedEmail = null"
        >
          <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">
                  <i class="bi bi-envelope-open me-2"></i>
                  Email Details
                </h5>
                <button type="button" class="btn-close" @click="selectedEmail = null"></button>
              </div>
              <div class="modal-body">
                <!-- Email Header -->
                <div class="mb-3 pb-3 border-bottom">
                  <h6 class="mb-2">
                    <strong>{{ selectedEmail.subject }}</strong>
                  </h6>
                  <div class="row">
                    <div class="col-md-6">
                      <small class="text-muted d-block">
                        <i class="bi bi-person me-1"></i>
                        <strong>From:</strong> {{ selectedEmail.fromName }}
                      </small>
                      <small class="text-muted d-block">
                        <i class="bi bi-clock me-1"></i>
                        <strong>Sent:</strong> {{ formatDate(selectedEmail.date) }}
                      </small>
                    </div>
                    <div class="col-md-6 text-end">
                      <span :class="getStatusBadgeClass(selectedEmail.status)">
                        {{ getStatusText(selectedEmail.status) }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Recipients -->
                <div class="mb-3 pb-3 border-bottom">
                  <h6 class="mb-2">
                    <i class="bi bi-people me-2"></i>
                    Recipients ({{ selectedEmail.recipientCount }})
                  </h6>
                  <div
                    v-if="selectedEmail.recipientsList && selectedEmail.recipientsList.length > 0"
                    class="d-flex flex-wrap gap-2"
                  >
                    <span
                      v-for="(email, idx) in selectedEmail.recipientsList"
                      :key="idx"
                      class="badge bg-light text-dark"
                    >
                      {{ email }}
                    </span>
                  </div>
                  <div v-else class="alert alert-info">
                    <i class="bi bi-info-circle me-2"></i>
                    Recipient details not available for this email (sent before update)
                  </div>
                  <div class="mt-2" v-if="selectedEmail.successCount || selectedEmail.failedCount">
                    <span v-if="selectedEmail.successCount" class="badge bg-success me-2">
                      <i class="bi bi-check-circle me-1"></i>
                      {{ selectedEmail.successCount }} successful
                    </span>
                    <span v-if="selectedEmail.failedCount" class="badge bg-danger">
                      <i class="bi bi-x-circle me-1"></i>
                      {{ selectedEmail.failedCount }} failed
                    </span>
                  </div>
                </div>

                <!-- Message Content -->
                <div class="mb-3">
                  <h6 class="mb-2">
                    <i class="bi bi-file-text me-2"></i>
                    Message
                  </h6>
                  <div class="p-3 bg-light rounded" style="white-space: pre-wrap">
                    {{ selectedEmail.message }}
                  </div>
                </div>

                <!-- Attachments Info -->
                <div v-if="selectedEmail.hasAttachments" class="mb-3">
                  <h6 class="mb-2">
                    <i class="bi bi-paperclip me-2"></i>
                    Attachments
                  </h6>
                  <div class="alert alert-info mb-0">
                    <i class="bi bi-info-circle me-2"></i>
                    This email included {{ selectedEmail.attachmentsCount }} attachment(s)
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="selectedEmail = null">
                  Close
                </button>
                <button
                  type="button"
                  class="btn btn-primary"
                  @click="resendEmailAndClose(selectedEmail)"
                >
                  <i class="bi bi-arrow-repeat me-2"></i>
                  Resend
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Welcome/Dashboard View -->
        <div v-else class="card shadow">
          <div class="card-body text-center py-5">
            <i class="bi bi-envelope-paper display-1 text-muted mb-3"></i>
            <h3>Welcome to Email Management</h3>
            <p class="text-muted">Click "Compose" to send an email</p>
            <button class="btn btn-primary btn-lg" @click="openCompose">
              <i class="bi bi-pencil-square me-2"></i>
              Compose New Email
            </button>

            <!-- Quick Stats -->
            <div class="row mt-5">
              <div class="col-md-3">
                <div class="card">
                  <div class="card-body">
                    <h5 class="card-title text-primary">{{ sendingStats.totalRequests }}</h5>
                    <p class="card-text small">Emails Sent</p>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card">
                  <div class="card-body">
                    <h5 class="card-title text-warning">{{ drafts.length }}</h5>
                    <p class="card-text small">Drafts</p>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card">
                  <div class="card-body">
                    <h5 class="card-title text-success">{{ campaignHistory.length }}</h5>
                    <p class="card-text small">Sent History</p>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card">
                  <div class="card-body">
                    <h5 class="card-title text-info">{{ sendingStats.maxRequestsPerMinute }}</h5>
                    <p class="card-text small">Max/Minute</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import emailService from '../services/emailService.js'

// UI State
const isComposing = ref(false)
const isLoading = ref(false)
const message = ref('')
const messageType = ref('alert-info')
const currentView = ref('inbox') // inbox, sent, drafts

// Recipients
const newRecipient = ref('')
const recipients = ref([])

// Attachments
const attachments = ref([])
const fileInput = ref(null)
const MAX_FILE_SIZE = 500 * 1024 // 500KB per file
const MAX_TOTAL_SIZE = 500 * 1024 // 500KB total
const MAX_FILES = 3

// Form Data
const formData = reactive({
  fromName: '',
  subject: '',
  message: '',
})

// History & Drafts
const campaignHistory = ref([])
const drafts = ref([])
const currentDraftId = ref(null) // Track if we're editing an existing draft
const selectedEmail = ref(null) // For viewing email details

// Security & Stats
const securityStatus = ref({
  isSecure: true,
})

const sendingStats = ref({
  totalRequests: 0,
  maxRequestsPerMinute: 5,
})

// Computed - Total attachment size
const totalAttachmentSize = computed(() => {
  return attachments.value.reduce((total, file) => total + file.size, 0)
})

// Methods
const openCompose = () => {
  isComposing.value = true
}

const closeCompose = () => {
  if (confirm('Discard this message?')) {
    isComposing.value = false
    resetForm()
  }
}

const resetForm = () => {
  formData.fromName = ''
  formData.subject = ''
  formData.message = ''
  newRecipient.value = ''
  recipients.value = []
  attachments.value = []
  currentDraftId.value = null // Reset draft tracking
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const addRecipient = () => {
  const email = newRecipient.value.trim()

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) {
    return
  }

  if (!emailRegex.test(email)) {
    showMessage('Please enter a valid email address', 'alert-danger')
    return
  }

  // Check for duplicates
  if (recipients.value.includes(email)) {
    showMessage(`${email} is already in the recipient list`, 'alert-warning')
    return
  }

  // Add recipient
  recipients.value.push(email)
  newRecipient.value = ''

  // Show success message
  if (recipients.value.length === 1) {
    showMessage('Recipient added successfully', 'alert-success')
  }
}

const removeRecipient = (index) => {
  recipients.value.splice(index, 1)
}

// Attachment functions
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)

  // Check max files
  if (attachments.value.length + files.length > MAX_FILES) {
    showMessage(
      `Maximum ${MAX_FILES} files allowed. You can only add ${MAX_FILES - attachments.value.length} more file(s).`,
      'alert-warning',
    )
    return
  }

  // Check each file
  for (const file of files) {
    // Check individual file size
    if (file.size > MAX_FILE_SIZE) {
      showMessage(
        `File "${file.name}" exceeds 500KB limit (${formatFileSize(file.size)}). Please choose a smaller file.`,
        'alert-danger',
      )
      continue
    }

    // Check if adding this file would exceed total limit
    const newTotalSize = totalAttachmentSize.value + file.size
    if (newTotalSize > MAX_TOTAL_SIZE) {
      showMessage(
        `Adding "${file.name}" would exceed total 500KB limit. Current total: ${formatFileSize(totalAttachmentSize.value)}`,
        'alert-warning',
      )
      continue
    }

    // Add file
    attachments.value.push(file)
  }

  // Clear input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const removeAttachment = (index) => {
  attachments.value.splice(index, 1)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const getFileIconClass = (type) => {
  if (type.startsWith('image/')) return 'bi bi-file-image text-primary'
  if (type.includes('pdf')) return 'bi bi-file-pdf text-danger'
  if (type.includes('word') || type.includes('document')) return 'bi bi-file-word text-info'
  if (type.includes('text')) return 'bi bi-file-text text-secondary'
  return 'bi bi-file-earmark text-muted'
}

const getSendButtonText = () => {
  if (isLoading.value) return 'Sending...'
  const count = recipients.value.length
  if (count === 0) return 'Send Email'
  if (count === 1) return 'Send Email'
  return `Send to ${count} Recipients`
}

const showMessage = (text, type = 'alert-info') => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 5000)
}

const handleSubmit = async () => {
  isLoading.value = true

  try {
    // 验证收件人
    if (recipients.value.length === 0) {
      throw new Error('Please add at least one recipient')
    }

    const recipientsList = recipients.value
    const recipientCount = recipientsList.length
    const type = recipientCount === 1 ? 'Single' : 'Multiple'

    // 验证表单
    if (!formData.fromName) {
      throw new Error('Please enter sender name')
    }
    if (!formData.subject) {
      throw new Error('Please enter email subject')
    }
    if (!formData.message) {
      throw new Error('Please enter email message')
    }

    console.log('📧 Sending emails to:', recipientsList)

    // 实际发送邮件 - 逐个发送
    let successCount = 0
    let failedCount = 0
    const errors = []

    for (const email of recipientsList) {
      try {
        const result = await emailService.sendEmail({
          to_email: email,
          from_name: formData.fromName,
          subject: formData.subject,
          message: formData.message,
          reply_to: email,
          user_id: email,
        })

        if (result.success) {
          successCount++
          console.log(`✅ Email sent successfully to ${email}`)
        } else {
          failedCount++
          errors.push(`${email}: ${result.error}`)
          console.error(`❌ Failed to send to ${email}:`, result.error)
        }
      } catch (error) {
        failedCount++
        errors.push(`${email}: ${error.message}`)
        console.error(`❌ Error sending to ${email}:`, error)
      }

      // 添加小延迟避免触发速率限制
      if (recipientsList.length > 1) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }

    // Add to history with detailed information
    campaignHistory.value.unshift({
      id: Date.now(),
      date: new Date().toISOString(),
      subject: formData.subject,
      message: formData.message,
      fromName: formData.fromName,
      recipientsList: [...recipientsList], // Store actual recipient emails
      recipientCount: recipientCount,
      type: type,
      successCount: successCount,
      failedCount: failedCount,
      status:
        successCount === recipientCount
          ? 'success'
          : failedCount === recipientCount
            ? 'failed'
            : 'partial',
      hasAttachments: attachments.value.length > 0,
      attachmentsCount: attachments.value.length,
    })

    // Save to localStorage
    localStorage.setItem('emailHistory', JSON.stringify(campaignHistory.value))

    // Update stats
    sendingStats.value.totalRequests += successCount

    // 显示结果
    if (successCount === recipientCount) {
      showMessage(
        `✅ Email sent successfully to ${successCount} recipient(s)! Please check inbox (may be in spam folder).`,
        'alert-success',
      )
    } else if (successCount > 0) {
      showMessage(
        `⚠️ Sent to ${successCount}/${recipientCount} recipients. ${failedCount} failed: ${errors.join(', ')}`,
        'alert-warning',
      )
    } else {
      throw new Error(`Failed to send all emails: ${errors.join(', ')}`)
    }

    // Reset form after delay
    setTimeout(() => {
      isComposing.value = false
      resetForm()
    }, 3000)
  } catch (error) {
    showMessage(`❌ Failed to send: ${error.message}`, 'alert-danger')
    console.error('Email sending error:', error)
  } finally {
    isLoading.value = false
  }
}

const saveDraft = () => {
  try {
    // Validate that there's at least some content
    if (!formData.subject && !formData.message && recipients.value.length === 0) {
      showMessage('Cannot save empty draft', 'alert-warning')
      return
    }

    const draftData = {
      id: currentDraftId.value || Date.now().toString(),
      fromName: formData.fromName,
      subject: formData.subject || '(No Subject)',
      message: formData.message,
      recipients: [...recipients.value],
      attachments: attachments.value.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      })),
      savedAt: new Date().toISOString(),
    }

    // If editing existing draft, update it
    if (currentDraftId.value) {
      const index = drafts.value.findIndex((d) => d.id === currentDraftId.value)
      if (index !== -1) {
        drafts.value[index] = draftData
        showMessage('✅ Draft updated successfully!', 'alert-success')
      }
    } else {
      // Add new draft
      drafts.value.unshift(draftData)
      currentDraftId.value = draftData.id
      showMessage('✅ Draft saved successfully!', 'alert-success')
    }

    // Save to localStorage
    localStorage.setItem('emailDrafts', JSON.stringify(drafts.value))

    // Close compose after saving
    setTimeout(() => {
      closeCompose()
      currentView.value = 'drafts'
    }, 1500)
  } catch (error) {
    console.error('Error saving draft:', error)
    showMessage('❌ Failed to save draft', 'alert-danger')
  }
}

const loadDraft = (draft) => {
  try {
    // Load draft data into form
    formData.fromName = draft.fromName
    formData.subject = draft.subject
    formData.message = draft.message
    recipients.value = [...draft.recipients]
    currentDraftId.value = draft.id

    // Note: Attachments are metadata only, actual files can't be restored
    // Show a message if draft had attachments
    if (draft.attachments && draft.attachments.length > 0) {
      showMessage(
        `⚠️ Draft loaded. Note: ${draft.attachments.length} attachment(s) need to be re-uploaded.`,
        'alert-warning',
      )
    } else {
      showMessage('✅ Draft loaded successfully!', 'alert-success')
    }

    // Open compose view
    isComposing.value = true
  } catch (error) {
    console.error('Error loading draft:', error)
    showMessage('❌ Failed to load draft', 'alert-danger')
  }
}

const deleteDraft = (draftId) => {
  if (confirm('Are you sure you want to delete this draft?')) {
    try {
      drafts.value = drafts.value.filter((d) => d.id !== draftId)
      localStorage.setItem('emailDrafts', JSON.stringify(drafts.value))
      showMessage('✅ Draft deleted successfully!', 'alert-success')
    } catch (error) {
      console.error('Error deleting draft:', error)
      showMessage('❌ Failed to delete draft', 'alert-danger')
    }
  }
}

const clearAllDrafts = () => {
  if (confirm(`Are you sure you want to delete all ${drafts.value.length} drafts?`)) {
    try {
      drafts.value = []
      localStorage.setItem('emailDrafts', JSON.stringify(drafts.value))
      showMessage('✅ All drafts cleared!', 'alert-success')
    } catch (error) {
      console.error('Error clearing drafts:', error)
      showMessage('❌ Failed to clear drafts', 'alert-danger')
    }
  }
}

const formatDate = (isoString) => {
  const date = new Date(isoString)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Sent email management functions
const viewEmailDetails = (email) => {
  selectedEmail.value = email
}

const resendEmail = (email) => {
  try {
    // Load email data into compose form
    formData.fromName = email.fromName || ''
    formData.subject = `Re: ${email.subject || ''}`
    formData.message = email.message || ''

    // Handle recipients - check if recipientsList exists (new format) or fall back to empty
    if (email.recipientsList && Array.isArray(email.recipientsList)) {
      recipients.value = [...email.recipientsList]
    } else {
      recipients.value = []
      showMessage(
        '⚠️ Email loaded but recipient list unavailable (old format). Please add recipients manually.',
        'alert-warning',
      )
    }

    // Open compose view
    isComposing.value = true
    currentView.value = 'inbox'

    if (recipients.value.length > 0) {
      showMessage('✅ Email loaded for resending. Review and click Send.', 'alert-success')
    }
  } catch (error) {
    console.error('Error resending email:', error)
    showMessage('❌ Failed to load email for resending', 'alert-danger')
  }
}

const resendEmailAndClose = (email) => {
  resendEmail(email)
  selectedEmail.value = null
}

const deleteHistoryItem = (itemId) => {
  if (confirm('Are you sure you want to delete this email from history?')) {
    try {
      campaignHistory.value = campaignHistory.value.filter((item) => item.id !== itemId)
      localStorage.setItem('emailHistory', JSON.stringify(campaignHistory.value))
      showMessage('✅ Email deleted from history', 'alert-success')
    } catch (error) {
      console.error('Error deleting history item:', error)
      showMessage('❌ Failed to delete email', 'alert-danger')
    }
  }
}

const clearHistory = () => {
  if (
    confirm(
      `Are you sure you want to clear all ${campaignHistory.value.length} sent emails from history?`,
    )
  ) {
    try {
      campaignHistory.value = []
      localStorage.setItem('emailHistory', JSON.stringify(campaignHistory.value))
      showMessage('✅ Email history cleared!', 'alert-success')
    } catch (error) {
      console.error('Error clearing history:', error)
      showMessage('❌ Failed to clear history', 'alert-danger')
    }
  }
}

const truncateMessage = (message) => {
  if (!message) return ''
  return message.length > 100 ? message.substring(0, 100) + '...' : message
}

const getStatusClass = (status) => {
  switch (status) {
    case 'success':
      return 'border-success'
    case 'failed':
      return 'border-danger'
    case 'partial':
      return 'border-warning'
    default:
      return ''
  }
}

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'success':
      return 'badge bg-success'
    case 'failed':
      return 'badge bg-danger'
    case 'partial':
      return 'badge bg-warning'
    default:
      return 'badge bg-secondary'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'success':
      return '✓ Sent'
    case 'failed':
      return '✗ Failed'
    case 'partial':
      return '⚠ Partial'
    default:
      return 'Unknown'
  }
}

// Load history and drafts from localStorage
onMounted(() => {
  // Load email history
  const saved = localStorage.getItem('emailHistory')
  if (saved) {
    campaignHistory.value = JSON.parse(saved)
  }

  // Load drafts
  const savedDrafts = localStorage.getItem('emailDrafts')
  if (savedDrafts) {
    drafts.value = JSON.parse(savedDrafts)
  }
})

console.log('✅ Unified Email Management loaded')
</script>

<style scoped>
.list-group-item {
  border-left: 3px solid transparent;
  transition: all 0.2s;
}

.list-group-item.active {
  border-left-color: #0d6efd;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

.badge {
  font-weight: normal;
}

textarea {
  font-family: Arial, sans-serif;
  resize: vertical;
}

/* Email Card Styles */
.email-card {
  transition: all 0.2s ease;
  border-left: 4px solid #dee2e6;
}

.email-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.email-card.border-success {
  border-left-color: #198754;
}

.email-card.border-danger {
  border-left-color: #dc3545;
}

.email-card.border-warning {
  border-left-color: #ffc107;
}

.email-preview {
  max-height: 40px;
  overflow: hidden;
  line-height: 1.4;
}

.recipients-preview {
  font-size: 0.85rem;
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Modal Styles */
.modal {
  z-index: 1050;
}

.modal-dialog {
  max-width: 800px;
}

.modal-body {
  max-height: 70vh;
  overflow-y: auto;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .email-card .col-md-7,
  .email-card .col-md-5 {
    text-align: left !important;
  }

  .recipients-preview {
    max-width: 100%;
  }

  .btn-group {
    width: 100%;
  }

  .btn-group .btn {
    flex: 1;
  }
}
</style>
