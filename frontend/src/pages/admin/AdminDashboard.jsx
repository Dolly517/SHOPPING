import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { PageLoader } from '../../components/common/Spinner';
import { MdPeople, MdShoppingBag, MdAttachMoney, MdInventory } from 'react-icons/md';
import { FiTrendingUp, FiClock } from 'react-icons/fi';

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="card p-6 shadow-sm border border-gray-100 bg-white rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      <p className="text-3xl font-black text-gray-900">{value}</p>
    </div>
  );
}

function getStatusColor(status) {
  const map = { 
    pending: 'bg-yellow-100 text-yellow-700', 
    processing: 'bg-blue-100 text-blue-700', 
    shipped: 'bg-purple-100 text-purple-700', 
    delivered: 'bg-green-100 text-green-700', 
    cancelled: 'bg-red-100 text-red-700' 
  };
  return map[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  // -----------------------------------------------------------------
  // REVENUE FIX: No more * 83. Direct display from Database.
  // -----------------------------------------------------------------
  const stats = [
    { 
      icon: MdPeople, 
      label: 'Total Users', 
      value: data?.totalUsers?.toLocaleString() || '0', 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      icon: MdShoppingBag, 
      label: 'Total Orders', 
      value: data?.totalOrders?.toLocaleString() || '0', 
      color: 'text-purple-600', 
      bg: 'bg-purple-50' 
    },
    { 
      icon: MdAttachMoney, 
      label: 'Total Revenue', 
      // FIXED: Removed * 83 here
      value: `₹${parseFloat(data?.totalRevenue || 0).toLocaleString('en-IN')}`, 
      color: 'text-green-600', 
      bg: 'bg-green-50' 
    },
    { 
      icon: MdInventory, 
      label: 'Total Products', 
      value: data?.totalProducts?.toLocaleString() || '0', 
      color: 'text-orange-600', 
      bg: 'bg-orange-50' 
    },
  ];

  return (
    <div className="space-y-8 p-2">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-gray-500 font-medium mt-1">Real-time insights into your store's performance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <FiClock className="w-5 h-5 text-primary-600" /> Recent Transactions
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {data?.recentOrders?.length === 0 ? (
              <div className="p-12 text-center text-gray-400 font-medium">No recent orders found</div>
            ) : (
              data?.recentOrders?.map(order => (
                <div key={order.id} className="p-5 flex items-center justify-between hover:bg-gray-50/80 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xs">
                      #{order.id.toString().slice(-3)}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">{order.user?.name || 'Guest User'}</p>
                      <p className="text-[11px] text-gray-400 font-medium">
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="text-base font-black text-gray-900">
                      {/* FIXED: Removed * 83 here as well */}
                      ₹{parseFloat(order.totalPrice || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-6">
            <FiTrendingUp className="w-5 h-5 text-primary-600" /> Order Segmentation
          </h2>
          <div className="space-y-5">
            {data?.ordersByStatus?.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-10 font-medium">No status data</p>
            ) : (
              data?.ordersByStatus?.map(({ status, count }) => (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{status}</span>
                    <span className="text-sm font-black text-gray-900">{count}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-500 rounded-full" 
                      style={{ width: `${Math.min(100, (count / (data.totalOrders || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}