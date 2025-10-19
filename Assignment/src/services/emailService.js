// Secure EmailJS Service
import emailjs from '@emailjs/browser'
import emailjsConfig from '../config/emailjs.js'

class SecureEmailService {
  constructor() {
    this.config = emailjsConfig
    this.rateLimit = new Map() // Store rate limit history
    this.isInitialized = false

    // Initialize EmailJS
    this.initialize()
  }

  // Initialize EmailJS
  initialize() {
    try {
      emailjs.init(this.config.publicKey)
      this.isInitialized = true
      console.log('EmailJS initialized successfully')
    } catch (error) {
      console.error('EmailJS initialization failed:', error)
      this.isInitialized = false
    }
  }

  // Check domain whitelist
  checkDomainWhitelist() {
    if (!this.config.security.enableDomainWhitelist) return true

    const currentDomain = window.location.hostname
    const isAllowed = this.config.security.allowedDomains.includes(currentDomain)

    if (!isAllowed) {
      console.warn(
        `Domain ${currentDomain} not in whitelist. Allowed domains:`,
        this.config.security.allowedDomains,
      )
    }

    return isAllowed
  }

  // Check rate limit
  checkRateLimit(userId = 'default') {
    if (!this.config.security.enableRateLimit) return true

    const now = Date.now()
    const userRequests = this.rateLimit.get(userId) || []

    // Clean up records older than 1 minute
    const recentRequests = userRequests.filter((timestamp) => now - timestamp < 60000)

    // Check if limit exceeded
    if (recentRequests.length >= this.config.security.maxRequestsPerMinute) {
      return false
    }

    // Record current request
    recentRequests.push(now)
    this.rateLimit.set(userId, recentRequests)
    return true
  }

  // Check content safety
  checkContentSafety(content) {
    if (!this.config.security.enableContentFilter) return true

    const lowerContent = content.toLowerCase()
    return !this.config.security.blockedKeywords.some((keyword) => lowerContent.includes(keyword))
  }

