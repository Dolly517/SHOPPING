const asyncHandler = require('express-async-handler');
const { Cart, CartItem, Product } = require('../models');

// @desc    Get user cart
// @route   GET /api/cart
const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({
    where: { userId: req.user.id },
    include: [
      {
        model: CartItem,
        as: 'cartItems',
        include: [{ model: Product, as: 'product' }],
      },
    ],
  });
  if (!cart) {
    cart = await Cart.create({ userId: req.user.id });
    cart = await Cart.findOne({
      where: { userId: req.user.id },
      include: [{ model: CartItem, as: 'cartItems', include: [{ model: Product, as: 'product' }] }],
    });
  }
  res.json(cart);
});

// @desc    Add item to cart
// @route   POST /api/cart
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const product = await Product.findByPk(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  if (product.stock < quantity) {
    res.status(400);
    throw new Error('Not enough stock');
  }

  let cart = await Cart.findOne({ where: { userId: req.user.id } });
  if (!cart) cart = await Cart.create({ userId: req.user.id });

  const existingItem = await CartItem.findOne({
    where: { cartId: cart.id, productId },
  });

  if (existingItem) {
    existingItem.quantity = Number(existingItem.quantity) + Number(quantity);
    await existingItem.save();
  } else {
    await CartItem.create({ cartId: cart.id, productId, quantity });
  }

  const updatedCart = await Cart.findOne({
    where: { userId: req.user.id },
    include: [{ model: CartItem, as: 'cartItems', include: [{ model: Product, as: 'product' }] }],
  });
  res.json(updatedCart);
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cartItem = await CartItem.findByPk(req.params.itemId);
  if (!cartItem) {
    res.status(404);
    throw new Error('Cart item not found');
  }

  const cart = await Cart.findByPk(cartItem.cartId);
  if (cart.userId !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (quantity <= 0) {
    await cartItem.destroy();
  } else {
    cartItem.quantity = quantity;
    await cartItem.save();
  }

  const updatedCart = await Cart.findOne({
    where: { userId: req.user.id },
    include: [{ model: CartItem, as: 'cartItems', include: [{ model: Product, as: 'product' }] }],
  });
  res.json(updatedCart);
});

// @desc    Remove cart item
// @route   DELETE /api/cart/:itemId
const removeCartItem = asyncHandler(async (req, res) => {
  const cartItem = await CartItem.findByPk(req.params.itemId);
  if (!cartItem) {
    res.status(404);
    throw new Error('Cart item not found');
  }

  const cart = await Cart.findByPk(cartItem.cartId);
  if (cart.userId !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized');
  }
  await cartItem.destroy();

  const updatedCart = await Cart.findOne({
    where: { userId: req.user.id },
    include: [{ model: CartItem, as: 'cartItems', include: [{ model: Product, as: 'product' }] }],
  });
  res.json(updatedCart);
});

// @desc    Clear cart
// @route   DELETE /api/cart
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ where: { userId: req.user.id } });
  if (cart) {
    await CartItem.destroy({ where: { cartId: cart.id } });
  }
  res.json({ message: 'Cart cleared' });
});

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
