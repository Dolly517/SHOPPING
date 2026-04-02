# ShopWave Complete Project Documentation

## 1. Introduction

### 1.1 Background of the Study
E-commerce platforms have evolved from simple catalog websites into full digital commerce systems with personalization, secure payments, and role-based administration. Users now expect personalized shopping experiences, smooth checkout, and real-time account management. ShopWave is developed as a complete full-stack implementation of these modern e-commerce expectations using React, Node.js, Express, and Sequelize.

This project also introduces a product customization workflow where users can personalize products (for example hoodies or tote bags) by adding text, stickers, and uploaded images, then save and reuse those designs.

### 1.2 Problem Statement
Many basic e-commerce projects cover only product listing and checkout. They often miss:
- robust role-based admin management,
- customization workflows,
- reusable saved design management,
- and production-style modular architecture.

The problem addressed by ShopWave is building a single integrated platform that supports both standard commerce operations and customizable product design while maintaining security, scalability potential, and maintainable code structure.

### 1.3 Objectives
The main objectives of ShopWave are:
1. Build a full-stack e-commerce system with user and admin portals.
2. Implement secure JWT-based authentication and role authorization.
3. Provide complete shopping flow: browse, cart, checkout, order history.
4. Add product customization with text/sticker/image support.
5. Allow users to save, reopen, and reuse custom designs.
6. Provide admin-side product, order, user, and sticker management.
7. Maintain clean modular project architecture for future extensions.

### 1.4 Scope & Limitations
Scope:
- End-to-end e-commerce functionality
- Product customization and saved designs
- Admin management panel
- Stripe payment intent support
- Local upload support

Limitations (current version):
- File uploads are stored locally, not in cloud object storage.
- CORS is permissive in current backend configuration.
- No coupon/promotion engine yet.
- No automated test suite committed yet (recommended in future).

### 1.5 Methodology
The project follows an iterative full-stack development methodology:
1. Requirement collection and feature planning.
2. Data model and API-first backend implementation.
3. Frontend UI and state management integration.
4. Incremental feature integration (auth, cart, orders, customization).
5. Manual integration testing and refinement.
6. Deployment preparation with environment-based configuration.

---

## 2. Literature Review / Existing Systems
Existing systems can be grouped into:
1. Basic e-commerce templates:
  - Provide product CRUD and checkout.
  - Usually lack advanced customization workflow.
2. Enterprise platforms:
  - Rich features and scaling.
  - High complexity and cost, less educational for custom build.
3. Design-centric product customizers:
  - Strong personalization capabilities.
  - Often not integrated with complete order/account lifecycle.

Gap addressed by ShopWave:
- Combines complete e-commerce lifecycle and product customization in a single project.
- Uses modern yet developer-friendly stack suitable for learning and production transition.

---

## 3. System Analysis & Requirements

### 3.1 Functional Requirements
User-side:
1. User registration/login/logout.
2. Product discovery with filtering/search/sort/pagination.
3. Product details with reviews and rating.
4. Cart management and order placement.
5. Payment intent creation and order tracking.
6. Wishlist operations.
7. Product customization and saved designs management.

Admin-side:
1. Dashboard analytics.
2. Product management with image/reference image upload.
3. Order status updates.
4. User role and user management.
5. Sticker management (upload, URL import, update, delete).

### 3.2 Non-Functional Requirements
1. Security: JWT auth, bcrypt hashing, admin route protection.
2. Usability: responsive UI for mobile and desktop.
3. Maintainability: modular controllers/routes/models.
4. Reliability: centralized error handling middleware.
5. Performance: pagination, static file serving, optimized API grouping.
6. Extensibility: customization/sticker modules isolated for growth.

### 3.3 Hardware & Software Requirements
Hardware (minimum for development):
1. 64-bit processor (Intel i5/Ryzen 5 or higher recommended)
2. 8 GB RAM (16 GB preferred)
3. 5+ GB free disk space

Software:
1. Node.js 18+
2. npm or yarn
3. PostgreSQL 14+ (or SQLite for local dev)
4. VS Code
5. Git
6. Browser (Chrome/Edge)

---

## 4. System Design

### 4.1 Architecture
ShopWave follows a 3-tier architecture:
1. Presentation Layer:
  - React pages/components
  - Context-based state (Auth, Cart, Wishlist)
2. Application Layer:
  - Express routes + controllers
  - Auth and error middlewares
3. Data Layer:
  - Sequelize models and relational DB
  - JSON fields for customization payloads

Supporting services:
- Stripe for payments
- Multer + filesystem for uploads

### 4.2 Database Design (ER Diagram / Schema)
Core entities:
1. `users`
2. `products`
3. `reviews`
4. `wishlists`
5. `carts`, `cart_items`
6. `orders`, `order_items`
7. `custom_products`
8. `saved_designs`
9. `stickers`

Key relationship summary:
1. User 1-N Orders, Reviews, Wishlists, SavedDesigns
2. User 1-1 Cart
3. Product 1-N Reviews, OrderItems, CartItems, Wishlists, SavedDesigns
4. Product 1-1 CustomProduct (for customizable products)
5. Order 1-N OrderItems

Note:
- `products.customImages` stores reference images for multi-angle customization.
- `saved_designs.designData` stores canvas JSON.
- `cart_items.customization` and `order_items.customization` preserve customized state in transaction flow.

### 4.3 Data Flow Diagrams (optional – descriptive)
Because formal DFD visuals are optional, the flow is described textually:

