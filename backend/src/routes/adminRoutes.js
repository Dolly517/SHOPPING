const express = require('express');
const router = express.Router();
const {
  getDashboard, adminGetProducts, createProduct, updateProduct, deleteProduct,
  adminGetOrders, updateOrderStatus, adminGetUsers, updateUserRole, deleteUser, upload,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.use(protect, admin);

router.get('/dashboard', getDashboard);

router.get('/products', adminGetProducts);
router.post('/products', upload.single('image'), createProduct);
router.put('/products/:id', upload.single('image'), updateProduct);
router.delete('/products/:id', deleteProduct);

router.get('/orders', adminGetOrders);
router.put('/orders/:id', updateOrderStatus);

router.get('/users', adminGetUsers);
router.put('/users/:id', updateUserRole);
router.delete('/users/:id', deleteUser);

module.exports = router;
