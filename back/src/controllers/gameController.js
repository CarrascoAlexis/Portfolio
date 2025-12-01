const storage = require('../services/storage');

async function getGame(req, res) {
  const id = req.params.id;
  try {
    const game = await storage.getGame(id);
    if (!game) return res.status(404).json({ ok: false });
    res.json({ ok: true, game });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

module.exports = { getGame };
