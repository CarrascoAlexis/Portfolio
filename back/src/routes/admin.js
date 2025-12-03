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
  // Admin endpoint returns ALL images (no filter)
  const images = await storage.getAllImages();
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

router.put('/images/:filename', requireAdmin, async (req, res) => {
  try {
    const filename = req.params.filename;
    const { project, isPrimary, deleteOthers } = req.body || {};
    const updates = { project: project || null };
    if (isPrimary !== undefined) {
      updates.isPrimary = !!isPrimary;
      // If setting as primary, unset other primary images for same project
      if (isPrimary && project) {
        await storage.clearPrimaryForProject(project);
        
        // If deleteOthers flag is set, delete all other images for this project
        if (deleteOthers) {
          const allImages = await storage.getAllImages();
          const otherImages = allImages.filter(img => 
            img.project === project && img.filename !== filename
          );
          
          const uploads = path.join(__dirname, '..', '..', 'uploads');
          for (const img of otherImages) {
            const filePath = path.join(uploads, img.filename);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
            await storage.removeImageByFilename(img.filename);
          }
        }
      }
    }
    await storage.updateImageMetadata(filename, updates);
    res.json({ ok: true });
  } catch (err) {
    console.error('admin update image error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// admin: set visibility for a project (key should be 'github:owner/repo' or 'manual:<id>')
router.post('/visibility', requireAdmin, async (req, res) => {
  try {
    const { project, visible } = req.body || {};
    if (!project) return res.status(400).json({ ok: false, error: 'project required' });
    const storage = require('../services/storage');
    await storage.setProjectVisibility(project, !!visible);
    res.json({ ok: true, project, visible: !!visible });
  } catch (err) {
    console.error('admin set visibility error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
