import { createRouter, createWebHistory } from 'vue-router'

// 导入组件
import Home from '../components/Home.vue'
import Auth from '../components/Auth.vue'
import RecipeList from '../components/RecipeList.vue'
import AdminPanel from '../components/AdminPanel.vue'
import Profile from '../components/Profile.vue'
import EmailCenter from '../components/EmailCenter.vue'
import UserManagement from '../components/UserManagement.vue'
import HealthyStoreMap from '../components/HealthyStoreMap.vue'
import MapboxStoreLocator from '../components/MapboxStoreLocator.vue'
import AccessibilityDemo from '../components/AccessibilityDemo.vue'
import GeminiAI from '../components/GeminiAI.vue'

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: {
        title: 'Home',
        requiresAuth: false,
        allowedRoles: ['guest', 'user', 'admin'],
      },
    },
    {
      path: '/auth',
      name: 'Auth',
      component: Auth,
      meta: {
        title: 'Authentication',
        requiresAuth: false,
        allowedRoles: ['guest'],
        redirectIfAuthenticated: true,
      },
    },
    {
      path: '/recipes',
      name: 'Recipes',
      component: RecipeList,
      meta: {
        title: 'Browse Recipes',
        requiresAuth: true,
        allowedRoles: ['user', 'admin'],
      },
    },
    {
      path: '/admin',
      name: 'Admin',
      component: AdminPanel,
      meta: {
        title: 'Admin Dashboard',
        requiresAuth: true,
        allowedRoles: ['admin'],
        requiresAdmin: true,
      },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile,
      meta: {
        title: 'User Profile',
        requiresAuth: true,
        allowedRoles: ['user', 'admin'],
      },
    },
    {
      path: '/email-center',
      name: 'EmailCenter',
      component: EmailCenter,
      meta: {
        title: 'Email Center',
        requiresAuth: true,
        allowedRoles: ['user', 'admin'],
      },
    },
    {
      path: '/users',
      name: 'UserManagement',
      component: UserManagement,
      meta: {
        title: 'User Management',
        requiresAuth: true,
        allowedRoles: ['admin'],
      },
    },
    {
      path: '/store-locator',
      name: 'StoreLocator',
      component: MapboxStoreLocator,
      meta: {
        title: 'Healthy Food Store Locator (Mapbox)',
        requiresAuth: false,
        allowedRoles: ['guest', 'user', 'admin'],
      },
    },
    {
      path: '/store-locator-google',
      name: 'StoreLocatorGoogle',
      component: HealthyStoreMap,
      meta: {
        title: 'Healthy Food Store Locator (Google Maps)',
        requiresAuth: false,
        allowedRoles: ['guest', 'user', 'admin'],
      },
    },
    {
      path: '/accessibility',
      name: 'Accessibility',
      component: AccessibilityDemo,
      meta: {
        title: 'Accessibility Features',
        requiresAuth: false,
        allowedRoles: ['guest', 'user', 'admin'],
      },
    },
    {
      path: '/ai-assistant',
      name: 'AIAssistant',
      component: GeminiAI,
      meta: {
        title: 'AI Recipe Assistant',
        requiresAuth: false,
        allowedRoles: ['guest', 'user', 'admin'],
      },
    },
  ],
})

// 全局前置守卫 - 安全验证
router.beforeEach((to, from, next) => {
  // 获取用户信息
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null')
  const isAuthenticated = !!currentUser
  const userRole = currentUser?.role || 'guest'

  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - Healthy Recipe Hub` : 'Healthy Recipe Hub'

  // 安全检查1: 检查是否需要认证
  if (to.meta.requiresAuth && !isAuthenticated) {
    console.warn(`Security: Unauthenticated access attempt to ${to.path}`)
    next({ name: 'Auth', query: { redirect: to.fullPath } })
    return
  }

  // 安全检查2: 检查用户角色权限
  if (to.meta.allowedRoles && !to.meta.allowedRoles.includes(userRole)) {
    console.warn(
      `Security: Unauthorized role access attempt. User: ${userRole}, Required: ${to.meta.allowedRoles}`,
    )
    next({ name: 'Home' })
    return
  }

  // 安全检查3: 检查管理员权限
  if (to.meta.requiresAdmin && userRole !== 'admin') {
    console.warn(`Security: Non-admin access attempt to admin panel. User: ${userRole}`)
    next({ name: 'Home' })
    return
  }

  // 安全检查4: 已认证用户访问登录页面
  if (to.meta.redirectIfAuthenticated && isAuthenticated) {
    console.log(`Security: Redirecting authenticated user from ${to.path}`)
    next({ name: 'Home' })
    return
  }

  // 安全检查5: 基本用户验证
  if (isAuthenticated && !currentUser) {
    console.warn('Security: Invalid user data, clearing session')
    localStorage.removeItem('currentUser')
    next({ name: 'Auth' })
    return
  }

  // 安全检查6: 防止直接URL访问敏感页面
  if (to.meta.requiresAuth && !isAuthenticated) {
    // 记录可疑活动
    const suspiciousActivity = {
      timestamp: new Date().toISOString(),
      action: 'unauthorized_access_attempt',
      path: to.path,
      userAgent: navigator.userAgent,
      ip: 'client-side',
    }
    console.warn('Suspicious activity detected:', suspiciousActivity)
  }

  // 通过所有安全检查
  next()
})

// 全局后置钩子 - 安全日志
router.afterEach((to, from) => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null')
  const userRole = currentUser?.role || 'guest'

  // 记录路由访问日志
  const accessLog = {
    timestamp: new Date().toISOString(),
    from: from.path,
    to: to.path,
    user: currentUser?.username || 'anonymous',
    role: userRole,
    userAgent: navigator.userAgent,
  }

  console.log('Route access log:', accessLog)
})

// 导出路由实例
export default router
