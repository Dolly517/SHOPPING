import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  MdDashboard, MdInventory, MdShoppingBag, MdPeople, MdMenu, MdClose, MdImage,
} from 'react-icons/md';
import { FiLogOut, FiHome, FiChevronRight } from 'react-icons/fi';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: MdDashboard, exact: true },
  { path: '/admin/products', label: 'Products', icon: MdInventory },
  { path: '/admin/stickers', label: 'Stickers', icon: MdImage },
  { path: '/admin/orders', label: 'Orders', icon: MdShoppingBag },
  { path: '/admin/users', label: 'Users', icon: MdPeople },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path, exact) => exact ? location.pathname === path : location.pathname.startsWith(path);

  const currentPage = navItems.find(item => isActive(item.path, item.exact))?.label || 'Admin';

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 lg:flex lg:flex-col`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SW</span>
            </div>
            <span className="text-white font-bold text-lg">Admin Panel</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <MdClose className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="text-white font-medium text-sm truncate">{user?.name}</p>
              <p className="text-gray-400 text-xs truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon, exact }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${isActive(path, exact) ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700 space-y-1">
          <Link to="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 text-sm font-medium transition-all">
            <FiHome className="w-4 h-4" /> Back to Store
          </Link>
          <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-gray-800 text-sm font-medium transition-all">
            <FiLogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Sidebar overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-3 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500">
              <MdMenu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 min-w-0">
              <span>Admin</span>
              <FiChevronRight className="w-3 h-3" />
              <span className="font-semibold text-gray-900 truncate">{currentPage}</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Admin Mode
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
