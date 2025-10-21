# 📚 Healthy Recipe Hub - 完整学习指南

## 目录

1. [项目概述](#项目概述)
2. [技术栈详解](#技术栈详解)
3. [项目结构](#项目结构)
4. [核心功能模块](#核心功能模块)
5. [学习路径](#学习路径)
6. [代码示例](#代码示例)
7. [常见问题](#常见问题)

---

## 🎯 项目概述

### 项目名称

**Healthy Recipe Hub** - 健康食谱中心

### 项目目标

为社区提供可访问的营养资源和支持，包括：

- 健康食谱浏览和搜索
- 健康食品店定位
- AI 营养助手
- 用户管理和数据分析
- 无障碍功能支持

### 核心特性

✅ 用户认证与授权（Firebase Authentication）
✅ 食谱 CRUD 操作（Firestore）
✅ 交互式地图（Mapbox）
✅ AI 对话助手（Google Gemini）
✅ 数据可视化（Chart.js）
✅ 邮件发送系统（EmailJS）
✅ 无障碍功能（WCAG 2.1 AA 标准）
✅ 响应式设计（Bootstrap 5）

---

## 🛠️ 技术栈详解

### 前端技术

#### 1. Vue.js 3 (Composition API)

```javascript
// Vue 3 的 Composition API 示例
import { ref, computed, onMounted } from 'vue'

const count = ref(0) // 响应式数据
const doubleCount = computed(() => count.value * 2) // 计算属性
onMounted(() => {
  // 生命周期钩子
  console.log('Component mounted')
})
```

**为什么使用 Vue 3？**

- 更好的 TypeScript 支持
- 更小的打包体积
- 更快的渲染速度
- Composition API 让代码组织更灵活

#### 2. Vue Router 4

路由管理，定义应用的导航结构

```javascript
// 路由配置示例
const routes = [
  { path: '/', component: Home },
  { path: '/recipes', component: RecipeList },
  { path: '/admin', component: AdminPanel, meta: { requiresAdmin: true } },
]
```

#### 3. Bootstrap 5

响应式 UI 框架，提供预制组件

```html
<!-- Bootstrap 网格系统 -->
<div class="container">
  <div class="row">
    <div class="col-md-6">左侧内容</div>
    <div class="col-md-6">右侧内容</div>
  </div>
</div>
```

#### 4. Chart.js + Vue-ChartJS

数据可视化库

```javascript
// 创建柱状图
import { Bar } from 'vue-chartjs'
```

### 后端服务

#### 1. Firebase Authentication

用户认证服务

**支持的登录方式：**

- 邮箱/密码
- Google OAuth
- GitHub OAuth

```javascript
// 登录示例
import { signInWithEmailAndPassword } from 'firebase/auth'

await signInWithEmailAndPassword(auth, email, password)
```

#### 2. Cloud Firestore

NoSQL 数据库

**数据结构：**

```
users/
  ├── {userId}/
      ├── email
      ├── displayName
      ├── role (user/admin)
      └── createdAt

recipes/
  ├── {recipeId}/
      ├── name
      ├── category
      ├── ingredients[]
      ├── instructions
      ├── difficulty
      └── rating
```

#### 3. Firebase Cloud Functions

服务器端逻辑

```javascript
// Cloud Function 示例
exports.createUserProfile = functions.auth.user().onCreate((user) => {
  // 当新用户注册时自动创建 profile
  return admin.firestore().collection('users').doc(user.uid).set({
    email: user.email,
    role: 'user',
    createdAt: new Date(),
  })
})
```

### 第三方服务

#### 1. Mapbox GL JS

地图服务，显示健康食品店位置

```javascript
// 初始化地图
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [144.9631, -37.8136], // Melbourne
  zoom: 12,
})
```

#### 2. EmailJS

浏览器端邮件发送服务

```javascript
// 发送邮件
await emailjs.send('service_id', 'template_id', { to_email: 'user@example.com', message: 'Hello!' })
```

#### 3. Google Gemini AI

AI 对话助手

```javascript
// Gemini API 调用
const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
const result = await model.generateContent(prompt)
```

---

## 📂 项目结构

```
Assignment/
├── src/                          # 源代码目录
│   ├── main.js                   # 应用入口
│   ├── App.vue                   # 根组件
│   │
│   ├── components/               # Vue 组件
│   │   ├── Home.vue              # 主页
│   │   ├── Auth.vue              # 登录/注册
│   │   ├── RecipeList.vue        # 食谱列表
│   │   ├── AdminPanel.vue        # 管理员面板
│   │   ├── UserManagement.vue    # 用户管理
│   │   ├── MapboxStoreLocator.vue # 地图定位
│   │   ├── GeminiAI.vue          # AI 助手
│   │   ├── EmailCenter.vue       # 邮件中心
│   │   ├── Profile.vue           # 用户资料
│   │   └── InteractiveCharts.vue # 数据图表
│   │
│   ├── router/                   # 路由配置
│   │   └── index.js              # 路由定义
│   │
│   ├── services/                 # 业务逻辑层
│   │   ├── firebaseAuth.js       # Firebase 认证
│   │   ├── emailService.js       # 邮件服务
│   │   ├── geminiService.js      # AI 服务
│   │   ├── exportService.js      # 数据导出
│   │   ├── cloudFunctions.js     # Cloud Functions
│   │   └── accessibilityService.js # 无障碍服务
│   │
│   ├── middleware/               # 中间件
│   │   └── auth.js               # 认证中间件
│   │
│   ├── config/                   # 配置文件
│   │   ├── firebase.js           # Firebase 配置
│   │   ├── emailjs.js            # EmailJS 配置
│   │   └── accessibility.js      # 无障碍配置
│   │
│   └── assets/                   # 静态资源
│       ├── theme.css             # 主题样式
│       ├── accessibility.css     # 无障碍样式
│       └── json/                 # 模拟数据
│
├── functions/                    # Cloud Functions
│   ├── index.js                  # Functions 入口
│   └── package.json              # Functions 依赖
│
├── scripts/                      # 工具脚本
│   └── import-mock-data.js       # 导入模拟数据
│
├── firestore.rules               # Firestore 安全规则
├── firebase.json                 # Firebase 项目配置
├── package.json                  # 项目依赖
└── vite.config.js                # Vite 构建配置
```

---

## 🔥 核心功能模块

### 1. 用户认证系统 (Auth.vue + firebaseAuth.js)

**功能流程：**

```
用户输入邮箱密码
  ↓
前端验证（格式、长度）
  ↓
调用 Firebase Auth API
  ↓
成功：保存用户信息到 localStorage
  ↓
跳转到主页
```

**关键代码：**

```javascript
// src/services/firebaseAuth.js
async signUp(email, password, displayName, role = 'user') {
  try {
    // 1. 在 Firebase Auth 创建用户
    const userCredential = await createUserWithEmailAndPassword(
      auth, email, password
    )

    // 2. 在 Firestore 创建用户档案
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      displayName,
      role,
      createdAt: new Date()
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

**学习要点：**

- Firebase Authentication API 使用
- 表单验证逻辑
- 错误处理和用户反馈
- 状态管理（localStorage）

---

### 2. 食谱管理系统 (RecipeList.vue)

**功能：**

- ✅ 浏览食谱列表
- ✅ 搜索（名称、描述）
- ✅ 筛选（类别、难度）
- ✅ 分页显示
- ✅ 食谱评分
- ✅ 数据导出（CSV/JSON/PDF）

**数据流：**

```
Firestore (recipes 集合)
  ↓
fetchRecipes() 获取数据
  ↓
computed 计算属性过滤
  ↓
v-for 渲染列表
```

**关键代码：**

```javascript
// 获取食谱数据
const fetchRecipes = async () => {
  loading.value = true
  try {
    const recipesRef = collection(db, 'recipes')
    const snapshot = await getDocs(recipesRef)

    recipes.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error('Error fetching recipes:', error)
  } finally {
    loading.value = false
  }
}

// 计算属性：过滤后的食谱
const filteredRecipes = computed(() => {
  return recipes.value.filter((recipe) => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = !categoryFilter.value || recipe.category === categoryFilter.value
    const matchesDifficulty =
      !difficultyFilter.value || recipe.difficulty === difficultyFilter.value

    return matchesSearch && matchesCategory && matchesDifficulty
  })
})
```

---

### 3. 地图定位系统 (MapboxStoreLocator.vue)

**功能：**

- 🗺️ 显示健康食品店位置
- 📍 用户定位
- 🚗 导航路线规划
- 🔍 搜索地点
- ⚙️ 缩放级别控制

**技术要点：**

```javascript
// 初始化 Mapbox
mapboxgl.accessToken = 'your-token'
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [144.9631, -37.8136],
  zoom: 12,
})

// 添加标记
stores.forEach((store) => {
  new mapboxgl.Marker()
    .setLngLat([store.lng, store.lat])
    .setPopup(
      new mapboxgl.Popup().setHTML(`
      <h6>${store.name}</h6>
      <p>${store.address}</p>
    `),
    )
    .addTo(map)
})

// 获取用户位置
navigator.geolocation.getCurrentPosition((position) => {
  const userLocation = {
    lng: position.coords.longitude,
    lat: position.coords.latitude,
  }
  map.flyTo({ center: userLocation, zoom: 14 })
})
```

---

### 4. 管理员面板 (AdminPanel.vue + UserManagement.vue)

**功能：**

- 📊 数据统计（用户、食谱）
- 👥 用户管理（查看、编辑、删除）
- 📈 交互式图表
- 📤 数据导出
- 🔐 权限控制

**权限检查：**

```javascript
// router/index.js
{
  path: '/admin',
  component: AdminPanel,
  meta: { requiresAdmin: true },
  beforeEnter: (to, from, next) => {
    if (authMiddleware.isAdmin()) {
      next()
    } else {
      next({ name: 'Home' })
    }
  }
}

// middleware/auth.js
isAdmin() {
  const currentUser = this.getCurrentUser()
  return currentUser && currentUser.role === 'admin'
}
```

---

### 5. AI 助手 (GeminiAI.vue + geminiService.js)

**功能：**

- 🤖 AI 对话
- 💡 食谱建议
- 🍎 营养咨询
- 📝 历史记录

**实现：**

```javascript
// services/geminiService.js
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(API_KEY)

async function chat(message, history = []) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  const chat = model.startChat({
    history: history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    })),
  })

  const result = await chat.sendMessage(message)
  return result.response.text()
}
```

---

### 6. 邮件中心 (EmailCenter.vue + emailService.js)

**功能：**

- ✉️ 批量发送邮件
- 📎 附件支持
- 📋 收件人管理
- 📊 发送统计
- 💾 草稿保存

**实现：**

```javascript
// services/emailService.js
async sendEmailWithAttachments(params, files = []) {
  // 转换文件为 Base64
  const attachments = await Promise.all(
    files.map(file => this.fileToBase64(file))
  )

  // 发送邮件
  return await emailjs.send(
    this.config.serviceId,
    this.config.templateId,
    { ...params, attachments }
  )
}

