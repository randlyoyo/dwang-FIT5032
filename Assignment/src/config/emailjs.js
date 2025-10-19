// EmailJS configuration file - Security settings
// Note: In production, these configs should be managed through environment variables

const emailjsConfig = {
  // These configs should be obtained from environment variables, not hardcoded
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'your-service-id',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'your-template-id',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'your-public-key',

  // Security settings
  security: {
    // Enable domain whitelist
    enableDomainWhitelist: false, // Temporarily disable domain whitelist restriction
    // Allowed domains list
    allowedDomains: [
      'localhost',
      '127.0.0.1',
      'assignment-cfc8f.web.app',
      'gmail.com',
      'outlook.com',
      'yahoo.com',
    ],

    // Enable sending rate limit
    enableRateLimit: true,
    // Maximum sends per minute
    maxRequestsPerMinute: 5,

    // Enable content filtering
    enableContentFilter: true,
    // Blocked keywords
    blockedKeywords: ['spam', 'phishing', 'malware', 'virus'],
  },
}

export default emailjsConfig
