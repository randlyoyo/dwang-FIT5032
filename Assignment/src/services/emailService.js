// 安全的EmailJS服务
import emailjs from '@emailjs/browser'
import emailjsConfig from '../config/emailjs.js'

class SecureEmailService {
  constructor() {
    this.config = emailjsConfig
    this.rateLimit = new Map() // 存储发送频率限制
    this.isInitialized = false

    // 初始化EmailJS
    this.initialize()
  }

  // 初始化EmailJS
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

  // 检查域名白名单
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

  // 检查发送频率限制
  checkRateLimit(userId = 'default') {
    if (!this.config.security.enableRateLimit) return true

    const now = Date.now()
    const userRequests = this.rateLimit.get(userId) || []

    // 清理1分钟前的记录
    const recentRequests = userRequests.filter((timestamp) => now - timestamp < 60000)

    // 检查是否超过限制
    if (recentRequests.length >= this.config.security.maxRequestsPerMinute) {
      return false
    }

    // 记录当前请求
    recentRequests.push(now)
    this.rateLimit.set(userId, recentRequests)
    return true
  }

  // 内容安全检查
  checkContentSafety(content) {
    if (!this.config.security.enableContentFilter) return true

    const lowerContent = content.toLowerCase()
    return !this.config.security.blockedKeywords.some((keyword) => lowerContent.includes(keyword))
  }

  // 验证邮件参数
  validateEmailParams(params) {
    const requiredFields = ['to_email', 'from_name', 'message']

    for (const field of requiredFields) {
      if (!params[field] || typeof params[field] !== 'string') {
        throw new Error(`Missing or invalid parameter: ${field}`)
      }
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(params.to_email)) {
      throw new Error('Invalid email format')
    }

    // 验证内容长度
    if (params.message.length > 10000) {
      throw new Error('Message too long')
    }

    return true
  }

  // 发送邮件 - 主要方法
  async sendEmail(params) {
    try {
      // 安全检查
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

      // 验证参数
      this.validateEmailParams(params)

      // 准备发送参数
      const templateParams = {
        to_email: params.to_email,
        from_name: params.from_name,
        message: params.message,
        subject: params.subject || 'Message from Healthy Recipe Hub',
        reply_to: params.reply_to || params.to_email,
        user_id: params.user_id || 'anonymous',
      }

      // 发送邮件
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

  // 发送用户注册确认邮件
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

  // 发送密码重置邮件
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

  // 发送联系表单邮件
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

  // 发送食谱分享通知
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

  // 获取发送统计
  getSendingStats() {
    const totalRequests = Array.from(this.rateLimit.values()).flat().length

    return {
      totalRequests,
      rateLimitEnabled: this.config.security.enableRateLimit,
      maxRequestsPerMinute: this.config.security.maxRequestsPerMinute,
    }
  }
}

// 创建单例实例
const emailService = new SecureEmailService()

export default emailService
