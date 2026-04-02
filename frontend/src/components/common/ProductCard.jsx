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
    if (product.stock === 0) return;
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to use wishlist');
      return;
    }
    toggleWishlist(product);
  };

  const inWishlist = isInWishlist(product.id);

  const formatPrice = (price) => {
    const numericPrice = parseFloat(price || 0);
    return numericPrice.toLocaleString('en-IN');
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Image Container with Aspect Ratio */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
        <Link to={`/products/${product.id}`} className="block h-full w-full">
          <img
            src={product.image || `https://via.placeholder.com/400x400?text=${encodeURIComponent(product.name)}`}
            alt={product.name}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.target.src = `https://via.placeholder.com/400x400?text=${encodeURIComponent(product.name)}`;
            }}
          />
        </Link>

        {/* Overlay & Badges */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Out of Stock Badge */}
        {product.stock === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow-lg">
              Out of Stock
            </span>
          </div>
        )}

        {/* Featured Badge */}
        {product.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-yellow-400 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-900 shadow-sm">
            Featured
          </span>
        )}

        {/* Action Buttons - positioned absolutely */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={handleWishlist}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`flex h-9 w-9 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110 ${
              inWishlist
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500'
            }`}
          >
            <FiHeart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            aria-label="Add to cart"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg transition-all hover:scale-110 hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-primary-600"
          >
            <FiShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category */}
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          {product.category || 'General'}
        </p>

        {/* Product Name */}
        <Link to={`/products/${product.id}`} className="mb-2 block">
          <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100 line-clamp-2 transition-colors group-hover:text-primary-600">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mb-3">
          <StarRating rating={parseFloat(product.rating || 0)} numReviews={product.numReviews || 0} />
        </div>

        {/* Price and Stock Status */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">₹{formatPrice(product.price)}</span>
            {product.stock > 0 && product.stock <= 5 && (
              <span className="mt-1 text-xs font-medium text-orange-600">Only {product.stock} left</span>
            )}
          </div>

          {/* Optional: Quick add button for large screens (alternative to floating button) */}
          {product.stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary-600 transition-colors hover:bg-primary-100"
              aria-label="Quick add to cart"
            >
              <FiShoppingCart className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}