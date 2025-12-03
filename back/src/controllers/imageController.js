const path = require('path');
const fs = require('fs');
const multer = require('multer');
const storageService = require('../services/storage');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  }
});

const upload = multer({ storage: diskStorage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

async function uploadImage(req, res) {
  // multer has already processed the file
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ ok: false, error: 'No file uploaded' });
    const project = req.body.project || req.query.project || null;
    const urlPath = `/uploads/${file.filename}`;
    const meta = {
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      url: urlPath,
      project,
      uploaded_at: new Date().toISOString()
    };
    await storageService.saveImage(project, meta);
    res.json({ ok: true, image: meta });
  } catch (err) {
    console.error('imageController.uploadImage error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
}

async function listImages(req, res) {
  try {
    const project = req.query.project || null;
    const images = await storageService.getImages(project);
    res.json({ ok: true, images });
  } catch (err) {
    console.error('imageController.listImages error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
}

module.exports = {
  uploadMiddleware: upload.single('file'),
  uploadImage,
  listImages
};
