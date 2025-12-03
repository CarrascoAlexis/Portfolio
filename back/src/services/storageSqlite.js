const db = require('./database');
const { v4: uuidv4 } = require('uuid');

// ====================
// Manual Projects
// ====================

function createManualProject(project) {
  const id = project.id || uuidv4();
  const tags = Array.isArray(project.tags) ? JSON.stringify(project.tags) : (project.tags || '[]');
  const images = Array.isArray(project.images) ? JSON.stringify(project.images) : (project.images || '[]');
  
  const stmt = db.prepare(`
    INSERT INTO manual_projects (id, title, description, tags, images, url, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);
  
  stmt.run(id, project.title || '', project.description || '', tags, images, project.url || '');
  
  return {
    id,
    title: project.title || '',
    description: project.description || '',
    tags: JSON.parse(tags),
    images: JSON.parse(images),
    url: project.url || ''
  };
}

function getManualProjects() {
  const stmt = db.prepare('SELECT * FROM manual_projects ORDER BY created_at DESC');
  const rows = stmt.all();
  
  return rows.map(row => ({
    id: row.id,
    title: row.title,
    description: row.description,
    tags: JSON.parse(row.tags || '[]'),
    images: JSON.parse(row.images || '[]'),
    url: row.url,
    created_at: row.created_at,
    updated_at: row.updated_at
  }));
}

function updateManualProject(id, patch) {
  const current = db.prepare('SELECT * FROM manual_projects WHERE id = ?').get(id);
  if (!current) return null;
  
  const updates = { ...current, ...patch };
  const tags = Array.isArray(updates.tags) ? JSON.stringify(updates.tags) : (updates.tags || current.tags);
  const images = Array.isArray(updates.images) ? JSON.stringify(updates.images) : (updates.images || current.images);
  
  const stmt = db.prepare(`
    UPDATE manual_projects 
    SET title = ?, description = ?, tags = ?, images = ?, url = ?, updated_at = datetime('now')
    WHERE id = ?
  `);
  
  stmt.run(
    updates.title || current.title,
    updates.description || current.description,
    tags,
    images,
    updates.url || current.url,
    id
  );
  
  return {
    id,
    title: updates.title || current.title,
    description: updates.description || current.description,
    tags: JSON.parse(tags),
    images: JSON.parse(images),
    url: updates.url || current.url
  };
}

function deleteManualProject(id) {
  const stmt = db.prepare('DELETE FROM manual_projects WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

// ====================
// Project Visibility
// ====================

function setProjectVisibility(key, visible) {
  if (!key) return false;
  
  const stmt = db.prepare(`
    INSERT INTO project_visibility (project_key, visible, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(project_key) DO UPDATE SET visible = ?, updated_at = datetime('now')
  `);
  
  stmt.run(key, visible ? 1 : 0, visible ? 1 : 0);
  return true;
}

function getProjectVisibility(key) {
  if (!key) return null;
  
  const stmt = db.prepare('SELECT visible FROM project_visibility WHERE project_key = ?');
  const row = stmt.get(key);
  
  return row ? !!row.visible : null;
}

function getAllVisibilities() {
  const stmt = db.prepare('SELECT project_key, visible FROM project_visibility');
  const rows = stmt.all();
  
  const map = {};
  rows.forEach(row => {
    map[row.project_key] = !!row.visible;
  });
  
  return map;
}

// ====================
// Images
// ====================

function saveImage(project, imageMeta) {
  const stmt = db.prepare(`
    INSERT INTO images (filename, originalname, mimetype, size, path, url, project, is_primary, uploaded_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);
  
  stmt.run(
    imageMeta.filename,
    imageMeta.originalname,
    imageMeta.mimetype,
    imageMeta.size,
    imageMeta.path,
    imageMeta.url,
    project || null,
    imageMeta.isPrimary ? 1 : 0
  );
  
  return imageMeta;
}

function getImages(project) {
  const stmt = db.prepare('SELECT * FROM images WHERE project = ? ORDER BY uploaded_at DESC');
  const rows = stmt.all(project || null);
  
  return rows.map(row => ({
    filename: row.filename,
    originalname: row.originalname,
    mimetype: row.mimetype,
    size: row.size,
    path: row.path,
    url: row.url,
    project: row.project,
    isPrimary: !!row.is_primary,
    uploaded_at: row.uploaded_at
  }));
}

function getAllImages() {
  const stmt = db.prepare('SELECT * FROM images ORDER BY uploaded_at DESC');
  const rows = stmt.all();
  
  return rows.map(row => ({
    filename: row.filename,
    originalname: row.originalname,
    mimetype: row.mimetype,
    size: row.size,
    path: row.path,
    url: row.url,
    project: row.project,
    isPrimary: !!row.is_primary,
    uploaded_at: row.uploaded_at
  }));
}

function removeImageByFilename(filename) {
  if (!filename) return false;
  
  const stmt = db.prepare('DELETE FROM images WHERE filename = ?');
  const result = stmt.run(filename);
  
  return result.changes > 0;
}

function updateImageMetadata(filename, updates) {
  if (!filename) return false;
  
  const current = db.prepare('SELECT * FROM images WHERE filename = ?').get(filename);
  if (!current) return false;
  
  const stmt = db.prepare(`
    UPDATE images 
    SET project = ?, is_primary = ?
    WHERE filename = ?
  `);
  
  stmt.run(
    updates.project !== undefined ? updates.project : current.project,
    updates.isPrimary !== undefined ? (updates.isPrimary ? 1 : 0) : current.is_primary,
    filename
  );
  
  return true;
}

function clearPrimaryForProject(project) {
  if (!project) return false;
  
  const stmt = db.prepare('UPDATE images SET is_primary = 0 WHERE project = ?');
  stmt.run(project);
  
  return true;
}

// ====================
// Project Tags
// ====================

function setProjectTags(key, tags) {
  if (!key) return false;
  
  const tagsJson = Array.isArray(tags) ? JSON.stringify(tags) : tags;
  
  const stmt = db.prepare(`
    INSERT INTO project_tags (project_key, tags, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(project_key) DO UPDATE SET tags = ?, updated_at = datetime('now')
  `);
  
  stmt.run(key, tagsJson, tagsJson);
  return true;
}

function getProjectTags(key) {
  if (!key) return null;
  
  const stmt = db.prepare('SELECT tags FROM project_tags WHERE project_key = ?');
  const row = stmt.get(key);
  
  return row ? JSON.parse(row.tags) : null;
}

function getAllProjectTags() {
  const stmt = db.prepare('SELECT project_key, tags FROM project_tags');
  const rows = stmt.all();
  
  const map = {};
  rows.forEach(row => {
    map[row.project_key] = JSON.parse(row.tags);
  });
  
  return map;
}

// ====================
// GitHub Projects Cache (kept in memory for performance)
// ====================

const memory = {
  projects: {},
  messages: {},
  games: {}
};

async function saveProjects(user, projects) {
  memory.projects[user] = projects;
  return projects;
}

async function getProjects(user) {
  return memory.projects[user] || [];
}

// ====================
// Messages & Games (kept in memory for real-time features)
// ====================

async function saveMessage(room, message) {
  memory.messages[room] = memory.messages[room] || [];
  const id = uuidv4();
  const entry = { id, ...message };
  memory.messages[room].unshift(entry);
  memory.messages[room] = memory.messages[room].slice(0, 500);
  return entry;
}

async function getMessages(room, opts = { limit: 100 }) {
  const arr = memory.messages[room] || [];
  return arr.slice(0, opts.limit).reverse();
}

async function saveGame(game) {
  const id = game.id || uuidv4();
  memory.games[id] = { ...game, id };
  return memory.games[id];
}

async function getGame(id) {
  if (!id) return null;
  return memory.games[id] || null;
}

// ====================
// Exports
// ====================

module.exports = {
  // Manual projects
  createManualProject: async (project) => createManualProject(project),
  getManualProjects: async () => getManualProjects(),
  updateManualProject: async (id, patch) => updateManualProject(id, patch),
  deleteManualProject: async (id) => deleteManualProject(id),
  
  // Project visibility
  setProjectVisibility: async (key, visible) => setProjectVisibility(key, visible),
  getProjectVisibility: async (key) => getProjectVisibility(key),
  getAllVisibilities: async () => getAllVisibilities(),
  
  // Project tags
  setProjectTags: async (key, tags) => setProjectTags(key, tags),
  getProjectTags: async (key) => getProjectTags(key),
  getAllProjectTags: async () => getAllProjectTags(),
  
  // Images
  saveImage: async (project, imageMeta) => saveImage(project, imageMeta),
  getImages: async (project) => getImages(project),
  getAllImages: async () => getAllImages(),
  removeImageByFilename: async (filename) => removeImageByFilename(filename),
  updateImageMetadata: async (filename, updates) => updateImageMetadata(filename, updates),
  clearPrimaryForProject: async (project) => clearPrimaryForProject(project),
  
  // GitHub projects cache (in-memory)
  saveProjects,
  getProjects,
  
  // Messages & Games (in-memory for real-time)
  saveMessage,
  getMessages,
  saveGame,
  getGame
};
