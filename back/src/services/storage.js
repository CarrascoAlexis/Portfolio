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
};