DFD-Level 0 (Context):
1. User interacts with ShopWave frontend.
2. Frontend sends requests to backend REST API.
3. Backend interacts with DB and external Stripe service.
4. Backend returns JSON responses to frontend.

DFD-Level 1 (Customization Flow):
1. User selects customizable product.
2. Frontend fetches product + customization config.
3. User edits canvas and generates preview.
4. Frontend posts save request (`/api/custom/save`).
5. Backend stores designData + previewImage in `saved_designs`.
6. User reopens saved design and continues editing or adds to cart.

### 4.4 Module Design
Backend modules:
1. Authentication module
2. Product module
3. Cart module
4. Order & payment module
5. Wishlist module
6. Admin module
7. Customization module
8. Sticker module

Frontend modules:
1. User pages
2. Admin pages
3. Context providers
4. Shared component library
5. API utility layer

---

## 5. Technology Stack & Implementation

### 5.1 Frontend Technologies
1. React 18
2. Vite
3. Tailwind CSS
4. React Router v6
5. Context API
6. Axios
7. react-hot-toast
8. Fabric.js (customizer canvas)

### 5.2 Backend Technologies
1. Node.js
2. Express.js
3. Sequelize ORM
4. PostgreSQL / SQLite
5. JWT + bcrypt
6. multer
7. Stripe

### 5.3 Project Structure
Project follows layered and feature-based directory organization:
1. `backend/src/controllers` for business endpoints
2. `backend/src/routes` for route definitions
3. `backend/src/models` for DB entities
4. `frontend/src/pages` for screens
5. `frontend/src/components` for reusable UI
6. `frontend/src/context` for global states
7. `uploads/` for custom and sticker media assets

### 5.4 API Endpoints
Major endpoint groups:
1. `/api/auth` - user auth/profile
2. `/api/products` - products and reviews
3. `/api/cart` - cart operations
4. `/api/orders` - orders and payment intent
5. `/api/wishlist` - wishlist operations
6. `/api/custom` - customization save/load/delete/upload
7. `/api/stickers` - public and admin sticker management
8. `/api/admin` - admin analytics/products/orders/users
9. `/api/health` - system health check

### 5.5 Security Features
1. Bcrypt password hashing
2. JWT bearer authentication
3. Role-based admin middleware
4. Protected private routes in frontend and backend
5. File type restrictions in upload handlers
6. Centralized error middleware

---

## 6. Testing & Deployment

### 6.1 Testing
Current status:
- Strong manual functional testing across key flows.

Suggested formal testing strategy:
1. Unit tests for controllers/utils
2. Integration tests for auth/cart/order/customization APIs
3. End-to-end tests for user checkout and admin management

Recommended tools:
- Jest + Supertest (backend)
- Vitest + React Testing Library (frontend)
- Playwright/Cypress (E2E)

### 6.2 Deployment (Vercel + Render)
Frontend (Vercel):
1. Build frontend with Vite
2. Deploy `frontend/dist`
3. Set `VITE_API_URL` to backend URL

Backend (Render):
1. Connect repository
2. Configure environment variables
3. Start server with `node src/server.js`
4. Connect PostgreSQL (Render/Supabase/Railway)

### 6.3 Environment Variables
Backend:
- `PORT`
- `NODE_ENV`
- `DATABASE_URL` (or SQLite config)
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `FRONTEND_URL`

Frontend:
- `VITE_API_URL`
- `VITE_STRIPE_PUBLIC_KEY`

---

## 7. Results & Screenshots
Implemented results:
1. Fully working user and admin authentication flow.
2. End-to-end shopping lifecycle from product browse to order placement.
3. Canvas-based customization with text/sticker/image support.
4. Saved designs flow with reload and cart integration.
5. Admin dashboard and management modules.

Screenshot placeholders (insert your images here):
1. Home page
2. Product listing with filters
3. Product detail page
4. Customizer page
5. My Saved Designs page
6. Cart and checkout page
7. Admin dashboard
8. Admin product and sticker management

---

## 8. Conclusion & Future Enhancements
ShopWave successfully demonstrates a production-oriented full-stack e-commerce architecture with a unique customization subsystem. The project validates that modular design with React + Express + Sequelize can support both standard commerce and design-personalization workflows in a maintainable way.

Future enhancements:
1. Cloud object storage (S3/R2) for media.
2. Coupon, discount, and promotion module.
3. Advanced product variants and inventory matrix.
4. Automated test pipeline and CI/CD.
5. Caching and performance optimization (Redis/CDN).
6. AI-assisted customization suggestions.

---

## 9. References
1. React Documentation: https://react.dev
2. Vite Documentation: https://vitejs.dev
3. Express Documentation: https://expressjs.com
4. Sequelize Documentation: https://sequelize.org
5. Stripe API Docs: https://stripe.com/docs/api
6. Tailwind CSS Docs: https://tailwindcss.com/docs
7. JWT Introduction: https://jwt.io/introduction

---

## 10. Appendices (Code Snippets)

### Appendix A: Sample Health Endpoint
```js
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));
```

### Appendix B: Sample Protected Route Pattern
```js
router.get('/profile', protect, getUserProfile);
```

### Appendix C: Sample Custom Save Payload
```json
{
  "productId": 12,
  "designData": {
   "byAngle": { "angle-0": { "objects": [] } },
   "activeAngle": 0
  },
  "previewImage": "data:image/png;base64,...",
  "name": "My Hoodie Design"
}
```

### Appendix D: Suggested Viva/Presentation Points
1. Why JWT-based auth was selected.
2. Why customization data is stored as JSON.
3. How multi-angle design works.
4. How admin and user features are isolated securely.
