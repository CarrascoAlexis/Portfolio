const { Router } = require('express');
const messageController = require('../controllers/messageController');
const projectController = require('../controllers/projectController');
const imageController = require('../controllers/imageController');

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true }));

router.get('/messages', messageController.list);
router.get('/projects', projectController.list);
// images
router.post('/images', imageController.uploadMiddleware, imageController.uploadImage);
router.get('/images', imageController.listImages);

// Note: admin routes are mounted in routes/admin.js (under /api/admin)

module.exports = router;
