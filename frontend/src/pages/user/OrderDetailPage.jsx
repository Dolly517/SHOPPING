import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import { PageLoader } from '../../components/common/Spinner';
import { FiPackage, FiMapPin, FiCreditCard, FiArrowLeft } from 'react-icons/fi';

function getStatusColor(status) {
  const map = { pending: 'bg-yellow-100 text-yellow-700', processing: 'bg-blue-100 text-blue-700', shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };
  return map[status] || 'bg-gray-100 text-gray-700';
}

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data)).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader />;
  if (!order) return <div className="text-center py-20"><p>Order not found</p></div>;

  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/orders" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        <FiArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
        <span className={`badge px-3 py-1 text-sm ${getStatusColor(order.status)}`}>{order.status}</span>
      </div>

      {/* Progress Tracker */}
      {order.status !== 'cancelled' && (
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute inset-x-0 top-4 h-0.5 bg-gray-200 z-0">
              <div className="h-full bg-primary-600 transition-all" style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}></div>
            </div>
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex flex-col items-center gap-1 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i <= currentStep ? 'bg-primary-600 text-white' : 'bg-white border-2 border-gray-200 text-gray-400'}`}>
                  {i < currentStep ? '✓' : i + 1}
                </div>
                <span className={`text-xs capitalize ${i <= currentStep ? 'text-primary-600 font-medium' : 'text-gray-400'}`}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="card p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2"><FiPackage className="w-4 h-4 text-primary-600" /> Order Items</h2>
            <div className="space-y-3">
              {order.orderItems?.map(item => (
                <div key={item.id} className="flex gap-3 items-center">
                  <img src={item.image || 'https://via.placeholder.com/60'} alt={item.name} className="w-14 h-14 object-cover rounded-lg" onError={(e) => { e.target.src = 'https://via.placeholder.com/60'; }} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity} × ${parseFloat(item.price).toFixed(2)}</p>
                  </div>
                  <span className="font-semibold text-sm">${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Shipping */}
          <div className="card p-5">
            <h2 className="font-semibold mb-3 flex items-center gap-2"><FiMapPin className="w-4 h-4 text-primary-600" /> Shipping Address</h2>
            {order.shippingAddress && (
              <p className="text-sm text-gray-600">
                {order.shippingAddress.fullName}<br />
                {order.shippingAddress.address}<br />
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                {order.shippingAddress.country}
              </p>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="card p-5 h-fit">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><FiCreditCard className="w-4 h-4 text-primary-600" /> Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${(parseFloat(order.totalPrice) - parseFloat(order.shippingPrice || 0) - parseFloat(order.taxPrice || 0)).toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{parseFloat(order.shippingPrice || 0) === 0 ? 'FREE' : `$${parseFloat(order.shippingPrice).toFixed(2)}`}</span></div>
            <div className="flex justify-between text-gray-600"><span>Tax</span><span>${parseFloat(order.taxPrice || 0).toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100"><span>Total</span><span>${parseFloat(order.totalPrice).toFixed(2)}</span></div>
          </div>
          <div className={`mt-4 p-3 rounded-lg text-sm ${order.isPaid ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
            {order.isPaid ? `✓ Paid on ${new Date(order.paidAt).toLocaleDateString()}` : '⚠ Payment Pending'}
          </div>
        </div>
      </div>
    </div>
  );
}
