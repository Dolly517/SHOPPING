import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { PageLoader } from '../../components/common/Spinner';
import { MdPeople, MdShoppingBag, MdAttachMoney, MdInventory } from 'react-icons/md';
import { FiTrendingUp, FiClock } from 'react-icons/fi';

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function getStatusColor(status) {
  const map = { pending: 'bg-yellow-100 text-yellow-700', processing: 'bg-blue-100 text-blue-700', shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };
  return map[status] || 'bg-gray-100 text-gray-700';
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => setData(data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const stats = [
    { icon: MdPeople, label: 'Total Users', value: data?.totalUsers?.toLocaleString() || '0', color: 'text-blue-600', bg: 'bg-blue-100' },
    { icon: MdShoppingBag, label: 'Total Orders', value: data?.totalOrders?.toLocaleString() || '0', color: 'text-purple-600', bg: 'bg-purple-100' },
    { icon: MdAttachMoney, label: 'Total Revenue', value: `$${(data?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: 'text-green-600', bg: 'bg-green-100' },
    { icon: MdInventory, label: 'Total Products', value: data?.totalProducts?.toLocaleString() || '0', color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 card">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <FiClock className="w-4 h-4 text-primary-600" /> Recent Orders
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {data?.recentOrders?.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No orders yet</div>
            ) : (
              data?.recentOrders?.map(order => (
                <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-sm text-gray-900">Order #{order.id}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{order.user?.name} • {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${getStatusColor(order.status)}`}>{order.status}</span>
                    <span className="font-semibold text-sm text-gray-900">${parseFloat(order.totalPrice).toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="card">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <FiTrendingUp className="w-4 h-4 text-primary-600" /> Orders by Status
            </h2>
          </div>
          <div className="p-5 space-y-3">
            {data?.ordersByStatus?.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No data available</p>
            ) : (
              data?.ordersByStatus?.map(({ status, count }) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`badge ${getStatusColor(status)}`}>{status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full" style={{ width: `${Math.min(100, (count / (data.totalOrders || 1)) * 100)}%` }}></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 w-6 text-right">{count}</span>
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
