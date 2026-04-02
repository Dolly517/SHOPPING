import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { PageLoader } from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { FiEye, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// Naya Function: Order ID ko professional banane ke liye
const formatOrderId = (id) => {
  if (!id) return '';
  return `ORD-${String(id).padStart(6, '0')}`;
};

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

function getStatusColor(status) {
  const map = { pending: 'bg-yellow-100 text-yellow-700', processing: 'bg-blue-100 text-blue-700', shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };
  return map[status] || 'bg-gray-100 text-gray-700';
}

function getAngleLabel(angleKey) {
  if (!angleKey) return 'Custom View';
  const match = /^angle-(\d+)$/.exec(String(angleKey));
  if (!match) return angleKey;
  return `Angle ${Number(match[1]) + 1}`;
}

function getApiOrigin() {
  const apiBase = import.meta.env.VITE_API_URL;
  if (!apiBase || typeof apiBase !== 'string') return '';

  try {
    const url = new URL(apiBase, window.location.origin);
    return url.origin;
  } catch {
    return '';
  }
}

function resolveMediaUrl(src) {
  if (!src || typeof src !== 'string') return '';
  if (src.startsWith('data:') || src.startsWith('blob:')) return src;
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith('/')) {
    const apiOrigin = getApiOrigin();
    return apiOrigin ? `${apiOrigin}${src}` : src;
  }
  return src;
}

function getFirstAnglePreview(customization) {
  if (!customization || typeof customization !== 'object') return '';
  const entries = customization.anglePreviews && typeof customization.anglePreviews === 'object'
    ? Object.values(customization.anglePreviews)
    : [];
  const firstPreview = entries.find((src) => typeof src === 'string' && src.trim());
  return firstPreview || '';
}

