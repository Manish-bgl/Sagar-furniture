// server/src/routes/upload.js
// Image upload — Cloudinary signed uploads via backend (admin only)
import { Router } from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { verifyAuth, requireAdmin } from '../middleware/auth.js';
import { uploadRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Multer config — store in memory (upload to Cloudinary, not disk)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max per file
    files: 3, // Max 3 files at once
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

/**
 * Helper: Upload buffer to Cloudinary
 * Returns { url, publicId }
 */
const uploadToCloudinary = (fileBuffer, originalName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'sagar-furniture',
        resource_type: 'image',
        // Auto-generate a unique public_id based on original filename
        public_id: originalName
          ? originalName.replace(/\.[^/.]+$/, '') + '_' + Date.now()
          : 'img_' + Date.now(),
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// -------------------------------------------------------
// 📸 POST /api/upload — Upload single image (admin only)
// -------------------------------------------------------
router.post('/', uploadRateLimiter, verifyAuth, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
    res.json({ url: result.url, publicId: result.publicId });
  } catch (err) {
    console.error('Error uploading image:', err);
    res.status(500).json({ error: 'Image upload failed: ' + err.message });
  }
});

// -------------------------------------------------------
// 📸 POST /api/upload/multiple — Upload multiple images (admin only)
// -------------------------------------------------------
router.post('/multiple', uploadRateLimiter, verifyAuth, requireAdmin, upload.array('images', 3), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files provided' });
    }

    const results = [];
    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer, file.originalname);
      results.push(result);
    }

    res.json({
      uploads: results,
      urls: results.map((r) => r.url),
      publicIds: results.map((r) => r.publicId),
    });
  } catch (err) {
    console.error('Error uploading images:', err);
    res.status(500).json({ error: 'Image upload failed: ' + err.message });
  }
});

export default router;
