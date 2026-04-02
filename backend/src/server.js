require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { DataTypes } = require('sequelize');
const { sequelize, Product } = require('./models');
const seedData = require('./utils/seedData');

const app = express();

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Uploads directory
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const customUploadsDir = path.join(uploadsDir, 'custom');
if (!fs.existsSync(customUploadsDir)) fs.mkdirSync(customUploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/custom', require('./routes/customizationRoutes'));
app.use('/api/stickers', require('./routes/stickerRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// Serve React frontend in production
const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      res.sendFile(path.join(frontendDist, 'index.html'));
    }
  });
}

// Error handling
const { errorHandler, notFound } = require('./middleware/error');
app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;

const ensureSqliteColumns = async () => {
  if (sequelize.getDialect() !== 'sqlite') return;

  const queryInterface = sequelize.getQueryInterface();

  try {
    const cartItemColumns = await queryInterface.describeTable('cart_items');
    if (!cartItemColumns.customization) {
      await queryInterface.addColumn('cart_items', 'customization', {
        type: DataTypes.JSON,
        allowNull: true,
      });
      console.log('✅ Added missing sqlite column: cart_items.customization');
    }
  } catch (error) {
    console.warn('⚠️ SQLite schema self-heal skipped:', error.message);
  }
};

const startListening = (initialPort) => {
  const maxRetries = 20;

  const tryListen = (port, attempt = 0) => {
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
      console.log(`🌐 Frontend: http://localhost:${port}`);
      console.log(`🔗 API: http://localhost:${port}/api`);
    });

    server.on('error', (error) => {
      if (error.code !== 'EADDRINUSE') {
        console.error('❌ Server error:', error.message);
        process.exit(1);
      }

      if (attempt >= maxRetries) {
        console.error(`❌ Could not find a free port after ${maxRetries + 1} attempts starting from ${initialPort}.`);
        process.exit(1);
      }

      const nextPort = port + 1;
      console.warn(`⚠️ Port ${port} is in use, retrying on ${nextPort}...`);
      tryListen(nextPort, attempt + 1);
    });
  };

  tryListen(initialPort);
};

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected');
    try {
      await sequelize.sync({ alter: true });
    } catch (syncError) {
      const isSqlite = sequelize.getDialect() === 'sqlite';
      if (!isSqlite) throw syncError;

      console.warn('⚠️ SQLite alter sync failed, retrying with safe sync...');
      await sequelize.sync();
    }

    await ensureSqliteColumns();
    console.log('✅ Database synced');

    // Seed by default for first-time setup. Set AUTO_SEED=false to disable.
    const shouldAutoSeed = process.env.AUTO_SEED !== 'false';
    if (shouldAutoSeed) {
      const productCount = await Product.count();
      if (productCount === 0) {
        await seedData();
      } else {
        console.log('ℹ️ Seed skipped: products already exist.');
      }
    } else {
      console.log('ℹ️ AUTO_SEED is disabled. Skipping seed data.');
    }
  } catch (err) {
    console.error('⚠️  DB error:', err.message, '- Running in demo mode (no DB)');
  }
  startListening(PORT);
};

startServer();
module.exports = app;
