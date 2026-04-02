import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Layout Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';

// User Pages (consider lazy loading for production)
import HomePage from './pages/user/HomePage';
import ProductsPage from './pages/user/ProductsPage';
import ProductDetailPage from './pages/user/ProductDetailPage';
import CustomizerPage from './pages/user/CustomizerPage';
import CartPage from './pages/user/CartPage';
import CheckoutPage from './pages/user/CheckoutPage';
import OrderSuccessPage from './pages/user/OrderSuccessPage';
import ProfilePage from './pages/user/ProfilePage';
import OrdersPage from './pages/user/OrdersPage';
import OrderDetailPage from './pages/user/OrderDetailPage';
import WishlistPage from './pages/user/WishlistPage';
import MyDesigns from './pages/user/MyDesigns';
import LoginPage from './pages/user/LoginPage';
import RegisterPage from './pages/user/RegisterPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import Stickers from './pages/admin/Stickers';

// Layout wrapper for user-facing pages (includes Navbar & Footer)
const UserLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

function RouteThemeGuard() {
  const location = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    const isAdminRoute = location.pathname.startsWith('/admin');

    if (isAdminRoute) {
      root.classList.remove('dark');
      return;
    }

    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <RouteThemeGuard />
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              {/* Global toast configuration */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: { background: '#363636', color: '#fff', borderRadius: '10px' },
                  success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
                  error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                }}
              />

              <Routes>
                {/* Public User Routes */}
                <Route
                  path="/"
                  element={<UserLayout><HomePage /></UserLayout>}
                />
                <Route
                  path="/products"
                  element={<UserLayout><ProductsPage /></UserLayout>}
                />
                <Route
                  path="/products/:id"
                  element={<UserLayout><ProductDetailPage /></UserLayout>}
                />
                <Route
                  path="/customize/:productId"
                  element={
                    <PrivateRoute>
                      <UserLayout><CustomizerPage /></UserLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/cart"
                  element={<UserLayout><CartPage /></UserLayout>}
                />
                <Route
                  path="/wishlist"
                  element={<UserLayout><WishlistPage /></UserLayout>}
                />
                <Route
                  path="/my-designs"
                  element={
                    <PrivateRoute>
                      <UserLayout><MyDesigns /></UserLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/login"
                  element={<UserLayout><LoginPage /></UserLayout>}
                />
                <Route
                  path="/register"
                  element={<UserLayout><RegisterPage /></UserLayout>}
                />

                {/* Protected User Routes */}
                <Route
                  path="/checkout"
                  element={
                    <PrivateRoute>
                      <UserLayout><CheckoutPage /></UserLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/order-success/:id"
                  element={
                    <PrivateRoute>
                      <UserLayout><OrderSuccessPage /></UserLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <UserLayout><ProfilePage /></UserLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <PrivateRoute>
                      <UserLayout><OrdersPage /></UserLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <PrivateRoute>
                      <UserLayout><OrderDetailPage /></UserLayout>
                    </PrivateRoute>
                  }
                />

                {/* Admin Routes (nested under AdminLayout) */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="stickers" element={<Stickers />} />
                </Route>

                {/* Optional: 404 Not Found Route */}
                <Route
                  path="*"
                  element={
                    <UserLayout>
                      <div className="text-center py-20">
                        <h1 className="text-4xl font-bold">404</h1>
                        <p className="text-gray-500 mt-2">Page not found</p>
                      </div>
                    </UserLayout>
                  }
                />
              </Routes>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;