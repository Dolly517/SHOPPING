import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiArrowRight } from 'react-icons/fi';

export default function CartPage() {
  const { cartItems, cartTotal, cartCount, updateCartItem, removeFromCart, loading } = useCart();

  const shipping = cartTotal > 50 ? 0 : 9.99;
  const tax = cartTotal * 0.08;
  const total = cartTotal + shipping + tax;

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart ({cartCount} items)</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map(item => (
            <div key={item.id} className="card p-4 flex gap-4">
              <img
                src={item.product?.image || `https://via.placeholder.com/100?text=${encodeURIComponent(item.product?.name || '')}`}
                alt={item.product?.name}
                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                onError={(e) => { e.target.src = `https://via.placeholder.com/100?text=Product`; }}
              />
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.productId}`} className="font-semibold text-gray-900 hover:text-primary-600 line-clamp-2 block text-sm">
                  {item.product?.name}
                </Link>
                <p className="text-sm text-gray-400 mt-0.5">{item.product?.category}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                    <button onClick={() => updateCartItem(item.id, item.quantity - 1)} className="w-7 h-7 rounded bg-white shadow flex items-center justify-center hover:bg-gray-50">
                      <FiMinus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => updateCartItem(item.id, item.quantity + 1)} className="w-7 h-7 rounded bg-white shadow flex items-center justify-center hover:bg-gray-50">
                      <FiPlus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">${(parseFloat(item.product?.price || 0) * item.quantity).toFixed(2)}</span>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 transition-colors">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cartCount} items)</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              {shipping === 0 && <p className="text-xs text-green-600">🎉 Free shipping on orders over $50!</p>}
              <div className="flex justify-between text-gray-600">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <Link to="/checkout" className="btn-primary w-full flex items-center justify-center gap-2 mt-5 py-3">
              Proceed to Checkout <FiArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/products" className="btn-secondary w-full mt-2 flex items-center justify-center text-sm py-2.5">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
