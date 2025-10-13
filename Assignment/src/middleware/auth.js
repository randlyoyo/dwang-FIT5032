// 认证中间件 - 提供安全认证功能，支持Firebase Auth
import firebaseAuthService from '../services/firebaseAuth.js'

export const authMiddleware = {
  // 检查用户是否已认证（支持Firebase）
  isAuthenticated() {
    // 首先检查Firebase认证状态
    if (firebaseAuthService.isAuthenticated()) {
      return true
    }

    // 回退到本地存储检查
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null')
    return !!currentUser
  },

  // 获取当前用户信息（支持Firebase）
  getCurrentUser() {
    // 首先尝试从Firebase获取用户信息
    if (firebaseAuthService.isAuthenticated()) {
      const firebaseUser = firebaseAuthService.getUserData()
      if (firebaseUser) {
        return {
          username: firebaseUser.email,
          email: firebaseUser.email,
          fullName: firebaseUser.displayName,
          role: firebaseUser.role,
          uid: firebaseUser.uid,
          emailVerified: firebaseUser.emailVerified,
        }
      }
    }

    // 回退到本地存储
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null')
    return currentUser
  },

  // 检查用户角色
  hasRole(requiredRole) {
    const currentUser = this.getCurrentUser()
    if (!currentUser) return false

    // 角色层级检查
    const roleHierarchy = {
      guest: 0,
      user: 1,
      admin: 2,
    }

    const userLevel = roleHierarchy[currentUser.role] || 0
    const requiredLevel = roleHierarchy[requiredRole] || 0

    return userLevel >= requiredLevel
  },

  // 检查是否为管理员
  isAdmin() {
    return this.hasRole('admin')
  },

  // 检查是否为普通用户
  isUser() {
    return this.hasRole('user')
  },

  // 简化登录
  login(userData) {
    try {
      // 验证用户数据
      if (!this.validateUserData(userData)) {
        throw new Error('Invalid user data provided')
      }

      // 存储用户数据
      localStorage.setItem('currentUser', JSON.stringify(userData))

      // 记录登录日志
      this.logSecurityEvent('user_login', {
        username: userData.username,
        role: userData.role,
        timestamp: new Date().toISOString(),
      })

      return true
    } catch (error) {
      console.error('Login error:', error)
      this.logSecurityEvent('login_failed', {
        error: error.message,
        timestamp: new Date().toISOString(),
      })
      return false
    }
  },

  // 安全登出（支持Firebase）
  async logout() {
    const currentUser = this.getCurrentUser()
    if (currentUser) {
      // 记录登出日志
      this.logSecurityEvent('user_logout', {
        username: currentUser.username,
        role: currentUser.role,
        timestamp: new Date().toISOString(),
      })
    }

    // Firebase登出
    if (firebaseAuthService.isAuthenticated()) {
      try {
        await firebaseAuthService.signOut()
      } catch (error) {
        console.error('Firebase logout error:', error)
      }
    }

    // 清除本地用户数据
    localStorage.removeItem('currentUser')

    // 清除其他相关数据
    localStorage.removeItem('userPreferences')
    localStorage.removeItem('savedRecipes')
    localStorage.removeItem('favoriteRecipes')
  },

  // 更新用户活动时间（简化版）
  updateActivity() {
    // 简化版本，不进行复杂的活动跟踪
    return true
  },

  // 验证用户数据
  validateUserData(userData) {
    if (!userData || typeof userData !== 'object') return false

    const requiredFields = ['username', 'email', 'role']
    for (const field of requiredFields) {
      if (!userData[field] || typeof userData[field] !== 'string') {
        return false
      }
    }

    // 验证角色
    const validRoles = ['user', 'admin']
    if (!validRoles.includes(userData.role)) {
      return false
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userData.email)) {
      return false
    }

    return true
  },

  // 生成简单ID（简化版）
  generateSessionId() {
    return 'user_' + Date.now()
  },

  // 记录安全事件
  logSecurityEvent(eventType, data) {
    const securityLog = {
      eventType,
      data,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    }

    console.log('Security Event:', securityLog)

    // 在真实应用中，这里应该发送到安全日志服务器
    // this.sendToSecurityServer(securityLog)
  },

  // 简化的会话检查
  isSessionValid() {
    const currentUser = this.getCurrentUser()
    return !!currentUser
  },

  // 简化的会话刷新
  refreshSession() {
    const currentUser = this.getCurrentUser()
    if (currentUser) {
      this.updateActivity()
      return true
    }
    return false
  },

  // Firebase相关辅助方法
  // 发送密码重置邮件
  async sendPasswordReset(email) {
    try {
      const result = await firebaseAuthService.sendPasswordReset(email)
      return result
    } catch (error) {
      console.error('Password reset error:', error)
      return {
        success: false,
        error: 'Failed to send password reset email',
      }
    }
  },
}

// 权限检查装饰器
export const requireAuth = (to, from, next) => {
  if (!authMiddleware.isAuthenticated()) {
    next({ name: 'Auth', query: { redirect: to.fullPath } })
  } else {
    next()
  }
}

// 管理员权限检查装饰器
export const requireAdmin = (to, from, next) => {
  if (!authMiddleware.isAdmin()) {
    next({ name: 'Home' })
  } else {
    next()
  }
}

// 角色权限检查装饰器
export const requireRole = (role) => {
  return (to, from, next) => {
    if (!authMiddleware.hasRole(role)) {
      next({ name: 'Home' })
    } else {
      next()
    }
  }
}
