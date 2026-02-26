const { Sequelize } = require('sequelize');
require('dotenv').config();

// Use PostgreSQL if available, otherwise fall back to SQLite for demo
const isPostgres = process.env.DB_HOST && process.env.DB_HOST !== 'localhost' || process.env.DATABASE_URL;

let sequelize;

if (process.env.DATABASE_URL) {
  // Production: use DATABASE_URL (PostgreSQL)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
  });
} else {
  // Development: try PostgreSQL first, then fallback to SQLite
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  };

  // Check if we should use SQLite
  if (process.env.USE_SQLITE === 'true' || process.env.NODE_ENV === 'sandbox') {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: './shopwave.db',
      logging: false,
    });
  } else {
    sequelize = new Sequelize(
      process.env.DB_NAME || 'ecommerce',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASS || 'password',
      dbConfig
    );
  }
}

module.exports = sequelize;
