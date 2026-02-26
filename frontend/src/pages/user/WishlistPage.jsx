import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import { FiTrash2, FiShoppingCart, FiHeart } from 'react-icons/fi';
import StarRating from '../../components/common/StarRating';

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist ({wishlist.length})</h1>
      {wishlist.length === 0 ? (
        <div className="text-center py-20">
          <FiHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-500 mb-6">Save items you love to your wishlist</p>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {wishlist.map(item => (
            <div key={item.id} className="card group hover:shadow-md transition-all">
              <div className="relative">
                <img src={item.product?.image || 'https://via.placeholder.com/300x200'} alt={item.product?.name} className="w-full h-44 object-cover" onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200'; }} />
                <button onClick={() => toggleWishlist(item.product)} className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                  <FiTrash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-4">
                <Link to={`/products/${item.productId}`} className="font-semibold text-sm text-gray-900 hover:text-primary-600 line-clamp-2 block mb-1">{item.product?.name}</Link>
                <StarRating rating={parseFloat(item.product?.rating || 0)} numReviews={item.product?.numReviews} />
                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold text-gray-900">${parseFloat(item.product?.price || 0).toFixed(2)}</span>
                  <button onClick={() => addToCart(item.product, 1)} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5">
                    <FiShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
