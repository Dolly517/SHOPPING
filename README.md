# eCommerce Platform

A complete, production-ready eCommerce application with User and Admin interfaces.
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

##  Features

###  User Features
-  **Home Page** — Hero banner, category grid, featured products
-  **Product Listing** — Pagination, search, category filter, price filter, sort
-  **Product Detail** — Images, description, reviews & ratings, wishlist
-  **Product Customizer** — Add text, stickers, uploads, and multi-angle design editing
-  **My Saved Designs** — Save, reopen, delete, and reuse custom designs
-  **Shopping Cart** — Add/update/remove items, persistent local cart
-  **Checkout** — Multi-step checkout with Stripe payment integration
-  **Order History** — View all orders with status tracking
-  **User Profile** — Edit name, email, phone, address, password
-  **Wishlist** — Save and manage favorite products
-  **Auth** — Register/Login with JWT, role-based access

### 🔧 Admin Features
-  **Dashboard** — Live analytics: users, orders, revenue, products
-  **Product Management** — Create, edit, delete products with product image + reference images
-  **Customization Control** — Enable/disable per-product customization settings
-  **Sticker Management** — Upload, URL-import, categorize, update, and delete stickers
-  **Order Management** — View and update order status
-  **User Management** — View, change roles, delete users
-  **Role-based Access** — Admin-only routes secured with JWT

---

##  Project Structure

```
SHOPPING/
├── ecosystem.config.cjs
├── README.md
├── backend/
│   ├── package.json
│   ├── src/
│   │   ├── server.js
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── adminController.js
│   │   │   ├── authController.js
│   │   │   ├── cartController.js
│   │   │   ├── customizationController.js
│   │   │   ├── orderController.js
│   │   │   ├── productController.js
│   │   │   ├── stickerController.js
│   │   │   └── wishlistController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── error.js
│   │   ├── models/
│   │   │   ├── Cart.js
│   │   │   ├── CartItem.js
│   │   │   ├── CustomProduct.js
│   │   │   ├── index.js
│   │   │   ├── Order.js
│   │   │   ├── OrderItem.js
│   │   │   ├── Product.js
│   │   │   ├── Review.js
│   │   │   ├── SavedDesign.js
│   │   │   ├── Sticker.js
│   │   │   ├── User.js
│   │   │   └── Wishlist.js
│   │   ├── routes/
│   │   │   ├── adminRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── cartRoutes.js
│   │   │   ├── customizationRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── stickerRoutes.js
│   │   │   └── wishlistRoutes.js
│   │   └── utils/
│   │       ├── customizationRules.js
│   │       ├── emailService.js
│   │       ├── generateToken.js
│   │       └── seedData.js
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── components/
│       │   ├── admin/
│       │   │   └── AdminLayout.jsx
│       │   ├── common/
│       │   │   ├── AdminRoute.jsx
│       │   │   ├── Footer.jsx
│       │   │   ├── Navbar.jsx
│       │   │   ├── PrivateRoute.jsx
│       │   │   ├── ProductCard.jsx
│       │   │   ├── Spinner.jsx
│       │   │   └── StarRating.jsx
│       │   └── user/
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   ├── CartContext.jsx
│       │   └── WishlistContext.jsx
│       ├── hooks/
│       ├── pages/
│       │   ├── admin/
│       │   │   ├── AdminDashboard.jsx
│       │   │   ├── AdminOrders.jsx
│       │   │   ├── AdminProducts.jsx
│       │   │   ├── AdminUsers.jsx
│       │   │   ├── ProductFormModal.jsx
│       │   │   └── Stickers.jsx
│       │   └── user/
│       │       ├── CartPage.jsx
│       │       ├── CheckoutPage.jsx
│       │       ├── CustomizerPage.jsx
│       │       ├── HomePage.jsx
│       │       ├── LoginPage.jsx
│       │       ├── MyDesigns.jsx
│       │       ├── OrderDetailPage.jsx
│       │       ├── OrdersPage.jsx
│       │       ├── OrderSuccessPage.jsx
│       │       ├── ProductDetailPage.jsx
│       │       ├── ProductsPage.jsx
│       │       ├── ProfilePage.jsx
│       │       ├── RegisterPage.jsx
│       │       └── WishlistPage.jsx
│       ├── styles/
│       │   └── index.css
│       └── utils/
│           └── api.js
├── uploads/
│   ├── custom/
│   └── stickers/
└── logs/
```

---

##  Database Schema

The app uses Sequelize models (PostgreSQL in production, SQLite in dev). Below is the logical schema with key fields used in the project.

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
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock INTEGER DEFAULT 0,
  image VARCHAR(500) DEFAULT '',
  images TEXT DEFAULT '[]',               -- JSON array string
  category VARCHAR(100) DEFAULT 'General',
  brand VARCHAR(100) DEFAULT '',
  rating DECIMAL(3,2) DEFAULT 0,
  num_reviews INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  is_customizable BOOLEAN DEFAULT false,
  custom_images TEXT DEFAULT '[]',        -- JSON array string (front/back/side)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Custom product settings (1:1 with products when customization enabled)
