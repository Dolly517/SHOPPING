const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CustomProduct = sequelize.define('CustomProduct', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  baseProductId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: { model: 'products', key: 'id' },
    onDelete: 'CASCADE',
  },
  // Example format: [{ name: 'Red', hex: '#ff0000', texture: '' }]
  availableColors: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
  model3DUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  supportsText: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  supportsImageUpload: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  maxImages: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
  },
}, {
  tableName: 'custom_products',
});

module.exports = CustomProduct;
