# 🛍️ ShopWave — Full-Stack eCommerce Platform

A complete, production-ready eCommerce application with User and Admin interfaces.

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| **Application** | https://3000-in8hjbeotj2gq9ubzty1m-2e77fc33.sandbox.novita.ai |
| **API Health** | https://3000-in8hjbeotj2gq9ubzty1m-2e77fc33.sandbox.novita.ai/api/health |

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@shopwave.com | admin123 |
| **User** | user@shopwave.com | user123 |

> **Test Payment**: Card `4242 4242 4242 4242` | Expiry `12/34` | CVV `123`

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + Tailwind CSS |
| **Backend** | Node.js + Express.js |
| **Database** | PostgreSQL (Sequelize ORM) / SQLite (dev) |
| **Auth** | JWT (JSON Web Tokens) + bcrypt |
| **Payment** | Stripe API |
| **State** | React Context API |
| **Routing** | React Router v6 |
| **Icons** | react-icons |
| **Toasts** | react-hot-toast |

---

## ✨ Features

### 👤 User Features
- 🏠 **Home Page** — Hero banner, category grid, featured products
- 🛒 **Product Listing** — Pagination, search, category filter, price filter, sort
- 📦 **Product Detail** — Images, description, reviews & ratings, wishlist
- 🛍️ **Shopping Cart** — Add/update/remove items, persistent local cart
- 💳 **Checkout** — Multi-step checkout with Stripe payment integration
- 📋 **Order History** — View all orders with status tracking
- 👤 **User Profile** — Edit name, email, phone, address, password
- ❤️ **Wishlist** — Save and manage favorite products
- 🔐 **Auth** — Register/Login with JWT, role-based access

### 🔧 Admin Features
- 📊 **Dashboard** — Live analytics: users, orders, revenue, products
- 🛍️ **Product Management** — Create, edit, delete products with image upload
- 📦 **Order Management** — View and update order status
- 👥 **User Management** — View, change roles, delete users
- 🔒 **Role-based Access** — Admin-only routes secured with JWT

---

## 📁 Project Structure

```
webapp/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Sequelize config (PostgreSQL/SQLite)
│   │   ├── models/
│   │   │   ├── index.js             # Model associations
│   │   │   ├── User.js              # Users table
│   │   │   ├── Product.js           # Products table
│   │   │   ├── Order.js             # Orders table
│   │   │   ├── OrderItem.js         # Order items table
│   │   │   ├── Cart.js              # Cart table
│   │   │   ├── CartItem.js          # Cart items table
│   │   │   ├── Review.js            # Product reviews
│   │   │   └── Wishlist.js          # User wishlists
│   │   ├── controllers/
│   │   │   ├── authController.js    # Register, login, profile
│   │   │   ├── productController.js # Product CRUD, reviews
│   │   │   ├── cartController.js    # Cart management
│   │   │   ├── orderController.js   # Orders + Stripe
│   │   │   ├── wishlistController.js # Wishlist
│   │   │   └── adminController.js  # Admin dashboard + management
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── cartRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   ├── wishlistRoutes.js
│   │   │   └── adminRoutes.js
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT protect + admin guard
│   │   │   └── error.js             # Error handler
│   │   ├── utils/
│   │   │   ├── generateToken.js
│   │   │   └── seedData.js          # Demo data seeder
│   │   └── server.js
│   ├── uploads/                     # Uploaded product images
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Auth state (user, login, logout)
│   │   │   ├── CartContext.jsx      # Cart state
│   │   │   └── WishlistContext.jsx  # Wishlist state
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── ProductCard.jsx
│   │   │   │   ├── StarRating.jsx
│   │   │   │   ├── Spinner.jsx
│   │   │   │   ├── PrivateRoute.jsx
│   │   │   │   └── AdminRoute.jsx
│   │   │   └── admin/
│   │   │       └── AdminLayout.jsx  # Admin sidebar layout
│   │   ├── pages/
│   │   │   ├── user/
│   │   │   │   ├── HomePage.jsx
│   │   │   │   ├── ProductsPage.jsx
│   │   │   │   ├── ProductDetailPage.jsx
│   │   │   │   ├── CartPage.jsx
│   │   │   │   ├── CheckoutPage.jsx
│   │   │   │   ├── OrderSuccessPage.jsx
│   │   │   │   ├── OrdersPage.jsx
│   │   │   │   ├── OrderDetailPage.jsx
│   │   │   │   ├── ProfilePage.jsx
│   │   │   │   ├── WishlistPage.jsx
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   └── RegisterPage.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── AdminProducts.jsx
│   │   │       ├── AdminOrders.jsx
│   │   │       └── AdminUsers.jsx
│   │   ├── utils/
│   │   │   └── api.js               # Axios instance with JWT interceptor
│   │   ├── styles/
│   │   │   └── index.css            # Tailwind + custom classes
│   │   ├── App.jsx                  # Routes
│   │   └── main.jsx
│   └── package.json
│
├── ecosystem.config.cjs             # PM2 config
└── README.md
```

---

## 🗃️ Database Schema

