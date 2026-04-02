import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../utils/api';
import {
  FiShoppingCart, FiHeart, FiMenu, FiX, FiSearch,
  FiLogOut, FiPackage, FiSettings, FiSun, FiMoon, FiBell
} from 'react-icons/fi';
import { MdDashboard } from 'react-icons/md';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState(null);
  const notificationRef = useRef(null);
  const bellRef = useRef(null);

  // Apply theme to html element (affects rest of the app)
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fetch suggestions when notifications panel opens
  useEffect(() => {
    if (notificationsOpen && suggestions.length === 0 && !loadingSuggestions) {
      const fetchSuggestions = async () => {
        setLoadingSuggestions(true);
        setSuggestionsError(null);
        try {
          const { data } = await api.get('/products/suggested').catch(() => api.get('/products/featured'));
          setSuggestions(Array.isArray(data) ? data.slice(0, 5) : []);
        } catch (err) {
          setSuggestionsError('Failed to load suggestions');
          console.error(err);
        } finally {
          setLoadingSuggestions(false);
        }
      };
      fetchSuggestions();
    }
  }, [notificationsOpen, suggestions.length, loadingSuggestions]);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target) &&
          bellRef.current && !bellRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMenuOpen(false);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink min-w-0 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform duration-300">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-base sm:text-xl font-black tracking-tight text-gray-900 dark:text-white leading-none truncate">
                Custom<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">Cart</span>
              </span>
              <span className="hidden sm:block text-[9px] font-bold text-gray-400 dark:text-gray-500 tracking-[0.2em] uppercase mt-0.5">
                design marketplace
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </form>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/products" className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 font-medium text-sm transition-colors">
              Products
            </Link>

            {user && (
              <Link to="/my-designs" className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 font-medium text-sm transition-colors">
                My Designs
              </Link>
            )}

            <Link to="/wishlist" className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">
              <FiHeart className="w-5 h-5" />
            </Link>

            <Link to="/cart" className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">
              <FiShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <FiMoon className="w-5 h-5" /> : <FiSun className="w-5 h-5" />}
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                type="button"
                ref={bellRef}
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <FiBell className="w-5 h-5" />
                {suggestions.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {suggestions.length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div
                  ref={notificationRef}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                >
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Suggested for you</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {loadingSuggestions ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading...</div>
                    ) : suggestionsError ? (
                      <div className="p-4 text-center text-red-500">{suggestionsError}</div>
                    ) : suggestions.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">No suggestions yet</div>
                    ) : (
                      suggestions.map(product => (
                        <Link
                          key={product.id}
                          to={`/product/${product.id}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          onClick={() => setNotificationsOpen(false)}
                        >
                          <div className="w-12 h-12 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                            <img
                              src={product.image || 'https://via.placeholder.com/48'}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/48'; }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{product.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">₹{product.price}</p>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800">
                    <Link
                      to="/products"
                      className="text-sm text-primary-600 hover:underline"
                      onClick={() => setNotificationsOpen(false)}
                    >
                      View all products
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {user ? (
              <div className="relative ml-2">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-sm">
                      {user.name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 max-w-20 lg:max-w-24 truncate">{user.name}</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-50" onMouseLeave={() => setDropdownOpen(false)}>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-gray-800 hover:text-primary-600" onClick={() => setDropdownOpen(false)}>
                        <MdDashboard className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    )}
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => setDropdownOpen(false)}>
                      <FiSettings className="w-4 h-4" /> My Profile
                    </Link>
                    <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => setDropdownOpen(false)}>
                      <FiPackage className="w-4 h-4" /> My Orders
                    </Link>
                    <hr className="my-1 border-gray-100 dark:border-gray-800" />
                    <button
                      type="button"
                      onClick={() => { logout(); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <FiLogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-3">
            {/* Theme Toggle (Mobile) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <FiMoon className="w-5 h-5" /> : <FiSun className="w-5 h-5" />}
            </button>
            <Link to="/cart" className="relative p-2 text-gray-600 dark:text-gray-300">
              <FiShoppingCart className="w-5 h-5" />
              {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>}
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-gray-600 dark:text-gray-300 cursor-pointer"
            >
              {menuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 dark:border-gray-800 mt-2">
            <form onSubmit={handleSearch} className="mt-3 mb-3">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </form>
            <div className="space-y-1">
              <Link to="/products" className="block px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg" onClick={() => setMenuOpen(false)}>Products</Link>
              <Link to="/wishlist" className="block px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg" onClick={() => setMenuOpen(false)}>Wishlist</Link>

              {/* Notifications (Mobile) - simplified as a link to products */}
              <Link to="/products" className="block px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg" onClick={() => setMenuOpen(false)}>
                <span className="flex items-center gap-2">
                  <FiBell className="w-4 h-4" /> Suggestions
                  {suggestions.length > 0 && (
                    <span className="bg-primary-500 text-white text-xs rounded-full px-2 py-0.5">{suggestions.length}</span>
                  )}
                </span>
              </Link>

              {user ? (
                <>
                  {user.role === 'admin' && <Link to="/admin" className="block px-4 py-2.5 text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium" onClick={() => setMenuOpen(false)}>Admin Dashboard</Link>}
                  <Link to="/profile" className="block px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg" onClick={() => setMenuOpen(false)}>Profile</Link>
                  <Link to="/orders" className="block px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg" onClick={() => setMenuOpen(false)}>Orders</Link>
                  <Link to="/my-designs" className="block px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg" onClick={() => setMenuOpen(false)}>My Designs</Link>
                  <button
                    type="button"
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link to="/login" className="flex-1 text-center py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200" onClick={() => setMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="flex-1 text-center py-2 bg-primary-600 text-white rounded-lg text-sm font-medium" onClick={() => setMenuOpen(false)}>Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}