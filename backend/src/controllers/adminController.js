const asyncHandler = require('express-async-handler');
const { Op, fn, col } = require('sequelize');
const { User, Product, Order, OrderItem } = require('../models');
const multer = require('multer');
const path = require('path');

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ===== DASHBOARD (Fixed Revenue Logic) =====
const getDashboard = asyncHandler(async (req, res) => {
  const totalUsers = await User.count({ where: { role: 'user' } });
  const totalOrders = await Order.count();
  const totalProducts = await Product.count();

  // HYBRID REVENUE LOGIC:
  // 1. Sum if paymentStatus is 'paid' (Online payments)
  // 2. OR if status is 'delivered' (COD payments collected)
  const revenueResult = await Order.findAll({
    attributes: [[fn('SUM', col('totalPrice')), 'revenue']],
    where: {
      [Op.or]: [
        { paymentStatus: 'paid' },
        { status: 'delivered' }
      ]
    },
    raw: true,
  });

  const totalRevenue = parseFloat(revenueResult[0]?.revenue || 0);

  const recentOrders = await Order.findAll({
    limit: 5,
    order: [['createdAt', 'DESC']],
    include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
  });

  const ordersByStatus = await Order.findAll({
    attributes: ['status', [fn('COUNT', col('id')), 'count']],
    group: ['status'],
    raw: true,
  });

  res.json({ totalUsers, totalOrders, totalProducts, totalRevenue, recentOrders, ordersByStatus });
});

// ===== PRODUCTS =====
const adminGetProducts = asyncHandler(async (req, res) => {
  const pageSize = parseInt(req.query.pageSize) || 20;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * pageSize;

  const where = {};
  if (req.query.keyword) {
    where.name = { [Op.like]: `%${req.query.keyword}%` };
  }

  const { count, rows: products } = await Product.findAndCountAll({
    where,
    limit: pageSize,
    offset,
    order: [['createdAt', 'DESC']],
  });
  res.json({ products, page, pages: Math.ceil(count / pageSize), total: count });
});

const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, stock, category, brand, featured, isCustomizable, customSettings, customImageLinks } = req.body;
  const image = req.files?.image?.[0] 
    ? `/uploads/${req.files.image[0].filename}` 
    : (req.body.image || '');
  
  // Handle custom reference images
  const uploadedCustomImages = req.files?.customImages 
    ? req.files.customImages.map(f => `/uploads/${f.filename}`)
    : [];

  let linkedCustomImages = [];
  if (customImageLinks) {
    try {
      const parsed = JSON.parse(customImageLinks);
      if (Array.isArray(parsed)) {
        linkedCustomImages = parsed.filter((img) =>
          typeof img === 'string' && (/^https?:\/\//i.test(img) || img.startsWith('/uploads/'))
        );
      }
    } catch (error) {
      linkedCustomImages = [];
    }
  }

  const customImages = [...linkedCustomImages, ...uploadedCustomImages].slice(0, 5);

  const product = await Product.create({
    name, 
    description, 
    price: parseFloat(price), 
    stock: parseInt(stock),
    category, 
    brand, 
    featured: featured === 'true' || featured === true,
    image,
    isCustomizable: isCustomizable === 'true' || isCustomizable === true,
    customImages: customImages.length > 0 ? customImages : null,
  });
  res.status(201).json(product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  const { name, description, price, stock, category, brand, featured, isCustomizable, customSettings, customImageLinks } = req.body;
  const image = req.files?.image?.[0] 
    ? `/uploads/${req.files.image[0].filename}` 
    : (req.body.image || product.image);
  
  // Handle custom reference images updates
  let linkedCustomImages = [];
  if (customImageLinks) {
    try {
      const parsed = JSON.parse(customImageLinks);
      if (Array.isArray(parsed)) {
        linkedCustomImages = parsed.filter((img) =>
          typeof img === 'string' && (/^https?:\/\//i.test(img) || img.startsWith('/uploads/'))
        );
      }
    } catch (error) {
      linkedCustomImages = [];
    }
  }

  const uploadedCustomImages = req.files?.customImages
    ? req.files.customImages.map(f => `/uploads/${f.filename}`)
    : [];

  const customImages = [...linkedCustomImages, ...uploadedCustomImages].slice(0, 5);
  
  product.name = name || product.name;
  product.description = description !== undefined ? description : product.description;
  product.price = price !== undefined ? parseFloat(price) : product.price;
  product.stock = stock !== undefined ? parseInt(stock) : product.stock;
  product.category = category || product.category;
  product.brand = brand !== undefined ? brand : product.brand;
  product.featured = featured !== undefined ? (featured === 'true' || featured === true) : product.featured;
  product.image = image;
  product.isCustomizable = isCustomizable !== undefined ? (isCustomizable === 'true' || isCustomizable === true) : product.isCustomizable;
  product.customImages = customImages.length > 0 ? customImages : null;
  
  await product.save();
  res.json(product);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  await product.destroy();
  res.json({ message: 'Product removed' });
});

// ===== ORDERS =====
const adminGetOrders = asyncHandler(async (req, res) => {
  const pageSize = parseInt(req.query.pageSize) || 20;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * pageSize;
  const where = {};
  if (req.query.status) where.status = req.query.status;
  const { count, rows: orders } = await Order.findAndCountAll({
    where,
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      { model: OrderItem, as: 'orderItems' },
    ],
    limit: pageSize,
    offset,
    order: [['createdAt', 'DESC']],
  });
  res.json({ orders, page, pages: Math.ceil(count / pageSize), total: count });
});

// @desc    Update order status (COD Support Added)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }

  const newStatus = req.body.status || order.status;
  order.status = newStatus;

  // 🔥 COD Logic Fix:
  // Jab order deliver ho jaye, tab use Paid mark kar do
  if (newStatus === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = new Date();
    order.paymentStatus = 'paid'; 
    order.isPaid = true;
    order.paidAt = new Date();
  }

  await order.save();
  res.json(order);
});

// ===== USERS =====
const adminGetUsers = asyncHandler(async (req, res) => {
  const pageSize = parseInt(req.query.pageSize) || 20;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * pageSize;
  const { count, rows: users } = await User.findAndCountAll({
    attributes: { exclude: ['password'] },
    limit: pageSize,
    offset,
    order: [['createdAt', 'DESC']],
  });
  res.json({ users, page, pages: Math.ceil(count / pageSize), total: count });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
  if (!user) { res.status(404); throw new Error('User not found'); }
  user.role = req.body.role || user.role;
  await user.save();
  res.json(user);
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  await user.destroy();
  res.json({ message: 'User removed' });
});

module.exports = {
  getDashboard, adminGetProducts, createProduct, updateProduct, deleteProduct,
  adminGetOrders, updateOrderStatus, adminGetUsers, updateUserRole, deleteUser, upload,
};