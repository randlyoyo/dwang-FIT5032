// EmailJS配置文件 - 安全配置
// 注意：在生产环境中，这些配置应该通过环境变量管理

const emailjsConfig = {
  // 这些配置应该从环境变量获取，而不是硬编码
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'your-service-id',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'your-template-id',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'your-public-key',

  // 安全设置
  security: {
    // 启用域名白名单
    enableDomainWhitelist: false, // 暂时禁用域名白名单限制
    // 允许的域名列表
    allowedDomains: [
      'localhost',
      '127.0.0.1',
      'assignment-cfc8f.web.app',
      'gmail.com',
      'outlook.com',
      'yahoo.com',
    ],

    // 启用发送频率限制
    enableRateLimit: true,
    // 每分钟最大发送次数
    maxRequestsPerMinute: 5,

    // 启用内容过滤
    enableContentFilter: true,
    // 禁止的关键词
    blockedKeywords: ['spam', 'phishing', 'malware', 'virus'],
  },
}

export default emailjsConfig