```sql
-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  avatar VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  image VARCHAR(500),
  category VARCHAR(100),
  brand VARCHAR(100),
  rating DECIMAL(3,2) DEFAULT 0,
  num_reviews INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  total_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  stripe_payment_id VARCHAR(255),
  shipping_address TEXT,
  shipping_price DECIMAL(10,2) DEFAULT 0,
  tax_price DECIMAL(10,2) DEFAULT 0,
  is_paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMP,
  is_delivered BOOLEAN DEFAULT false,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image VARCHAR(500)
);

-- Cart
CREATE TABLE carts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cart Items
CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER DEFAULT 1
);

-- Reviews
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(255),
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Wishlists
CREATE TABLE wishlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE
);
```

---

## 🔌 REST API Endpoints

### Authentication
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | - | Register new user |
| POST | /api/auth/login | - | Login |
| GET | /api/auth/profile | ✅ | Get user profile |
| PUT | /api/auth/profile | ✅ | Update profile |

### Products
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/products | - | List products (filter, search, paginate) |
| GET | /api/products/featured | - | Get featured products |
| GET | /api/products/categories | - | Get all categories |
| GET | /api/products/:id | - | Get product detail with reviews |
| POST | /api/products/:id/reviews | ✅ | Submit review |

### Cart
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/cart | ✅ | Get user's cart |
| POST | /api/cart | ✅ | Add item to cart |
| PUT | /api/cart/:itemId | ✅ | Update item quantity |
| DELETE | /api/cart/:itemId | ✅ | Remove item |
| DELETE | /api/cart | ✅ | Clear cart |

### Orders
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/orders | ✅ | Create order |
| GET | /api/orders/myorders | ✅ | Get my orders |
| POST | /api/orders/payment-intent | ✅ | Create Stripe payment intent |
| GET | /api/orders/:id | ✅ | Get order by ID |
| PUT | /api/orders/:id/pay | ✅ | Mark order as paid |

### Wishlist
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/wishlist | ✅ | Get wishlist |
| POST | /api/wishlist | ✅ | Toggle wishlist item |
| DELETE | /api/wishlist/:productId | ✅ | Remove from wishlist |

### Admin (Admin Only)
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/admin/dashboard | Analytics overview |
| GET/POST | /api/admin/products | List / create products |
| PUT/DELETE | /api/admin/products/:id | Update / delete product |
| GET | /api/admin/orders | List all orders |
| PUT | /api/admin/orders/:id | Update order status |
| GET | /api/admin/users | List all users |
| PUT | /api/admin/users/:id | Update user role |
| DELETE | /api/admin/users/:id | Delete user |

---

## 🛠️ Local Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (or use SQLite for development)
- npm or yarn

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

**backend/.env**
```env
PORT=5000
NODE_ENV=development
USE_SQLITE=true  # Use SQLite for local dev (no PostgreSQL needed)

# PostgreSQL (when ready for production)
DATABASE_URL=postgresql://user:password@host:5432/dbname
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce
DB_USER=postgres
DB_PASS=yourpassword

JWT_SECRET=your_jwt_secret_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
FRONTEND_URL=http://localhost:3000
```

**frontend/.env**
```env
VITE_API_URL=/api
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
```

### 3. Run Development Servers

```bash
# Terminal 1: Start backend
cd backend
npm run dev  # runs on port 5000

# Terminal 2: Start frontend
cd frontend
npm run dev  # runs on port 3000
```

### 4. Run with PM2 (Production-like)

```bash
# Build frontend first
cd frontend && npm run build

# Start with PM2 (from root)
pm2 start ecosystem.config.cjs
pm2 logs shopwave --nostream
```

---

## 🚀 Deployment Guide

### Frontend → Vercel
```bash
cd frontend
npm run build
# Deploy dist/ folder to Vercel
# Set VITE_API_URL=https://your-backend.render.com/api
# Set VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

### Backend → Render
1. Connect GitHub repository
2. Set environment variables:
   - `DATABASE_URL` — Supabase/Railway PostgreSQL URL
   - `JWT_SECRET` — Strong random secret
   - `STRIPE_SECRET_KEY` — Stripe production key
   - `NODE_ENV=production`
3. Build command: `npm install`
4. Start command: `node src/server.js`

### Database → Supabase / Railway
```bash
# With Supabase:
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres

# With Railway:
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/railway
```

---

## 🔧 Configuration Tips

### Stripe Integration
1. Get your keys from [https://dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
2. Set `STRIPE_SECRET_KEY` in backend
3. Set `VITE_STRIPE_PUBLIC_KEY` in frontend
4. Test with card: `4242 4242 4242 4242`

### Adding Custom Products
Use the Admin Panel at `/admin/products` to add real products with images.

### Image Upload
Images are uploaded to `backend/uploads/` and served at `/uploads/filename.jpg`.
For production, use an S3 bucket or Cloudflare R2.

---

## 📊 Analytics Dashboard

The admin dashboard shows:
- 📊 Total users registered
- 📦 Total orders placed
- 💰 Total revenue (from paid orders)
- 🛍️ Total products in catalog
- 📋 Recent orders with status
- 📈 Order breakdown by status

---

## 🔒 Security Features

- ✅ Passwords hashed with **bcrypt** (salt rounds: 12)
- ✅ **JWT** authentication with 30-day expiry
- ✅ **Role-based authorization** (user/admin)
- ✅ API routes protected with middleware
- ✅ Admin routes double-protected
- ✅ Input validation with express-validator
- ✅ CORS configured for frontend domain

---

*Built with ❤️ using React, Node.js, Express, Sequelize, and Tailwind CSS*
