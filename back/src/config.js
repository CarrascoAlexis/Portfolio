// Simple config loader: prefers environment variables, falls back to back/config.json
let fileCfg = {};
try {
  fileCfg = require('../../config.json');
} catch (e) {
  fileCfg = {};
}

module.exports = {
  githubUsername: process.env.GITHUB_USERNAME || fileCfg.GITHUB_USERNAME || '',
  githubToken: process.env.GITHUB_TOKEN || fileCfg.GITHUB_TOKEN || ''
};