CREATE TABLE custom_products (
  id SERIAL PRIMARY KEY,
  base_product_id INTEGER UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  available_colors JSON NOT NULL DEFAULT '[]',
  model_3d_url VARCHAR(500) DEFAULT '',
  supports_text BOOLEAN DEFAULT true,
  supports_image_upload BOOLEAN DEFAULT true,
  max_images INTEGER DEFAULT 3,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Saved customizable designs
CREATE TABLE saved_designs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  design_data JSON NOT NULL,
  preview_image TEXT DEFAULT '',
  name VARCHAR(255) DEFAULT 'Untitled Design',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Stickers (admin-managed)
CREATE TABLE stickers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  category VARCHAR(100) DEFAULT 'General',
  is_active BOOLEAN DEFAULT true,
  uploaded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
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
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image VARCHAR(500) DEFAULT '',
  customization JSON,                     -- { previewImage, designData, anglePreviews, ... }
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Carts
CREATE TABLE carts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Cart Items
CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER DEFAULT 1,
  customization JSON,                     -- { previewImage, designData, ... }
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(255),
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Wishlists
CREATE TABLE wishlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Entity Relationships (High Level)
- One user has one cart and many orders, reviews, wishlists, and saved designs.
- One product has many reviews, cart items, order items, wishlists, and saved designs.
- One customizable product can have one custom configuration (`custom_products`).
- One order has many order items.

---

## 🔌 REST API Endpoints

### System
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/health | - | API health check |

### Authentication
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | - | Register new user |
| POST | /api/auth/login | - | Login and get JWT |
| GET | /api/auth/profile | ✅ | Get logged-in user profile |
| PUT | /api/auth/profile | ✅ | Update profile (name/email/password/etc.) |

### Products
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/products | - | List products (filter/search/paginate/sort) |
| GET | /api/products/featured | - | Get featured products |
| GET | /api/products/categories | - | Get product categories |
| GET | /api/products/:id | - | Get product details + reviews |
| POST | /api/products/:id/reviews | ✅ | Add product review |

### Cart
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/cart | ✅ | Get current user's cart |
| POST | /api/cart | ✅ | Add item to cart (supports customization payload) |
| PUT | /api/cart/:itemId | ✅ | Update cart item quantity/customization |
| DELETE | /api/cart/:itemId | ✅ | Remove cart item |
| DELETE | /api/cart | ✅ | Clear entire cart |

### Orders
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/orders | ✅ | Create order from cart |
| GET | /api/orders/myorders | ✅ | Get logged-in user's orders |
| POST | /api/orders/payment-intent | ✅ | Create Stripe payment intent |
| GET | /api/orders/:id | ✅ | Get single order details |
| PUT | /api/orders/:id/pay | ✅ | Mark order as paid |

### Wishlist
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/wishlist | ✅ | Get user's wishlist |
| POST | /api/wishlist | ✅ | Add/toggle wishlist item |
| DELETE | /api/wishlist/:productId | ✅ | Remove item from wishlist |

### Customization
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/custom/products/:productId | - | Get customization config for a product |
| POST | /api/custom/save | ✅ | Save custom design |
| GET | /api/custom/my-designs | ✅ | Get current user's saved designs |
| GET | /api/custom/user/designs | ✅ | Alias for user saved designs |
| GET | /api/custom/design/:id | ✅ | Get one saved design by ID |
| DELETE | /api/custom/design/:id | ✅ | Delete one saved design |
| POST | /api/custom/upload | ✅ | Upload custom image asset |

### Stickers
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/stickers | - | Get active/public stickers |

### Admin (Admin Role Required)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/admin/dashboard | ✅ Admin | Dashboard analytics |
| GET | /api/admin/products | ✅ Admin | List all products |
| POST | /api/admin/products | ✅ Admin | Create product (image + customImages uploads) |
| PUT | /api/admin/products/:id | ✅ Admin | Update product |
| DELETE | /api/admin/products/:id | ✅ Admin | Delete product |
| GET | /api/admin/orders | ✅ Admin | List all orders |
| PUT | /api/admin/orders/:id | ✅ Admin | Update order status |
| GET | /api/admin/users | ✅ Admin | List users |
| PUT | /api/admin/users/:id | ✅ Admin | Update user role |
| DELETE | /api/admin/users/:id | ✅ Admin | Delete user |
| GET | /api/stickers/admin/all | ✅ Admin | List all stickers |
| POST | /api/stickers/admin/upload | ✅ Admin | Upload sticker file |
| POST | /api/stickers/admin/url | ✅ Admin | Create sticker via image URL |
| PUT | /api/stickers/admin/:id | ✅ Admin | Update sticker |
| DELETE | /api/stickers/admin/:id | ✅ Admin | Delete sticker |

### Uploads & Static Files
- `GET /uploads/<filename>` serves uploaded assets from the server uploads directory.

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
-  Total users registered
-  Total orders placed
-  Total revenue (from paid orders)
-  Total products in catalog
-  Recent orders with status
-  Order breakdown by status

---

##  Security Features

- ✅ Passwords hashed with **bcrypt** (salt rounds: 12)
- ✅ **JWT** authentication with 30-day expiry
- ✅ **Role-based authorization** (user/admin)
- ✅ API routes protected with middleware
- ✅ Admin routes double-protected
- ✅ Input validation with express-validator
- ✅ CORS configured for frontend domain

---

*Built with ❤️ using React, Node.js, Express, Sequelize, and Tailwind CSS*
