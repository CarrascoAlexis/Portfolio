const Redis = require('ioredis');
const { v4: uuidv4 } = require('uuid');

let redisClient = null;
const useRedis = !!process.env.REDIS_URL;

if (useRedis) {
  try {
    redisClient = new Redis(process.env.REDIS_URL);
    redisClient.on('error', (e) => console.error('Redis error', e));
    console.log('Storage: using Redis');
  } catch (err) {
    console.warn('Failed to connect to Redis, falling back to memory', err.message);
    redisClient = null;
  }
} else {
  console.log('Storage: using in-memory fallback (development)');
}

// In-memory store fallback
const memory = {
  messages: {},
  games: {}
};

// images cache (in-memory fallback)
memory.images = {};

// add projects cache to memory storage
memory.projects = {};
// manual projects (admin-created)
memory.manualProjects = [];
// visibility map: key -> boolean (e.g. 'github:owner/repo' or 'manual:<id>')
memory.visibility = {};

async function saveMessage(room, message) {
  if (redisClient) {
    const key = `messages:${room}`;
    const id = uuidv4();
    const entry = JSON.stringify({ id, ...message });
    await redisClient.lpush(key, entry);
    await redisClient.ltrim(key, 0, 499); // keep last 500
    return { id, ...message };
  }

  memory.messages[room] = memory.messages[room] || [];
  const id = uuidv4();
  const entry = { id, ...message };
  memory.messages[room].unshift(entry);
  memory.messages[room] = memory.messages[room].slice(0, 500);
  return entry;
}

async function getMessages(room, opts = { limit: 100 }) {
  if (redisClient) {
    const key = `messages:${room}`;
    const vals = await redisClient.lrange(key, 0, (opts.limit || 100) - 1);
    return vals.map((v) => JSON.parse(v)).reverse();
  }

  const arr = memory.messages[room] || [];
  return arr.slice(0, opts.limit).reverse();
}

async function saveGame(game) {
  const id = game.id || uuidv4();
  if (redisClient) {
    const key = `game:${id}`;
    await redisClient.set(key, JSON.stringify({ ...game, id }));
    return { ...game, id };
  }
  memory.games[id] = { ...game, id };
  return memory.games[id];
}

async function getGame(id) {
  if (!id) return null;
  if (redisClient) {
    const key = `game:${id}`;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  }
  return memory.games[id] || null;
}

