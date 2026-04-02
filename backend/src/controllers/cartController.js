const asyncHandler = require('express-async-handler');
const { Cart, CartItem, Product } = require('../models');

const hasCanvasObjects = (state) => {
  if (!state || typeof state !== 'object') return false;
  return Array.isArray(state.objects) && state.objects.length > 0;
};

const mergeCustomizationPayload = (existing = {}, incoming = {}) => {
  const existingDesignData = existing?.designData && typeof existing.designData === 'object' ? existing.designData : {};
  const incomingDesignData = incoming?.designData && typeof incoming.designData === 'object' ? incoming.designData : {};

  const existingByAngle = existingDesignData?.byAngle && typeof existingDesignData.byAngle === 'object'
    ? existingDesignData.byAngle
    : {};
  const incomingByAngle = incomingDesignData?.byAngle && typeof incomingDesignData.byAngle === 'object'
    ? incomingDesignData.byAngle
    : {};

  const mergedByAngle = {
    ...existingByAngle,
    ...incomingByAngle,
  };

  const mergedAnglePreviews = {
    ...(existing?.anglePreviews && typeof existing.anglePreviews === 'object' ? existing.anglePreviews : {}),
    ...(incoming?.anglePreviews && typeof incoming.anglePreviews === 'object' ? incoming.anglePreviews : {}),
  };

  const mergedEditedAngles = Array.from(new Set([
    ...(Array.isArray(existing?.editedAngles) ? existing.editedAngles : []),
    ...(Array.isArray(incoming?.editedAngles) ? incoming.editedAngles : []),
    ...Object.keys(mergedByAngle).filter((key) => hasCanvasObjects(mergedByAngle[key])),
  ]));

  const activeAngle = Number.isInteger(incomingDesignData?.activeAngle)
    ? incomingDesignData.activeAngle
    : existingDesignData?.activeAngle;

  const nextDesignData = {
    ...existingDesignData,
    ...incomingDesignData,
    byAngle: mergedByAngle,
  };

  if (activeAngle !== undefined) {
    nextDesignData.activeAngle = activeAngle;
  }

  return {
    ...existing,
    ...incoming,
    previewImage: incoming?.previewImage || existing?.previewImage || null,
    designData: nextDesignData,
    anglePreviews: mergedAnglePreviews,
    editedAngles: mergedEditedAngles,
  };
};

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
  const { productId, quantity, customization } = req.body;
  const requestedQty = Number(quantity) || 1;
  const product = await Product.findByPk(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  if (product.stock < requestedQty) {
    res.status(400);
    throw new Error('Not enough stock');
  }

  let cart = await Cart.findOne({ where: { userId: req.user.id } });
  if (!cart) cart = await Cart.create({ userId: req.user.id });

  // For custom products, merge by mergeKey when present so multi-angle edits remain one cart item.
  if (customization) {
    const mergeKey = typeof customization?.mergeKey === 'string' ? customization.mergeKey.trim() : '';
    if (mergeKey) {
      const customizedItems = await CartItem.findAll({
        where: { cartId: cart.id, productId },
      });

      const existingCustomizedItem = customizedItems.find((item) => {
        const key = item?.customization && typeof item.customization === 'object'
          ? item.customization.mergeKey
          : '';
        return key === mergeKey;
      });

      if (existingCustomizedItem) {
        existingCustomizedItem.customization = mergeCustomizationPayload(existingCustomizedItem.customization, customization);
        await existingCustomizedItem.save();
      } else {
        await CartItem.create({ cartId: cart.id, productId, quantity: requestedQty, customization });
      }
    } else {
      await CartItem.create({ cartId: cart.id, productId, quantity: requestedQty, customization });
    }
  } else {
    const existingItem = await CartItem.findOne({
      where: { cartId: cart.id, productId, customization: null },
    });

    if (existingItem) {
      existingItem.quantity = Number(existingItem.quantity) + requestedQty;
      await existingItem.save();
    } else {
      await CartItem.create({ cartId: cart.id, productId, quantity: requestedQty });
    }
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
