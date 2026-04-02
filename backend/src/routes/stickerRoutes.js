const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, admin } = require('../middleware/auth');
const {
  getAllStickers,
  getAdminStickers,
  uploadSticker,
  createStickerFromUrl,
  updateSticker,
  deleteSticker,
} = require('../controllers/stickerController');

const router = express.Router();

// Ensure uploads directory exists
const stickerUploadDir = path.join(__dirname, '..', '..', 'uploads', 'stickers');
if (!fs.existsSync(stickerUploadDir)) {
  fs.mkdirSync(stickerUploadDir, { recursive: true });
}

// Configure multer for sticker uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, stickerUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `sticker-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp, svg)'));
  },
});

// Public routes
router.get('/', getAllStickers);

// Admin routes
router.get('/admin/all', protect, admin, getAdminStickers);
router.post('/admin/upload', protect, admin, upload.single('image'), uploadSticker);
router.post('/admin/url', protect, admin, createStickerFromUrl);
router.put('/admin/:id', protect, admin, updateSticker);
router.delete('/admin/:id', protect, admin, deleteSticker);

module.exports = router;
