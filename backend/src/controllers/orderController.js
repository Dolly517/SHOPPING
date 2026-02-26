const asyncHandler = require('express-async-handler');
const { Order, OrderItem, Product, Cart, CartItem, User } = require('../models');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// @desc    Create order
// @route   POST /api/orders
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  const order = await Order.create({
    userId: req.user.id,
    totalPrice,
    taxPrice: taxPrice || 0,
    shippingPrice: shippingPrice || 0,
    paymentMethod: paymentMethod || 'stripe',
    shippingAddress,
    status: 'pending',
  });

  for (const item of orderItems) {
    await OrderItem.create({
      orderId: order.id,
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.image,
    });
    // Reduce stock
    const product = await Product.findByPk(item.productId);
    if (product) {
      product.stock = Math.max(0, product.stock - item.quantity);
      await product.save();
    }
  }

  // Clear cart
  const cart = await Cart.findOne({ where: { userId: req.user.id } });
  if (cart) await CartItem.destroy({ where: { cartId: cart.id } });

  const createdOrder = await Order.findByPk(order.id, {
    include: [{ model: OrderItem, as: 'orderItems' }],
  });
  res.status(201).json(createdOrder);
});

// @desc    Get user orders
// @route   GET /api/orders/myorders
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.findAll({
    where: { userId: req.user.id },
    include: [{ model: OrderItem, as: 'orderItems' }],
    order: [['createdAt', 'DESC']],
  });
  res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id, {
    include: [
      { model: OrderItem, as: 'orderItems' },
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
    ],
  });
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.userId !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }
  res.json(order);
});

// @desc    Create Stripe payment intent
// @route   POST /api/orders/payment-intent
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'usd',
    metadata: { userId: req.user.id.toString() },
  });
  res.json({ clientSecret: paymentIntent.client_secret });
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  order.isPaid = true;
  order.paidAt = new Date();
  order.paymentStatus = 'paid';
  order.stripePaymentId = req.body.paymentIntentId || '';
  order.status = 'processing';
  await order.save();
  res.json(order);
});

module.exports = { createOrder, getMyOrders, getOrderById, createPaymentIntent, updateOrderToPaid };
