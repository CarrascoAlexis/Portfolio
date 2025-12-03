// Simple config loader: prefers environment variables, falls back to back/config.json
let fileCfg = {};
try {
  fileCfg = require('../../config.json');
} catch (e) {
  fileCfg = {};
}

module.exports = {
  githubUsername: process.env.GITHUB_USERNAME || fileCfg.GITHUB_USERNAME || '',
  githubToken: process.env.GITHUB_TOKEN || fileCfg.GITHUB_TOKEN || '',
  // Email configuration for contact form
  emailService: process.env.EMAIL_SERVICE || fileCfg.EMAIL_SERVICE || 'gmail',
  emailUser: process.env.EMAIL_USER || fileCfg.EMAIL_USER || '',
  emailPassword: process.env.EMAIL_PASSWORD || fileCfg.EMAIL_PASSWORD || '',
  contactEmail: process.env.CONTACT_EMAIL || fileCfg.CONTACT_EMAIL || ''
};
