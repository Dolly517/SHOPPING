import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import api from '../../utils/api'; 
import toast from 'react-hot-toast';

export default function CartPage() {
  const { cartItems, cartCount, updateCartItem, removeFromCart } = useCart();
  const [isFirstOrder, setIsFirstOrder] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if it's the user's first order for Free Shipping
  useEffect(() => {
    api.get('/orders/myorders')
      .then(({ data }) => {
        if (data && data.length === 0) {
          setIsFirstOrder(true);
        }
      })
      .catch(err => console.error("Order fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  // -----------------------------------------------------------------
  // CALCULATIONS (Direct INR Values - NO 83 MULTIPLICATION)
  // -----------------------------------------------------------------
  
  // 1. Subtotal (Direct Price * Quantity)
  const cleanCartTotal = cartItems.reduce((acc, item) => {
    const price = parseFloat(item.product?.price || 0);
    return acc + (price * item.quantity);
  }, 0);

  // 2. Smart Shipping Logic
  let shippingCost = 40; 
  if (isFirstOrder) {
    shippingCost = 0; 
  } else if (cleanCartTotal >= 1500) {
    shippingCost = 0; 
  } else if (cleanCartTotal > 0 && cleanCartTotal < 100) {
    shippingCost = 80; 
  }

  // 3. Final Total
  const finalTotal = cleanCartTotal + shippingCost;

  if (cartCount === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-8xl mb-6">🛒</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Start shopping to add items to your cart</p>
        <Link to="/products" className="btn-primary inline-flex items-center gap-2">
          <FiShoppingBag className="w-5 h-5" /> Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 sm:mb-6">Shopping Cart ({cartCount} items)</h1>
      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map(item => (
            <div key={item.id} className="card p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 bg-white border border-gray-100">
              <img
                src={item.product?.image || `https://via.placeholder.com/100?text=Product`}
                alt={item.product?.name}
                className="w-full sm:w-20 h-44 sm:h-20 object-cover rounded-lg flex-shrink-0"
                onError={(e) => { e.target.src = `https://via.placeholder.com/100?text=Product`; }}
              />

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <Link to={`/products/${item.productId}`} className="font-semibold text-gray-900 hover:text-primary-600 line-clamp-2 block text-sm">
                    {item.product?.name || "Loading..."}
                  </Link>
                  <button 
                    onClick={() => {
                        removeFromCart(item.id);
                        toast.success("Item removed");
                    }} 
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="text-sm text-gray-400 mt-0.5">{item.product?.category}</p>
                {item.customization && (
                  <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200">
                    Custom Design
                  </span>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                    <button 
                      onClick={() => updateCartItem(item.id, Math.max(1, item.quantity - 1))} 
                      className="w-7 h-7 rounded bg-white shadow flex items-center justify-center hover:bg-gray-50"
                    >
                      <FiMinus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                    <button 
                      onClick={() => updateCartItem(item.id, item.quantity + 1)} 
                      className="w-7 h-7 rounded bg-white shadow flex items-center justify-center hover:bg-gray-50"
                    >
                      <FiPlus className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="text-right ml-auto sm:ml-0">
                    <span className="font-bold text-gray-900">
                      ₹{(parseFloat(item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-4 sm:p-6 sticky top-24 bg-white border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">Order Summary</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cartCount} items)</span>
                <span className="font-medium text-gray-900">₹{cleanCartTotal.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="flex justify-between text-gray-600">
                <span className="flex items-center gap-2">
                  Shipping
                  {isFirstOrder && <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded font-bold">1st Order Free!</span>}
                </span>
                <span className={`font-medium ${shippingCost === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                  {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                </span>
              </div>
              
              {/* Promotion UI */}
              {!isFirstOrder && cleanCartTotal < 1500 && (
                <div className="p-2 bg-blue-50 text-blue-700 rounded text-[11px] font-medium">
                  Add ₹{(1500 - cleanCartTotal).toLocaleString('en-IN')} more for FREE delivery!
                </div>
              )}

              <div className="border-t border-gray-100 pt-3 flex justify-between items-center font-bold text-gray-900">
                <span className="text-base">Total</span>
                <span className="text-xl">₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
            
            <Link 
              to="/checkout" 
              className="btn-primary w-full flex items-center justify-center gap-2 mt-6 py-3 text-base shadow-lg shadow-primary-100"
            >
              Proceed to Checkout <FiArrowRight className="w-5 h-5" />
            </Link>
            
            <Link to="/products" className="block text-center text-sm text-gray-500 mt-4 hover:text-primary-600 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}