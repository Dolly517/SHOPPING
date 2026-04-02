import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../../context/CartContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiLock, FiPackage, FiCreditCard, FiDollarSign } from 'react-icons/fi';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

function CheckoutForm({ shippingAddress, cartItems, cartTotal, shipping, tax, total, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const { clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Step 1: Order Data Prepare Karo
      const orderData = {
        orderItems: cartItems.map(item => ({
          productId: item.productId,
          name: item.product?.name,
          quantity: item.quantity,
          price: parseFloat(item.product?.price || 0),
          image: item.product?.image,
          customization: item.customization || null, // Include customization data (previewImage + designData)
        })),
        shippingAddress,
        paymentMethod: paymentMethod === 'card' ? 'stripe' : 'COD',
        itemsPrice: cartTotal,
        taxPrice: tax,
        shippingPrice: shipping,
        totalPrice: total,
      };

      // Step 2: Order Create Karo (Backend par)
      const { data: order } = await api.post('/orders', orderData);

      // Step 3: Agar Card select kiya hai toh Stripe process karo
      if (paymentMethod === 'card') {
        if (!stripe || !elements) return;

        const { data: { clientSecret } } = await api.post('/orders/payment-intent', { amount: total });

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

        // Card payment success hone par backend ko 'Paid' notify karo
        await api.put(`/orders/${order.id}/pay`, { paymentIntentId: result.paymentIntent.id });
      }

      // Final Step: Cart clear karo aur redirect
      await clearCart();
      toast.success(`Order placed via ${paymentMethod === 'card' ? 'Card' : 'COD'}!`);
      onSuccess(order.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Payment Method Selection */}
      <div className="card p-5 mb-4 bg-white shadow-sm border border-gray-100">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <FiCreditCard className="text-primary-600" /> Select Payment Method
        </h3>
        <div className="space-y-3">
          <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-primary-600 bg-primary-50' : 'border-gray-200'}`}>
            <input type="radio" name="paymentMethod" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="w-4 h-4 text-primary-600" />
            <span className="ml-3 font-medium text-sm text-gray-700">Online Card</span>
          </label>
          <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary-600 bg-primary-50' : 'border-gray-200'}`}>
            <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-4 h-4 text-primary-600" />
            <span className="ml-3 font-medium text-sm text-gray-700">Cash on Delivery</span>
          </label>
        </div>
      </div>

      {/* Card Element UI (Only if Card is selected) */}
      {paymentMethod === 'card' && (
        <div className="card p-5 mb-4 bg-white shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-sm text-gray-800">Card Details</h3>
            <FiLock className="w-4 h-4 text-green-500 ml-auto" />
            <span className="text-[10px] text-green-600 uppercase font-bold">Secure</span>
          </div>
          <div className="p-3 border border-gray-300 rounded-lg bg-gray-50">
            <CardElement options={{ 
              hidePostalCode: true, // 👈 Isse ZIP/Postal code hat jayega
              style: { base: { fontSize: '16px', color: '#374151', '::placeholder': { color: '#9ca3af' } } } 
            }} />
          </div>
        </div>
      )}

      <button type="submit" disabled={processing} className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base shadow-lg shadow-primary-100">
        <FiLock className="w-4 h-4" />
        {processing ? 'Processing...' : `Place Order • ₹${total.toLocaleString('en-IN')}`}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, cartTotal } = useCart();
  const [step, setStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState({ fullName: '', address: '', city: '', postalCode: '', country: 'India' });
  const [isFirstOrder, setIsFirstOrder] = useState(false);

  useEffect(() => {
    api.get('/orders/myorders').then(({ data }) => {
      if (data && data.length === 0) setIsFirstOrder(true);
    }).catch(console.error);
  }, []);

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  // Shipping Logic (INR Based)
  let shippingCost = (isFirstOrder || cartTotal >= 1500) ? 0 : (cartTotal < 100 ? 80 : 40);
  const total = cartTotal + shippingCost;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 sm:mb-6">Checkout</h1>

      {/* Steps Indicator */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        {[{ num: 1, label: 'Shipping' }, { num: 2, label: 'Payment' }].map(({ num, label }) => (
          <div key={num} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= num ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{num}</div>
            <span className={`text-xs sm:text-sm font-medium ${step >= num ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
            {num < 2 && <div className={`w-8 sm:w-12 h-0.5 ${step > num ? 'bg-primary-600' : 'bg-gray-200'}`}></div>}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
        {/* Left Side: Address & Payment */}
        <div className="lg:col-span-3">
          {step === 1 ? (
            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="card p-4 sm:p-6 space-y-4 bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <FiPackage className="w-5 h-5 text-primary-600" />
                <h2 className="font-semibold text-lg">Shipping Address</h2>
              </div>
              {[
                { name: 'fullName', label: 'Full Name', placeholder: 'your name' },
                { name: 'address', label: 'Address', placeholder: 'House/Street details' },
                { name: 'city', label: 'City', placeholder: 'City' },
                { name: 'postalCode', label: 'PIN Code', placeholder: 'postal pincode' },
                { name: 'country', label: 'Country', placeholder: 'Country' },
              ].map(({ name, label, placeholder }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input value={shippingAddress[name]} onChange={e => setShippingAddress(p => ({ ...p, [name]: e.target.value }))} required placeholder={placeholder} className="input-field" />
                </div>
              ))}
              <button type="submit" className="btn-primary w-full py-3 mt-4">Continue to Payment</button>
            </form>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <button onClick={() => setStep(1)} className="text-sm text-primary-600 mb-2 font-medium hover:underline">← Change Address</button>
              <div className="card p-4 text-sm text-gray-600 bg-white border border-gray-100 shadow-sm">
                <p className="font-bold text-gray-900 mb-1">Delivering to:</p>
                <p>{shippingAddress.fullName} • {shippingAddress.address}, {shippingAddress.city} {shippingAddress.postalCode}</p>
              </div>
              <Elements stripe={stripePromise}>
                <CheckoutForm
                  shippingAddress={shippingAddress}
                  cartItems={cartItems}
                  cartTotal={cartTotal}
                  shipping={shippingCost}
                  tax={0}
                  total={total}
                  onSuccess={(orderId) => navigate(`/order-success/${orderId}`)}
                />
              </Elements>
            </div>
          )}
        </div>

        {/* Right Side: Summary Card */}
        <div className="lg:col-span-2">
          <div className="card p-4 sm:p-5 sticky top-24 bg-white border border-gray-100 shadow-sm">
            <h3 className="font-bold text-lg mb-4 border-b pb-2">Order Summary</h3>
            <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {cartItems.map(item => (
                <div key={item.id} className="flex gap-3 items-center">
                  <img src={item.product?.image} className="w-12 h-12 object-cover rounded-lg border border-gray-50" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.product?.name}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900">₹{(item.product?.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-100 pt-4 space-y-3 text-sm">
              <div className="flex justify-between text-gray-500 font-medium"><span>Subtotal</span><span className="text-gray-900">₹{cartTotal.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-gray-500 font-medium">
                <span>Shipping</span>
                <span className={shippingCost === 0 ? 'text-green-600 font-bold' : 'text-gray-900'}>
                   {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                </span>
              </div>
              <div className="flex justify-between font-black text-gray-900 pt-3 border-t border-gray-100 text-xl">
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}