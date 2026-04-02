const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const { Product, Review, User } = require('../models');

// @desc    Get all products with filtering & pagination
// @route   GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = parseInt(req.query.pageSize) || 12;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * pageSize;

  const where = {};
  if (req.query.keyword) {
    where[Op.or] = [
      { name: { [Op.like]: `%${req.query.keyword}%` } },
      { description: { [Op.like]: `%${req.query.keyword}%` } },
    ];
  }
  if (req.query.category) {
    if (req.query.category === 'Customizable') {
      where.isCustomizable = true;
    } else {
      where.category = req.query.category;
    }
  }
  if (req.query.customizable !== undefined) {
    const customizableFlag = String(req.query.customizable).toLowerCase();
    if (customizableFlag === 'true' || customizableFlag === '1') {
      where.isCustomizable = true;
    } else if (customizableFlag === 'false' || customizableFlag === '0') {
      where.isCustomizable = false;
    }
  }
  if (req.query.minPrice || req.query.maxPrice) {
    where.price = {};
    if (req.query.minPrice) where.price[Op.gte] = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) where.price[Op.lte] = parseFloat(req.query.maxPrice);
  }

  const { count, rows: products } = await Product.findAndCountAll({
    where,
    limit: pageSize,
    offset,
    order: [[req.query.sortBy || 'createdAt', req.query.order || 'DESC']],
  });

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id, {
    include: [
      {
        model: Review,
        as: 'reviews',
        include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }],
      },
    ],
  });
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get product categories
// @route   GET /api/products/categories
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.findAll({
    attributes: ['category'],
    group: ['category'],
    raw: true,
  });
  res.json(categories.map((c) => c.category));
});

// @desc    Create product review
// @route   POST /api/products/:id/reviews
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment, title } = req.body;
  const product = await Product.findByPk(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const alreadyReviewed = await Review.findOne({
    where: { productId: req.params.id, userId: req.user.id },
  });
  if (alreadyReviewed) {
    res.status(400);
    throw new Error('Product already reviewed');
  }

  await Review.create({
    rating: Number(rating),
    comment,
    title,
    userId: req.user.id,
    productId: req.params.id,
  });

  const reviews = await Review.findAll({ where: { productId: req.params.id } });
  product.numReviews = reviews.length;
  product.rating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  await product.save();

  res.status(201).json({ message: 'Review added' });
});

// @desc    Get featured products
// @route   GET /api/products/featured
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.findAll({
    where: { featured: true },
    limit: 8,
    order: [['createdAt', 'DESC']],
  });
  res.json(products);
});

module.exports = {
  getProducts,
  getProductById,
  getCategories,
  createProductReview,
  getFeaturedProducts,
};