// 文件转 Base64
fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve({
      name: file.name,
      content: reader.result.split(',')[1]
    })
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
```

---

### 7. 无障碍功能 (App.vue + accessibilityService.js)

**功能：**

- 🔤 大字体模式
- 🎨 高对比度模式
- ⌨️ 键盘导航
- 🔊 屏幕阅读器支持
- 📢 文本朗读

**实现：**

```javascript
// 启用无障碍模式
const enableAccessibilityMode = () => {
  // 应用 CSS 类
  document.body.classList.add('large-text', 'high-contrast', 'keyboard-nav')

  // 初始化键盘导航
  initializeKeyboardNavigation()

  // 初始化文本朗读
  if ('speechSynthesis' in window) {
    speechSynthesis = window.speechSynthesis
  }
}

// 键盘导航
const handleKeyboardNavigation = (event) => {
  const { key } = event

  // 方向键导航
  if (['ArrowUp', 'ArrowDown'].includes(key)) {
    // 移动焦点到上一个/下一个可聚焦元素
  }

  // Enter 键激活
  if (key === 'Enter') {
    event.target.click()
  }

  // R 键朗读
  if (key === 'r') {
    const utterance = new SpeechSynthesisUtterance(text)
    speechSynthesis.speak(utterance)
  }
}
```

---

## 🎓 学习路径

### 第一周：基础知识

**Day 1-2: Vue.js 3 基础**

- [ ] 学习 Composition API
- [ ] 理解 ref 和 reactive
- [ ] 掌握 computed 和 watch
- [ ] 了解生命周期钩子

**推荐资源：**

- Vue 3 官方文档：https://vuejs.org/
- 查看 `src/components/Home.vue` 的简单示例

**Day 3-4: Vue Router**

- [ ] 路由配置
- [ ] 路由导航
- [ ] 路由守卫
- [ ] 动态路由

**实践：**
查看 `src/router/index.js` 理解路由结构

**Day 5-7: Bootstrap 5**

- [ ] 网格系统
- [ ] 常用组件
- [ ] 响应式设计

**实践：**
查看 `src/components/Auth.vue` 的表单设计

---

### 第二周：Firebase 集成

**Day 1-2: Firebase Authentication**

- [ ] 用户注册
- [ ] 用户登录
- [ ] OAuth 集成

**代码学习：**

- `src/services/firebaseAuth.js`
- `src/components/Auth.vue`

**Day 3-5: Cloud Firestore**

- [ ] 数据模型设计
- [ ] CRUD 操作
- [ ] 查询和筛选
- [ ] 实时监听

**实践任务：**

1. 阅读 `src/components/RecipeList.vue`
2. 尝试添加新的筛选条件

**Day 6-7: Cloud Functions**

- [ ] 函数部署
- [ ] 触发器类型
- [ ] HTTP Functions

**代码学习：**

- `functions/index.js`

---

### 第三周：高级功能

**Day 1-2: Mapbox 集成**

- [ ] 地图初始化
- [ ] 添加标记
- [ ] 路线规划

**学习文件：**

- `src/components/MapboxStoreLocator.vue`

**Day 3-4: AI 集成**

- [ ] Gemini API 使用
- [ ] 对话管理
- [ ] 提示词工程

**学习文件：**

- `src/services/geminiService.js`
- `src/components/GeminiAI.vue`

**Day 5-7: 数据可视化**

- [ ] Chart.js 基础
- [ ] 创建图表
- [ ] 交互功能

**学习文件：**

- `src/components/InteractiveCharts.vue`

---

### 第四周：优化和部署

**Day 1-3: 性能优化**

- [ ] 懒加载
- [ ] 代码分割
- [ ] 缓存策略

**Day 4-5: 无障碍功能**

- [ ] WCAG 标准
- [ ] 语义化 HTML
- [ ] 键盘导航

**学习文件：**

- `src/App.vue` (无障碍功能部分)
- `src/assets/accessibility.css`

**Day 6-7: 部署**

- [ ] Firebase Hosting
- [ ] 环境变量
- [ ] CI/CD

**命令：**

```bash
npm run build          # 构建生产版本
firebase deploy        # 部署到 Firebase
```

---

## 💻 代码示例

### 示例 1：创建一个新的 Vue 组件

```vue
<!-- src/components/MyComponent.vue -->
<template>
  <div class="my-component">
    <h2>{{ title }}</h2>
    <button @click="increment">Count: {{ count }}</button>
    <p>{{ message }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 响应式数据
const title = ref('My Component')
const count = ref(0)

// 计算属性
const message = computed(() => {
  return count.value > 5 ? 'Count is high!' : 'Keep clicking'
})

// 方法
const increment = () => {
  count.value++
}
</script>

<style scoped>
.my-component {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

button {
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #359268;
}
</style>
```

---

### 示例 2：Firestore 数据操作

```javascript
// 读取数据
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/config/firebase'

async function getRecipesByCategory(category) {
  const recipesRef = collection(db, 'recipes')
  const q = query(recipesRef, where('category', '==', category))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}

// 添加数据
import { addDoc } from 'firebase/firestore'

async function addRecipe(recipeData) {
  const recipesRef = collection(db, 'recipes')
  const docRef = await addDoc(recipesRef, {
    ...recipeData,
    createdAt: new Date(),
    rating: 0,
  })
  return docRef.id
}

// 更新数据
import { doc, updateDoc } from 'firebase/firestore'

async function updateRecipe(recipeId, updates) {
  const recipeRef = doc(db, 'recipes', recipeId)
  await updateDoc(recipeRef, updates)
}

// 删除数据
import { deleteDoc } from 'firebase/firestore'

async function deleteRecipe(recipeId) {
  const recipeRef = doc(db, 'recipes', recipeId)
  await deleteDoc(recipeRef)
}
```

---

### 示例 3：路由守卫

```javascript
// router/index.js
import { authMiddleware } from '@/middleware/auth'

const routes = [
  {
    path: '/admin',
    component: AdminPanel,
    meta: { requiresAdmin: true },
  },
]

router.beforeEach((to, from, next) => {
  // 检查是否需要管理员权限
  if (to.meta.requiresAdmin) {
    if (authMiddleware.isAdmin()) {
      next() // 允许访问
    } else {
      next({ name: 'Home' }) // 重定向到主页
    }
  } else {
    next() // 正常导航
  }
})
```

---

## ❓ 常见问题

### Q1: 如何运行项目？

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 访问 http://localhost:5173
```

### Q2: 如何配置 Firebase？

1. 在 Firebase Console 创建项目
2. 复制配置到 `src/config/firebase.js`
3. 启用 Authentication、Firestore
4. 更新 Firestore 安全规则

### Q3: 如何添加新的路由？

```javascript
// router/index.js
{
  path: '/new-page',
  name: 'NewPage',
  component: () => import('@/components/NewPage.vue')
}
```

### Q4: 如何调试 Firestore 查询？

```javascript
const snapshot = await getDocs(recipesRef)
console.log('Documents found:', snapshot.size)
snapshot.forEach((doc) => {
  console.log(doc.id, doc.data())
})
```

### Q5: 如何部署项目？

```bash
# 1. 构建项目
npm run build

# 2. 初始化 Firebase (首次)
firebase login
firebase init hosting

# 3. 部署
firebase deploy
```

---

## 📖 推荐学习资源

### 官方文档

- [Vue 3](https://vuejs.org/)
- [Vue Router](https://router.vuejs.org/)
- [Firebase](https://firebase.google.com/docs)
- [Bootstrap 5](https://getbootstrap.com/docs/5.3/)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)
- [Chart.js](https://www.chartjs.org/docs/)

### 视频教程

- Vue Mastery (https://www.vuemastery.com/)
- Firebase YouTube Channel
- Traversy Media (YouTube)

### 实践项目

1. 为项目添加新功能（如收藏食谱）
2. 创建食谱评论系统
3. 实现食谱分享功能
4. 添加购物清单功能

---

## 🎯 下一步行动

1. **克隆项目并运行**

   ```bash
   git clone <repository-url>
   cd Assignment
   npm install
   npm run dev
   ```

2. **逐个查看组件**

   - 从简单的开始（Home.vue）
   - 理解数据流
   - 查看网络请求

3. **尝试修改**

   - 改变样式
   - 添加新字段
   - 创建新组件

4. **阅读代码**

   - 每天读一个组件
   - 理解设计模式
   - 做笔记

5. **实践项目**
   - 添加新功能
   - 修复 Bug
   - 优化性能

---

## 📞 获取帮助

如果遇到问题：

1. 查看控制台错误信息
2. 检查 Firebase 规则和配置
3. 阅读相关文档
4. 搜索类似问题
5. 提问时提供详细信息

---

**祝学习顺利！🎉**


