const { Router } = require('express');
const messageController = require('../controllers/messageController');
const projectController = require('../controllers/projectController');

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true }));

router.get('/messages', messageController.list);
router.get('/projects', projectController.list);

module.exports = router;
