const asyncHandler = require('express-async-handler');
const { Order, OrderItem, Product, Cart, CartItem, User } = require('../models');
const { sendOrderConfirmationEmail } = require('../utils/emailService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// @desc    Create new order
// @route   POST /api/orders
const createOrder = asyncHandler(async (req, res) => {
  const { 
    orderItems, 
    shippingAddress, 
    paymentMethod, 
    itemsPrice, 
    taxPrice, 
    shippingPrice, 
    totalPrice 
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Order creation with initial 'pending' status
  const order = await Order.create({
    userId: req.user.id,
    totalPrice: parseFloat(totalPrice),
    taxPrice: taxPrice || 0,
    shippingPrice: shippingPrice || 0,
    paymentMethod: paymentMethod || 'stripe',
    shippingAddress,
    status: 'pending',
    paymentStatus: 'pending', 
    isPaid: false
  });

  // Create individual order items & manage stock
  for (const item of orderItems) {
    await OrderItem.create({
      orderId: order.id,
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.image,
      customization: item.customization || null, // Store customization data
    });
    
    const product = await Product.findByPk(item.productId);
    if (product) {
      product.stock = Math.max(0, product.stock - item.quantity);
      await product.save();
    }
  }

  // Clear user's cart after successful order placement
  const cart = await Cart.findOne({ where: { userId: req.user.id } });
  if (cart) await CartItem.destroy({ where: { cartId: cart.id } });

  const createdOrder = await Order.findByPk(order.id, {
    include: [{ model: OrderItem, as: 'orderItems' }],
  });

  // Send order confirmation email asynchronously
  setTimeout(async () => {
    try {
      await sendOrderConfirmationEmail(req.user.email, req.user.name, createdOrder);
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
    }
  }, 500);

  res.status(201).json(createdOrder);
});

// @desc    Get logged in user orders
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
  
  // Authorization check
  if (order.userId !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json(order);
});

// @desc    Create Stripe payment intent (INR Fix)
// @route   POST /api/orders/payment-intent
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  
  // Convert amount to Paise (Stripe standard for INR)
  // No EX_RATE used here to avoid price corruption
  const amountInPaise = Math.round(parseFloat(amount) * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInPaise,
    currency: 'inr',
    metadata: { 
      userId: req.user.id.toString(),
      order_type: 'ecommerce_order'
    },
  });

  res.json({ clientSecret: paymentIntent.client_secret });
});

// @desc    Update order to paid (Triggered after successful Card Payment)
// @route   PUT /api/orders/:id/pay
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Update payment flags instantly for Online payments
  order.isPaid = true;
  order.paidAt = new Date();
  order.paymentStatus = 'paid'; 
  order.stripePaymentId = req.body.paymentIntentId || '';
  order.status = 'processing'; // Moves from pending to processing

  const updatedOrder = await order.save();
  res.json(updatedOrder);
});

module.exports = { 
  createOrder, 
  getMyOrders, 
  getOrderById, 
  createPaymentIntent, 
  updateOrderToPaid 
};