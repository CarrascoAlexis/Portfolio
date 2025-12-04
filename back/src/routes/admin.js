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
    console.log(`[PUT /images/${filename}] project=${project}, isPrimary=${isPrimary}, deleteOthers=${deleteOthers}`);
    const updates = { project: project || null };
    if (isPrimary !== undefined) {
      updates.isPrimary = !!isPrimary;
      // If setting as primary, unset other primary images for same project
      if (isPrimary && project) {
        await storage.clearPrimaryForProject(project);
        
        // If deleteOthers flag is set, delete all other images for this project
        if (deleteOthers) {
          console.log(`[DELETE-OTHER-IMAGES] Deleting other images for project ${project}`);
          const allImages = await storage.getAllImages();
          const otherImages = allImages.filter(img => 
            img.project === project && img.filename !== filename
          );
          console.log(`[DELETE-OTHER-IMAGES] Found ${otherImages.length} images to delete:`, otherImages.map(i => i.filename));
          
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

// admin: set tags for a project (key should be 'github:owner/repo' or 'manual:<id>')
router.post('/tags', requireAdmin, async (req, res) => {
  try {
    const { project, tags } = req.body || {};
    if (!project) return res.status(400).json({ ok: false, error: 'project required' });
    if (!Array.isArray(tags)) return res.status(400).json({ ok: false, error: 'tags must be an array' });
    await storage.setProjectTags(project, tags);
    res.json({ ok: true, project, tags });
  } catch (err) {
    console.error('admin set tags error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// admin: update GitHub project metadata (description, technologies)
router.post('/projects/github/metadata', requireAdmin, async (req, res) => {
  try {
    const { projectKey, description, technologies, showReadme } = req.body;
    
    if (!projectKey) {
      return res.status(400).json({ ok: false, error: 'projectKey required' });
    }
    
    const metadata = {};
    if (description !== undefined) metadata.description = description;
    if (technologies !== undefined) metadata.technologies = technologies;
    if (showReadme !== undefined) metadata.showReadme = showReadme;
    
    await storage.setGitHubProjectMetadata(projectKey, metadata);
    
    res.json({ ok: true, message: 'Metadata updated' });
  } catch (err) {
    console.error('admin update github metadata error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
