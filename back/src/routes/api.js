const { Router } = require('express');
const messageController = require('../controllers/messageController');

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true }));

router.get('/messages', messageController.list);

module.exports = router;
