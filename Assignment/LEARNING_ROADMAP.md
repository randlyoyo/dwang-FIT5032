# 🎓 Healthy Recipe Hub - 逐文件学习路线图

## 📋 学习大纲

### 阶段 0：项目启动与配置 (1-2 小时)

- [ ] 0.1 package.json - 理解项目依赖
- [ ] 0.2 vite.config.js - 构建工具配置
- [ ] 0.3 firebase.json - Firebase 项目配置
- [ ] 0.4 firestore.rules - 数据库安全规则

### 阶段 1：应用入口与核心配置 (2-3 小时)

- [ ] 1.1 src/main.js - 应用启动入口
- [ ] 1.2 src/App.vue - 根组件与导航
- [ ] 1.3 src/config/firebase.js - Firebase 初始化
- [ ] 1.4 src/config/emailjs.js - 邮件服务配置
- [ ] 1.5 src/config/accessibility.js - 无障碍配置

### 阶段 2：路由与导航 (1-2 小时)

- [ ] 2.1 src/router/index.js - 路由配置
- [ ] 2.2 src/middleware/auth.js - 认证中间件

### 阶段 3：服务层 - 业务逻辑 (3-4 小时)

- [ ] 3.1 src/services/firebaseAuth.js - 用户认证服务
- [ ] 3.2 src/services/cloudFunctions.js - Cloud Functions 调用
- [ ] 3.3 src/services/emailService.js - 邮件发送服务
- [ ] 3.4 src/services/geminiService.js - AI 对话服务
- [ ] 3.5 src/services/exportService.js - 数据导出服务
- [ ] 3.6 src/services/accessibilityService.js - 无障碍服务

### 阶段 4：组件层 - 用户界面 (8-10 小时)

#### 4.1 基础组件

- [ ] 4.1.1 src/components/Home.vue - 主页（最简单）
- [ ] 4.1.2 src/components/PageHeader.vue - 页面标题组件

#### 4.2 认证相关

- [ ] 4.2.1 src/components/Auth.vue - 登录/注册
- [ ] 4.2.2 src/components/Profile.vue - 用户资料

#### 4.3 核心功能

- [ ] 4.3.1 src/components/RecipeList.vue - 食谱列表（重点）
- [ ] 4.3.2 src/components/RecipeRating.vue - 食谱评分
- [ ] 4.3.3 src/components/MapboxStoreLocator.vue - 地图定位（重点）
- [ ] 4.3.4 src/components/GeminiAI.vue - AI 助手（重点）
- [ ] 4.3.5 src/components/EmailCenter.vue - 邮件中心（重点）

#### 4.4 管理功能

- [ ] 4.4.1 src/components/AdminPanel.vue - 管理员面板（重点）
- [ ] 4.4.2 src/components/UserManagement.vue - 用户管理
- [ ] 4.4.3 src/components/InteractiveCharts.vue - 数据图表

#### 4.5 辅助组件

- [ ] 4.5.1 src/components/AccessibilityDemo.vue - 无障碍演示

### 阶段 5：后端服务 (2-3 小时)

- [ ] 5.1 functions/index.js - Cloud Functions
- [ ] 5.2 scripts/import-mock-data.js - 数据导入脚本

### 阶段 6：样式与资源 (1 小时)

- [ ] 6.1 src/assets/theme.css - 主题样式
- [ ] 6.2 src/assets/accessibility.css - 无障碍样式

---

## 🎯 学习方法

### 每个文件的学习步骤：

1. **快速浏览** - 了解文件结构和主要功能
2. **逐行解读** - 理解关键代码的作用
3. **运行测试** - 在浏览器中实际操作
4. **做笔记** - 记录重点和难点
5. **小练习** - 尝试修改或扩展功能

### 标记系统：

- ⭐ 必须掌握
- 🔥 重点难点
- 💡 学习提示
- ⚠️ 常见错误
- 🎯 实践任务

---

## 📊 学习进度追踪

| 阶段     | 完成度 | 预计时间 | 实际时间 | 备注     |
| -------- | ------ | -------- | -------- | -------- |
| 阶段 0   | ⬜ 0%  | 2h       | -        | 配置文件 |
| 阶段 1   | ⬜ 0%  | 3h       | -        | 核心配置 |
| 阶段 2   | ⬜ 0%  | 2h       | -        | 路由     |
| 阶段 3   | ⬜ 0%  | 4h       | -        | 服务层   |
| 阶段 4   | ⬜ 0%  | 10h      | -        | 组件层   |
| 阶段 5   | ⬜ 0%  | 3h       | -        | 后端     |
| 阶段 6   | ⬜ 0%  | 1h       | -        | 样式     |
| **总计** | **0%** | **25h**  | **-**    | -        |

---

## 🚀 准备开始

在开始学习前，请确保：

- ✅ 已安装 Node.js (v18+)
- ✅ 已安装代码编辑器 (VS Code 推荐)
- ✅ 已安装 Vue DevTools 浏览器插件
- ✅ 对 JavaScript/HTML/CSS 有基础了解
- ✅ 准备好笔记本（实体或电子）

---

**准备好了吗？让我们从第一个文件开始！** 🎉

