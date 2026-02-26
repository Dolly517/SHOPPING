import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../../context/CartContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiLock, FiPackage, FiCreditCard } from 'react-icons/fi';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

function CheckoutForm({ shippingAddress, cartItems, cartTotal, shipping, tax, total, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const { clearCart } = useCart();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    try {
      // Create order first
      const orderData = {
        orderItems: cartItems.map(item => ({
          productId: item.productId,
          name: item.product?.name,
          quantity: item.quantity,
          price: parseFloat(item.product?.price || 0),
          image: item.product?.image,
        })),
        shippingAddress,
        paymentMethod: 'stripe',
        itemsPrice: cartTotal,
        taxPrice: tax,
        shippingPrice: shipping,
        totalPrice: total,
      };
      const { data: order } = await api.post('/orders', orderData);

      // Create payment intent
      const { data: { clientSecret } } = await api.post('/orders/payment-intent', { amount: total });

      // Confirm payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name: shippingAddress.fullName },
        },
      });

      if (result.error) {
        toast.error(result.error.message);
        setProcessing(false);
        return;
      }

      // Mark as paid
      await api.put(`/orders/${order.id}/pay`, { paymentIntentId: result.paymentIntent.id });
      await clearCart();
      toast.success('Order placed successfully!');
      onSuccess(order.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="card p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <FiCreditCard className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold">Payment Details</h3>
          <FiLock className="w-4 h-4 text-green-500 ml-auto" />
          <span className="text-xs text-green-600">Secure</span>
        </div>
        <div className="p-3 border border-gray-300 rounded-lg">
          <CardElement options={{ style: { base: { fontSize: '16px', color: '#374151', '::placeholder': { color: '#9ca3af' } } } }} />
        </div>
        <p className="text-xs text-gray-400 mt-2">Test card: 4242 4242 4242 4242 | 12/34 | 123</p>
      </div>
      <button type="submit" disabled={!stripe || processing} className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base">
        <FiLock className="w-4 h-4" />
        {processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, cartTotal } = useCart();
  const [step, setStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState({ fullName: '', address: '', city: '', postalCode: '', country: '' });

  const shipping = cartTotal > 50 ? 0 : 9.99;
  const tax = cartTotal * 0.08;
  const total = cartTotal + shipping + tax;

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-4 mb-8">
        {[{ num: 1, label: 'Shipping' }, { num: 2, label: 'Payment' }].map(({ num, label }) => (
          <div key={num} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= num ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{num}</div>
            <span className={`text-sm font-medium ${step >= num ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
            {num < 2 && <div className={`w-12 h-0.5 ${step > num ? 'bg-primary-600' : 'bg-gray-200'}`}></div>}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          {step === 1 && (
            <form onSubmit={handleShippingSubmit} className="card p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <FiPackage className="w-5 h-5 text-primary-600" />
                <h2 className="font-semibold text-lg">Shipping Address</h2>
              </div>
              {[
                { name: 'fullName', label: 'Full Name', placeholder: 'John Doe' },
                { name: 'address', label: 'Address', placeholder: '123 Main St' },
                { name: 'city', label: 'City', placeholder: 'New York' },
                { name: 'postalCode', label: 'Postal Code', placeholder: '10001' },
                { name: 'country', label: 'Country', placeholder: 'United States' },
              ].map(({ name, label, placeholder }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input value={shippingAddress[name]} onChange={e => setShippingAddress(p => ({ ...p, [name]: e.target.value }))} required placeholder={placeholder} className="input-field" />
                </div>
              ))}
              <button type="submit" className="btn-primary w-full py-3">Continue to Payment</button>
            </form>
          )}

          {step === 2 && (
            <>
              <button onClick={() => setStep(1)} className="text-sm text-primary-600 mb-4 hover:underline">← Back to Shipping</button>
              <div className="card p-4 mb-4 text-sm text-gray-600">
                <p className="font-medium text-gray-900 mb-1">Shipping to:</p>
                <p>{shippingAddress.fullName} • {shippingAddress.address}, {shippingAddress.city} {shippingAddress.postalCode}, {shippingAddress.country}</p>
              </div>
              <Elements stripe={stripePromise}>
                <CheckoutForm
                  shippingAddress={shippingAddress}
                  cartItems={cartItems}
                  cartTotal={cartTotal}
                  shipping={shipping}
                  tax={tax}
                  total={total}
                  onSuccess={(orderId) => navigate(`/order-success/${orderId}`)}
                />
              </Elements>
            </>
          )}
        </div>

        {/* Summary */}
        <div className="lg:col-span-2">
          <div className="card p-5 sticky top-24">
            <h3 className="font-semibold mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex gap-3 items-center">
                  <img src={item.product?.image || 'https://via.placeholder.com/50'} alt={item.product?.name} className="w-12 h-12 object-cover rounded-lg" onError={(e) => { e.target.src = 'https://via.placeholder.com/50'; }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.product?.name}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold">${(parseFloat(item.product?.price || 0) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${cartTotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span></div>
              <div className="flex justify-between text-gray-600"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
