const { Router } = require('express');
const messageController = require('../controllers/messageController');
const projectController = require('../controllers/projectController');
const imageController = require('../controllers/imageController');

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true }));

router.get('/messages', messageController.list);
router.get('/projects', projectController.list);
// public manual projects (admin can still manage them under /api/admin)
router.get('/projects/manual', async (req, res) => {
	try {
		const storage = require('../services/storage');
		const projects = await storage.getManualProjects();
		res.json({ ok: true, projects });
	} catch (err) {
		console.error('projects/manual error', err);
		res.status(500).json({ ok: false, error: err.message });
	}
});

// visibility public endpoints
router.get('/projects/visibility', async (req, res) => {
	try {
		const storage = require('../services/storage');
		const project = req.query.project;
		if (project) {
			const val = await storage.getProjectVisibility(project);
			return res.json({ ok: true, project, visible: val });
		}
		const all = await storage.getAllVisibilities();
		res.json({ ok: true, visibility: all });
	} catch (err) {
		console.error('projects/visibility error', err);
		res.status(500).json({ ok: false, error: err.message });
	}
});
// images
router.post('/images', imageController.uploadMiddleware, imageController.uploadImage);
router.get('/images', imageController.listImages);

// Note: admin routes are mounted in routes/admin.js (under /api/admin)

module.exports = router;
