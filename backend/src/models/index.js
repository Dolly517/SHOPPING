const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const Review = require('./Review');
const Wishlist = require('./Wishlist');
const CustomProduct = require('./CustomProduct');
const SavedDesign = require('./SavedDesign');
const Sticker = require('./Sticker');

// User associations
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
User.hasOne(Cart, { foreignKey: 'userId', as: 'cart' });
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
User.hasMany(Wishlist, { foreignKey: 'userId', as: 'wishlists' });

// Order associations
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'orderItems' });

// OrderItem associations
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });

// Cart associations
Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'cartItems' });

// CartItem associations
CartItem.belongsTo(Cart, { foreignKey: 'cartId', as: 'cart' });
CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(CartItem, { foreignKey: 'productId', as: 'cartItems' });

// Review associations
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews' });

// Wishlist associations
Wishlist.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Wishlist.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(Wishlist, { foreignKey: 'productId', as: 'wishlistItems' });

// Customization associations
Product.hasOne(CustomProduct, { foreignKey: 'baseProductId', as: 'customization' });
CustomProduct.belongsTo(Product, { foreignKey: 'baseProductId', as: 'baseProduct' });

User.hasMany(SavedDesign, { foreignKey: 'userId', as: 'savedDesigns' });
SavedDesign.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Product.hasMany(SavedDesign, { foreignKey: 'productId', as: 'savedDesigns' });
SavedDesign.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Sticker associations
User.hasMany(Sticker, { foreignKey: 'uploadedBy', as: 'uploadedStickers' });
Sticker.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

module.exports = {
  sequelize,
  User,
  Product,
  Order,
  OrderItem,
  Cart,
  CartItem,
  Review,
  Wishlist,
  CustomProduct,
  SavedDesign,
  Sticker,
};
