const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SavedDesign = sequelize.define('SavedDesign', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE',
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'products', key: 'id' },
    onDelete: 'CASCADE',
  },
  designData: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  previewImage: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  name: {
    type: DataTypes.STRING,
    defaultValue: 'Untitled Design',
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'saved_designs',
});

module.exports = SavedDesign;
