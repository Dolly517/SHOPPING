const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sticker = sequelize.define('Sticker', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'General',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  uploadedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: true,
});

Sticker.associate = (models) => {
  Sticker.belongsTo(models.User, { foreignKey: 'uploadedBy', as: 'uploader' });
};

module.exports = Sticker;
