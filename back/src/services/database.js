const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'portfolio.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
function initDatabase() {
  db.exec(`
    -- Manual projects table
    CREATE TABLE IF NOT EXISTS manual_projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      tags TEXT, -- JSON array
      images TEXT, -- JSON array
      url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Project visibility table
    CREATE TABLE IF NOT EXISTS project_visibility (
      project_key TEXT PRIMARY KEY, -- 'github:owner/repo' or 'manual:id'
      visible INTEGER DEFAULT 1, -- 1 = visible, 0 = hidden
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Images table
    CREATE TABLE IF NOT EXISTS images (
      filename TEXT PRIMARY KEY,
      originalname TEXT NOT NULL,
      mimetype TEXT NOT NULL,
      size INTEGER NOT NULL,
      path TEXT NOT NULL,
      url TEXT NOT NULL,
      project TEXT, -- project key (e.g., 'owner/repo' or 'manual:id')
      is_primary INTEGER DEFAULT 0, -- 1 = primary, 0 = not primary
      uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Project tags table (for custom tags on any project)
    CREATE TABLE IF NOT EXISTS project_tags (
      project_key TEXT PRIMARY KEY, -- 'github:owner/repo' or 'manual:id'
      tags TEXT NOT NULL, -- JSON array of tags
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for better query performance
    CREATE INDEX IF NOT EXISTS idx_images_project ON images(project);
    CREATE INDEX IF NOT EXISTS idx_images_is_primary ON images(is_primary);
    CREATE INDEX IF NOT EXISTS idx_project_visibility ON project_visibility(visible);
  `);

  console.log('✓ SQLite database initialized at:', dbPath);
}

// Initialize on module load
initDatabase();

module.exports = db;