function getAllAngleKeys(customization) {
  if (!customization || typeof customization !== 'object') return [];

  const previewKeys = customization.anglePreviews && typeof customization.anglePreviews === 'object'
    ? Object.keys(customization.anglePreviews)
    : [];
  const editedKeys = Array.isArray(customization.editedAngles)
    ? customization.editedAngles
    : [];
  const byAngleKeys = customization.designData?.byAngle && typeof customization.designData.byAngle === 'object'
    ? Object.keys(customization.designData.byAngle)
    : [];

  return Array.from(new Set([...previewKeys, ...editedKeys, ...byAngleKeys]));
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState('');
  const [viewOrder, setViewOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, pageSize: 12 };
      if (filterStatus) params.status = filterStatus;
      const { data } = await api.get('/admin/orders', { params });
      setOrders(data.orders);
      setPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [page, filterStatus]);

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/admin/orders/${orderId}`, { status });
      toast.success('Order status updated!');
      fetchOrders();
      if (viewOrder?.id === orderId) setViewOrder(prev => ({ ...prev, status }));
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">{total} orders total</p>
        </div>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="input-field w-full sm:w-40 text-sm py-2">
          <option value="">All Status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Order</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Customer</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Total</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Payment</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center text-gray-400">Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-gray-400">No orders found</td></tr>
              ) : orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{formatOrderId(order.id)}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{order.user?.name}</p>
                    <p className="text-xs text-gray-400">{order.user?.email}</p>
                  </td>
                  {/* CLEANED 1: Completely removed * 83 here */}
                  <td className="py-3 px-4 text-right font-semibold">
                    ₹{parseFloat(order.totalPrice).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`badge ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.isPaid ? 'Paid' : 'Pending'}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <select
                      value={order.status}
                      onChange={e => updateStatus(order.id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${getStatusColor(order.status)}`}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => setViewOrder(order)} className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-200 transition-colors ml-auto">
                      <FiEye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 p-4 border-t border-gray-100">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary py-1.5 px-3 disabled:opacity-40">
              <FiChevronLeft className="w-4 h-4" />
            </button>
            {[...Array(Math.min(pages, 5))].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 rounded-lg text-sm font-medium ${page === i + 1 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{i + 1}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary py-1.5 px-3 disabled:opacity-40">
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {viewOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setViewOrder(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold">{formatOrderId(viewOrder.id)}</h2>
              <div className="flex items-center gap-2">
                <span className={`badge ${getStatusColor(viewOrder.status)}`}>{viewOrder.status}</span>
                <button onClick={() => setViewOrder(null)} className="text-gray-400 hover:text-gray-600 ml-2">✕</button>
              </div>
            </div>
            <div className="p-4 sm:p-5 space-y-5">
              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2">Customer</h3>
                <p className="text-sm">{viewOrder.user?.name} • {viewOrder.user?.email}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2">Items ({viewOrder.orderItems?.length})</h3>
                <div className="space-y-3">
                  {viewOrder.orderItems?.map(item => (
                    <div key={item.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">{item.name} × {item.quantity}</span>
                        <span className="font-semibold">
                          ₹{(parseFloat(item.price) * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      {/* Show customization preview if exists */}
                      {(() => {
                        const primaryPreviewSrc = resolveMediaUrl(item.customization?.previewImage);
                        const fallbackPreviewSrc = resolveMediaUrl(getFirstAnglePreview(item.customization));
                        const customDesignSrc = primaryPreviewSrc || fallbackPreviewSrc;

                        if (!customDesignSrc) return null;

                        return (
                        <div>
                          <p className="text-xs text-gray-600 mb-2">Custom Design:</p>
                          <img
                            src={customDesignSrc}
                            alt="custom-design"
                            className="w-20 h-20 object-cover rounded border border-gray-300"
                            onError={(event) => {
                              if (!fallbackPreviewSrc || event.currentTarget.src === fallbackPreviewSrc) return;
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = fallbackPreviewSrc;
                            }}
                          />
                        </div>
                        );
                      })()}

                      {Array.isArray(item.customization?.editedAngles) && item.customization.editedAngles.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600 mb-1">Edited Angles:</p>
                          <div className="flex flex-wrap gap-1">
                            {item.customization.editedAngles.map((angleKey) => (
                              <span
                                key={angleKey}
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700"
                              >
                                {getAngleLabel(angleKey)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {(() => {
                        const angleKeys = getAllAngleKeys(item.customization);
                        if (angleKeys.length === 0) return null;

                        return (
                        <div className="mt-3">
                          <p className="text-xs text-gray-600 mb-2">All Customized Views:</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {angleKeys.map((angleKey) => {
                                const rawPreviewSrc = item.customization?.anglePreviews?.[angleKey];
                                const baseSrc = resolveMediaUrl(item.customization?.angleSources?.[angleKey]);
                                const previewSrc = resolveMediaUrl(rawPreviewSrc);
                                return (
                                <div key={angleKey}>
                                  <div className="relative w-full aspect-square rounded border border-gray-300 overflow-hidden bg-white">
                                    {baseSrc && (
                                      <img
                                        src={baseSrc}
                                        alt={`${getAngleLabel(angleKey)} base`}
                                        className="absolute inset-0 w-full h-full object-contain"
                                      />
                                    )}
                                    {previewSrc && (
                                      <img
                                        src={previewSrc}
                                        alt={getAngleLabel(angleKey)}
                                        className="absolute inset-0 w-full h-full object-contain"
                                      />
                                    )}
                                  </div>
                                  <p className="text-[10px] text-center text-gray-600 mt-1">{getAngleLabel(angleKey)}</p>
                                </div>
                                );
                              })}
                          </div>
                        </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                {/* CLEANED 3: Completely removed * 83 here */}
                <span>
                  ₹{parseFloat(viewOrder.totalPrice).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                <select value={viewOrder.status} onChange={e => { updateStatus(viewOrder.id, e.target.value); setViewOrder(prev => ({...prev, status: e.target.value})); }} className="input-field text-sm">
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}