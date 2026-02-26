const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById, createPaymentIntent, updateOrderToPaid } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/', createOrder);
router.get('/myorders', getMyOrders);
router.post('/payment-intent', createPaymentIntent);
router.get('/:id', getOrderById);
router.put('/:id/pay', updateOrderToPaid);

module.exports = router;