module.exports = {
  saveMessage,
  getMessages,
  saveGame,
  getGame,
  // projects
  saveProjects: async (user, projects) => {
    if (redisClient) {
      const key = `projects:${user}`;
      await redisClient.set(key, JSON.stringify(projects));
      return projects;
    }
    memory.projects[user] = projects;
    return memory.projects[user];
  },
  getProjects: async (user) => {
    if (!user) return [];
    if (redisClient) {
      const key = `projects:${user}`;
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : [];
    }
    return memory.projects[user] || [];
  }
  ,
  // manual projects (admin managed)
  createManualProject: async (project) => {
    const id = project.id || uuidv4();
    const entry = { id, ...project };
    if (redisClient) {
      const key = `projects:manual`;
      const data = await redisClient.get(key) || '[]';
      const arr = JSON.parse(data);
      arr.unshift(entry);
      await redisClient.set(key, JSON.stringify(arr));
      return entry;
    }
    memory.manualProjects.unshift(entry);
    return entry;
  },
  getManualProjects: async () => {
    if (redisClient) {
      const key = `projects:manual`;
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : [];
    }
    return memory.manualProjects;
  },
  updateManualProject: async (id, patch) => {
    if (redisClient) {
      const key = `projects:manual`;
      const data = await redisClient.get(key) || '[]';
      const arr = JSON.parse(data);
      const idx = arr.findIndex(p => p.id === id);
      if (idx === -1) return null;
      arr[idx] = { ...arr[idx], ...patch };
      await redisClient.set(key, JSON.stringify(arr));
      return arr[idx];
    }
    const idx = memory.manualProjects.findIndex(p => p.id === id);
    if (idx === -1) return null;
    memory.manualProjects[idx] = { ...memory.manualProjects[idx], ...patch };
    return memory.manualProjects[idx];
  },
  deleteManualProject: async (id) => {
    if (redisClient) {
      const key = `projects:manual`;
      const data = await redisClient.get(key) || '[]';
      let arr = JSON.parse(data);
      const before = arr.length;
      arr = arr.filter(p => p.id !== id);
      await redisClient.set(key, JSON.stringify(arr));
      return arr.length < before;
    }
    const before = memory.manualProjects.length;
    memory.manualProjects = memory.manualProjects.filter(p => p.id !== id);
    return memory.manualProjects.length < before;
  },
  // visibility map
  setProjectVisibility: async (key, visible) => {
    if (!key) return false;
    if (redisClient) {
      const k = `visibility`;
      const data = await redisClient.get(k) || '{}';
      const map = JSON.parse(data);
      map[key] = !!visible;
      await redisClient.set(k, JSON.stringify(map));
      return true;
    }
    memory.visibility[key] = !!visible;
    return true;
  },
  getProjectVisibility: async (key) => {
    if (!key) return null;
    if (redisClient) {
      const k = `visibility`;
      const data = await redisClient.get(k) || '{}';
      const map = JSON.parse(data);
      return map.hasOwnProperty(key) ? map[key] : null;
    }
    return memory.visibility.hasOwnProperty(key) ? memory.visibility[key] : null;
  },
  getAllVisibilities: async () => {
    if (redisClient) {
      const k = `visibility`;
      const data = await redisClient.get(k) || '{}';
      return JSON.parse(data);
    }
    return { ...memory.visibility };
  },
  // images
  saveImage: async (project, imageMeta) => {
    if (redisClient) {
      const key = `images:${project || 'global'}`;
      const list = JSON.stringify(imageMeta);
      await redisClient.lpush(key, list);
      await redisClient.ltrim(key, 0, 499);
      return imageMeta;
    }
    const key = project || 'global';
    memory.images[key] = memory.images[key] || [];
    memory.images[key].unshift(imageMeta);
    memory.images[key] = memory.images[key].slice(0, 500);
    return imageMeta;
  },
  getImages: async (project) => {
    const key = project || 'global';
    if (redisClient) {
      const redisKey = `images:${key}`;
      const vals = await redisClient.lrange(redisKey, 0, 499);
      return vals.map(v => JSON.parse(v)).reverse();
    }
    return (memory.images[key] || []).slice().reverse();
  },
  removeImageByFilename: async (filename) => {
    if (!filename) return false;
    if (redisClient) {
      // remove from all keys that match images:*
      const keys = await redisClient.keys('images:*');
      for (const k of keys) {
        const vals = await redisClient.lrange(k, 0, 499);
        const filtered = vals.map(v => JSON.parse(v)).filter(i => i.filename !== filename);
        await redisClient.set(k, JSON.stringify(filtered));
      }
      return true;
    }
    Object.keys(memory.images).forEach(k => {
      memory.images[k] = (memory.images[k] || []).filter(i => i.filename !== filename);
    });
    return true;
  },

  updateImageMetadata: async (filename, updates) => {
    if (!filename) return false;
    if (redisClient) {
      const keys = await redisClient.keys('images:*');
      for (const k of keys) {
        const vals = await redisClient.lrange(k, 0, 499);
        const items = vals.map(v => JSON.parse(v));
        const found = items.find(i => i.filename === filename);
        if (found) {
          Object.assign(found, updates);
          // remove from old location
          await redisClient.del(k);
          // re-add to correct location if project changed
          const newKey = `images:${updates.project || 'global'}`;
          await redisClient.lpush(newKey, JSON.stringify(found));
        }
      }
      return true;
    }
    // In-memory: find and update across all keys
    Object.keys(memory.images).forEach(k => {
      const found = (memory.images[k] || []).find(i => i.filename === filename);
      if (found) {
        Object.assign(found, updates);
        // if project changed, move to correct key
        if (updates.project !== undefined) {
          memory.images[k] = (memory.images[k] || []).filter(i => i.filename !== filename);
          const newKey = updates.project || 'global';
          memory.images[newKey] = memory.images[newKey] || [];
          memory.images[newKey].unshift(found);
        }
      }
    });
    return true;
  },

  getAllImages: async () => {
    // Return all images across all projects
    if (redisClient) {
      const keys = await redisClient.keys('images:*');
      const allImages = [];
      for (const k of keys) {
        const vals = await redisClient.lrange(k, 0, 499);
        allImages.push(...vals.map(v => JSON.parse(v)));
      }
      return allImages;
    }
    // In-memory: collect from all keys
    const allImages = [];
    Object.keys(memory.images).forEach(k => {
      allImages.push(...(memory.images[k] || []));
    });
    return allImages;
  },

  clearPrimaryForProject: async (project) => {
    // Clear isPrimary flag for all images of this project
    if (redisClient) {
      const key = `images:${project}`;
      const vals = await redisClient.lrange(key, 0, 499);
      const items = vals.map(v => JSON.parse(v));
      await redisClient.del(key);
      for (const item of items) {
        item.isPrimary = false;
        await redisClient.lpush(key, JSON.stringify(item));
      }
      return true;
    }
    // In-memory
    const imgs = memory.images[project] || [];
    imgs.forEach(img => { img.isPrimary = false; });
    return true;
  }
};
