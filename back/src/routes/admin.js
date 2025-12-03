const { Router } = require('express');
const { requireAdmin } = require('../middleware/auth');
const adminAuth = require('../controllers/adminAuthController');
const storage = require('../services/storage');
const path = require('path');
const fs = require('fs');

const router = Router();

// Note: admin routes are mounted at /api/admin

router.post('/login', adminAuth.login);
router.post('/logout', adminAuth.logout);
router.get('/me', requireAdmin, adminAuth.me);

// Projects management (manual projects)
router.get('/projects/manual', requireAdmin, async (req, res) => {
  const list = await storage.getManualProjects();
  res.json({ ok: true, projects: list });
});

router.post('/projects/manual', requireAdmin, async (req, res) => {
  const data = req.body || {};
  const created = await storage.createManualProject(data);
  res.json({ ok: true, project: created });
});

router.put('/projects/manual/:id', requireAdmin, async (req, res) => {
  const id = req.params.id;
  const data = req.body || {};
  const updated = await storage.updateManualProject(id, data);
  res.json({ ok: true, project: updated });
});

router.delete('/projects/manual/:id', requireAdmin, async (req, res) => {
  const id = req.params.id;
  const ok = await storage.deleteManualProject(id);
  res.json({ ok: true, deleted: ok });
});

// Images management
router.get('/images', requireAdmin, async (req, res) => {
  const project = req.query.project || null;
  const images = await storage.getImages(project);
  res.json({ ok: true, images });
});

router.delete('/images/:filename', requireAdmin, async (req, res) => {
  try {
    const filename = req.params.filename;
    const uploads = path.join(__dirname, '..', '..', 'uploads');
    const filePath = path.join(uploads, filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await storage.removeImageByFilename(filename);
    res.json({ ok: true });
  } catch (err) {
    console.error('admin delete image error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
