import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import { FiCheckCircle, FiPackage } from 'react-icons/fi';

export default function OrderSuccessPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data)).catch(console.error);
  }, [id]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="flex justify-center mb-4">
        <FiCheckCircle className="w-16 h-16 text-green-500" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
      <p className="text-gray-500 mb-6">Thank you for your purchase. Your order #{id} has been placed successfully.</p>
      {order && (
        <div className="card p-6 text-left mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Order #{order.id}</h3>
            <span className={`badge ${getStatusColor(order.status)}`}>{order.status}</span>
          </div>
          <div className="space-y-3">
            {order.orderItems?.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.name} × {item.quantity}</span>
                <span className="font-medium">${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between font-bold">
            <span>Total</span>
            <span>${parseFloat(order.totalPrice).toFixed(2)}</span>
          </div>
        </div>
      )}
      <div className="flex gap-3 justify-center">
        <Link to="/orders" className="btn-primary flex items-center gap-2">
          <FiPackage className="w-4 h-4" /> View My Orders
        </Link>
        <Link to="/products" className="btn-secondary">Continue Shopping</Link>
      </div>
    </div>
  );
}

function getStatusColor(status) {
  const map = { pending: 'bg-yellow-100 text-yellow-700', processing: 'bg-blue-100 text-blue-700', shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };
  return map[status] || 'bg-gray-100 text-gray-700';
}
