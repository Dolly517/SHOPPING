const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
  paymentMethod: {
    type: DataTypes.STRING,
    defaultValue: 'stripe',
  },
  paymentStatus: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
  stripePaymentId: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  shippingAddress: {
    type: DataTypes.TEXT,
    defaultValue: '{}',
    get() {
      const val = this.getDataValue('shippingAddress');
      try { return JSON.parse(val || '{}'); } catch { return {}; }
    },
    set(val) {
      this.setDataValue('shippingAddress', JSON.stringify(val || {}));
    },
  },
  shippingPrice: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  taxPrice: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  isPaid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  paidAt: {
    type: DataTypes.DATE,
  },
  isDelivered: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  deliveredAt: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'orders',
});

module.exports = Order;
