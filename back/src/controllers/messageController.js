const storage = require('../services/storage');

async function list(req, res) {
  const room = req.query.room || 'global';
  try {
    const messages = await storage.getMessages(room, { limit: 100 });
    res.json({ ok: true, room, messages });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

module.exports = { list };
