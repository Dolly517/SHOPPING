const asyncHandler = require('express-async-handler');
const { CustomProduct, SavedDesign, Product } = require('../models');
const { getCustomizationConfig } = require('../utils/customizationRules');

// @desc    Get customization data for a product
// @route   GET /api/custom/products/:productId
// @access  Public
const getCustomProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const customProduct = await CustomProduct.findOne({
    where: { baseProductId: req.params.productId },
    include: [{ model: Product, as: 'baseProduct' }],
  });

  const ruleConfig = getCustomizationConfig(product);
  const isCustomizationEnabled = Boolean(product.isCustomizable);

  if (!isCustomizationEnabled) {
    res.status(403);
    throw new Error('Customization is not available for this product');
  }

  // Rule-based config is the source of truth for what user can edit.
  // DB values are merged for data that can be admin-managed in future.
  const response = {
    id: customProduct?.id || null,
    baseProductId: Number(req.params.productId),
    model3DUrl: customProduct?.model3DUrl || '',
    availableColors: ruleConfig.availableColors,
    allowColorChange: ruleConfig.allowColorChange,
    supportsText: ruleConfig.supportsText,
    supportsImageUpload: ruleConfig.supportsImageUpload,
    maxImages: ruleConfig.maxImages,
    stickerPresets: ruleConfig.stickerPresets,
    canCustomize: isCustomizationEnabled,
  };

  res.json(response);
});

// @desc    Save a custom design
// @route   POST /api/custom/save
// @access  Private
const saveDesign = asyncHandler(async (req, res) => {
  const { productId, designData, previewImage, name } = req.body;

  if (!productId || !designData) {
    res.status(400);
    throw new Error('productId and designData are required');
  }

  const product = await Product.findByPk(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const design = await SavedDesign.create({
    userId: req.user.id,
    productId,
    designData,
    previewImage: previewImage || '',
    name: name || 'Untitled Design',
  });

  res.status(201).json(design);
});

// @desc    Get user's saved designs
// @route   GET /api/custom/user/designs
// @access  Private
const getUserDesigns = asyncHandler(async (req, res) => {
  const designs = await SavedDesign.findAll({
    where: { userId: req.user.id },
    include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'image', 'customImages'] }],
    order: [['createdAt', 'DESC']],
  });

  res.json(designs);
});

// @desc    Get one saved design for current user
// @route   GET /api/custom/design/:id
// @access  Private
const getDesignById = asyncHandler(async (req, res) => {
  const design = await SavedDesign.findOne({
    where: { id: req.params.id, userId: req.user.id },
    include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'image', 'customImages'] }],
  });

  if (!design) {
    res.status(404);
    throw new Error('Design not found');
  }

  res.json(design);
});

// @desc    Delete one saved design for current user
// @route   DELETE /api/custom/design/:id
// @access  Private
const deleteDesign = asyncHandler(async (req, res) => {
  const design = await SavedDesign.findOne({
    where: { id: req.params.id, userId: req.user.id },
  });

  if (!design) {
    res.status(404);
    throw new Error('Design not found');
  }

  await design.destroy();
  res.json({ message: 'Design deleted successfully' });
});

// @desc    Upload an image for custom design
// @route   POST /api/custom/upload
// @access  Private
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/custom/${req.file.filename}`;
  res.json({ url: fileUrl });
});

module.exports = {
  getCustomProduct,
  saveDesign,
  getUserDesigns,
  getDesignById,
  deleteDesign,
  uploadImage,
};