  // Validate email parameters
  validateEmailParams(params) {
    const requiredFields = ['to_email', 'from_name', 'message']

    for (const field of requiredFields) {
      if (!params[field] || typeof params[field] !== 'string') {
        throw new Error(`Missing or invalid parameter: ${field}`)
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(params.to_email)) {
      throw new Error('Invalid email format')
    }

    // Validate message length
    if (params.message.length > 10000) {
      throw new Error('Message too long')
    }

    return true
  }

  // Send email - main method
  async sendEmail(params) {
    try {
      // Security checks
      if (!this.isInitialized) {
        throw new Error('EmailJS not initialized')
      }

      if (!this.checkDomainWhitelist()) {
        throw new Error('Domain not whitelisted')
      }

      if (!this.checkRateLimit(params.user_id)) {
        throw new Error('Rate limit exceeded')
      }

      if (!this.checkContentSafety(params.message)) {
        throw new Error('Content contains blocked keywords')
      }

      // Validate parameters
      this.validateEmailParams(params)

      // Prepare sending parameters
      const templateParams = {
        to_email: params.to_email,
        from_name: params.from_name,
        message: params.message,
        subject: params.subject || 'Message from Healthy Recipe Hub',
        reply_to: params.reply_to || params.to_email,
        user_id: params.user_id || 'anonymous',
      }

      // Send email
      const result = await emailjs.send(
        this.config.serviceId,
        this.config.templateId,
        templateParams,
      )

      console.log('Email sent successfully:', result)
      return {
        success: true,
        messageId: result.text,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error('Email sending failed:', error)
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }
    }
  }

  // Send user registration confirmation email
  async sendRegistrationConfirmation(userEmail, userName) {
    const params = {
      to_email: userEmail,
      from_name: 'Healthy Recipe Hub',
      message: `Welcome ${userName}! Your account has been successfully created. Please verify your email to complete the registration.`,
      subject: 'Welcome to Healthy Recipe Hub - Registration Confirmation',
      user_id: userEmail,
    }

    return await this.sendEmail(params)
  }

  // Send password reset email
  async sendPasswordReset(userEmail, resetLink) {
    const params = {
      to_email: userEmail,
      from_name: 'Healthy Recipe Hub',
      message: `You requested a password reset. Click the link below to reset your password: ${resetLink}`,
      subject: 'Password Reset - Healthy Recipe Hub',
      user_id: userEmail,
    }

    return await this.sendEmail(params)
  }

  // Send contact form email
  async sendContactForm(formData) {
    const params = {
      to_email: 'admin@healthyrecipehub.com',
      from_name: formData.name,
      message: `Name: ${formData.name}\nEmail: ${formData.email}\nMessage: ${formData.message}`,
      subject: `Contact Form: ${formData.subject}`,
      reply_to: formData.email,
      user_id: formData.email,
    }

    return await this.sendEmail(params)
  }

  // Send recipe share notification
  async sendRecipeShareNotification(userEmail, recipeName, sharedBy) {
    const params = {
      to_email: userEmail,
      from_name: 'Healthy Recipe Hub',
      message: `${sharedBy} has shared a recipe "${recipeName}" with you! Check it out in the app.`,
      subject: 'New Recipe Shared - Healthy Recipe Hub',
      user_id: userEmail,
    }

    return await this.sendEmail(params)
  }

  // Convert file to Base64
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  // Send email with attachments
  async sendEmailWithAttachments(params, files = []) {
    try {
      // Security checks
      if (!this.isInitialized) {
        throw new Error('EmailJS not initialized')
      }

      if (!this.checkDomainWhitelist()) {
        throw new Error('Domain not whitelisted')
      }

      if (!this.checkRateLimit(params.user_id)) {
        throw new Error('Rate limit exceeded')
      }

      if (!this.checkContentSafety(params.message)) {
        throw new Error('Content contains blocked keywords')
      }

      // Validate parameters
      this.validateEmailParams(params)

      // Prepare base parameters
      const templateParams = {
        to_email: params.to_email,
        from_name: params.from_name,
        message: params.message,
        subject: params.subject || 'Message from Healthy Recipe Hub',
        reply_to: params.reply_to || params.to_email,
        user_id: params.user_id || 'anonymous',
      }

      // Handle attachments
      if (files && files.length > 0) {
        console.log(`Processing ${files.length} attachments...`)
        
        // Convert all files to Base64
        const attachmentPromises = files.map(async (file, index) => {
          const base64 = await this.fileToBase64(file)
          return {
            name: file.name,
            data: base64,
          }
        })

        const attachments = await Promise.all(attachmentPromises)
        
        // Add attachments to parameters
        // EmailJS supports passing attachment info through template parameters
        templateParams.attachments = JSON.stringify(attachments)
        templateParams.attachment_count = attachments.length
        
        // Add attachment list to email content
        const attachmentList = files
          .map((f) => `- ${f.name} (${(f.size / 1024).toFixed(2)} KB)`)
          .join('\n')
        templateParams.message = `${params.message}\n\n---\nAttachments (${files.length}):\n${attachmentList}`
      }

      // Send email
      const result = await emailjs.send(
        this.config.serviceId,
        this.config.templateId,
        templateParams,
      )

      console.log('Email sent successfully with attachments:', result)
      return {
        success: true,
        messageId: result.text,
        timestamp: new Date().toISOString(),
        attachmentCount: files ? files.length : 0,
      }
    } catch (error) {
      console.error('Email sending with attachments failed:', error)
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }
    }
  }

  // Get sending statistics
  getSendingStats() {
    const totalRequests = Array.from(this.rateLimit.values()).flat().length

    return {
      totalRequests,
      rateLimitEnabled: this.config.security.enableRateLimit,
      maxRequestsPerMinute: this.config.security.maxRequestsPerMinute,
    }
  }
}

// Create singleton instance
const emailService = new SecureEmailService()

export default emailService
