const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getDashboard, adminGetProducts, createProduct, updateProduct, deleteProduct,
  adminGetOrders, updateOrderStatus, adminGetUsers, updateUserRole, deleteUser, upload,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

// Multer config for multiple file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
});
const uploadMulti = multer({ 
  storage, 
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = new Set(['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg', '.heic', '.heif', '.jfif']);
    const allowedMime = /^image\/(jpeg|jpg|png|gif|webp|svg\+xml|heic|heif|pjpeg)$/i.test(file.mimetype || '');

    if (allowedExts.has(ext) && allowedMime) {
      cb(null, true);
      return;
    }

    cb(new Error('Only image files are allowed (jpg, png, webp, gif, svg, heic, heif)'));
  }
});

router.use(protect, admin);

router.get('/dashboard', getDashboard);

router.get('/products', adminGetProducts);
router.post('/products', uploadMulti.fields([{ name: 'image', maxCount: 1 }, { name: 'customImages', maxCount: 5 }]), createProduct);
router.put('/products/:id', uploadMulti.fields([{ name: 'image', maxCount: 1 }, { name: 'customImages', maxCount: 5 }]), updateProduct);
router.delete('/products/:id', deleteProduct);

router.get('/orders', adminGetOrders);
router.put('/orders/:id', updateOrderStatus);

router.get('/users', adminGetUsers);
router.put('/users/:id', updateUserRole);
router.delete('/users/:id', deleteUser);

module.exports = router;
