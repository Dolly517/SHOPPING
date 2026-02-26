import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import StarRating from './StarRating';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, 1);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to use wishlist'); return; }
    toggleWishlist(product);
  };

  const inWishlist = isInWishlist(product.id);

  return (
    <div className="product-card card group hover:shadow-lg transition-all duration-300">
      <div className="relative overflow-hidden bg-gray-50">
        <Link to={`/products/${product.id}`}>
          <img
            src={product.image || `https://via.placeholder.com/400x300?text=${encodeURIComponent(product.name)}`}
            alt={product.name}
            className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.src = `https://via.placeholder.com/400x300?text=${encodeURIComponent(product.name)}`; }}
          />
        </Link>
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-lg">Out of Stock</span>
          </div>
        )}
        {product.featured && (
          <span className="absolute top-2 left-2 badge bg-primary-100 text-primary-700">Featured</span>
        )}
        <div className="product-actions absolute bottom-3 right-3 flex gap-2">
          <button
            onClick={handleWishlist}
            className={`w-9 h-9 rounded-full shadow-md flex items-center justify-center transition-all ${inWishlist ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:text-red-500'}`}
          >
            <FiHeart className={`w-4 h-4 ${inWishlist ? 'fill-white' : ''}`} />
          </button>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-9 h-9 rounded-full bg-primary-600 text-white shadow-md flex items-center justify-center hover:bg-primary-700 transition-all disabled:opacity-50"
          >
            <FiShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{product.category}</p>
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-primary-600 transition-colors text-sm mb-1">
            {product.name}
          </h3>
        </Link>
        <StarRating rating={parseFloat(product.rating || 0)} numReviews={product.numReviews} />
        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-bold text-gray-900">${parseFloat(product.price).toFixed(2)}</span>
          {product.stock > 0 && product.stock <= 5 && (
            <span className="text-xs text-orange-500 font-medium">Only {product.stock} left!</span>
          )}
        </div>
      </div>
    </div>
  );
}
