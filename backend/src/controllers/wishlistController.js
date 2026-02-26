const asyncHandler = require('express-async-handler');
const { Wishlist, Product } = require('../models');

// @desc    Get wishlist
// @route   GET /api/wishlist
const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findAll({
    where: { userId: req.user.id },
    include: [{ model: Product, as: 'product' }],
  });
  res.json(wishlist);
});

// @desc    Add to wishlist
// @route   POST /api/wishlist
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const existing = await Wishlist.findOne({ where: { userId: req.user.id, productId } });
  if (existing) {
    await existing.destroy();
    return res.json({ message: 'Removed from wishlist', inWishlist: false });
  }
  await Wishlist.create({ userId: req.user.id, productId });
  res.json({ message: 'Added to wishlist', inWishlist: true });
});

// @desc    Remove from wishlist
// @route   DELETE /api/wishlist/:productId
const removeFromWishlist = asyncHandler(async (req, res) => {
  await Wishlist.destroy({ where: { userId: req.user.id, productId: req.params.productId } });
  res.json({ message: 'Removed from wishlist' });
});

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
