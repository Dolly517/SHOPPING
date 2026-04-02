const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const {
  getCustomProduct,
  saveDesign,
  getUserDesigns,
  getDesignById,
  deleteDesign,
  uploadImage,
} = require('../controllers/customizationController');

const router = express.Router();

const customUploadDir = path.join(__dirname, '..', '..', 'uploads', 'custom');
if (!fs.existsSync(customUploadDir)) {
  fs.mkdirSync(customUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, customUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    return cb(new Error('Only images are allowed'));
  },
});

router.get('/products/:productId', getCustomProduct);
router.post('/save', protect, saveDesign);
router.get('/my-designs', protect, getUserDesigns);
router.get('/design/:id', protect, getDesignById);
router.delete('/design/:id', protect, deleteDesign);
router.get('/user/designs', protect, getUserDesigns);
router.post('/upload', protect, upload.single('image'), uploadImage);

module.exports = router;
