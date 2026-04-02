import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import StarRating from '../../components/common/StarRating';
import ProductCard from '../../components/common/ProductCard';
import { PageLoader } from '../../components/common/Spinner';
import {
  FiShoppingCart, FiHeart, FiChevronRight, FiMinus, FiPlus,
  FiArrowLeft, FiCheckCircle, FiStar, FiThumbsUp, FiEdit
} from 'react-icons/fi';
import { MdFlashOn } from 'react-icons/md';
import toast from 'react-hot-toast';

const SHOE_KEYWORDS = ['shoe', 'shoes', 'sneaker', 'sneakers', 'boot', 'boots', 'sandal', 'sandals', 'loafer', 'loafers', 'slipper', 'slippers', 'heel', 'heels', 'trainer', 'trainers', 'footwear'];
const ACCESSORY_KEYWORDS = ['bag', 'bags', 'handbag', 'handbags', 'backpack', 'backpacks', 'tote', 'wallet', 'wallets', 'belt', 'belts', 'cap', 'caps', 'hat', 'hats', 'sunglass', 'sunglasses', 'watch', 'watches', 'jewelry', 'earring', 'earrings'];
const CLOTHING_KEYWORDS = ['cloth', 'clothing', 'shirt', 't-shirt', 'tshirt', 'tee', 'kurta', 'hoodie', 'jacket', 'jean', 'pant', 'trouser', 'dress', 'top', 'sweater', 'coat'];

const hasAnyKeyword = (text, keywords) => keywords.some((keyword) => text.includes(keyword));

const getSizeConfig = (productData = {}) => {
  const category = (productData.category || '').toLowerCase();
  const searchText = `${productData.name || ''} ${productData.description || ''} ${category}`.toLowerCase();

  const isShoe = hasAnyKeyword(searchText, SHOE_KEYWORDS);
  const isAccessory = hasAnyKeyword(searchText, ACCESSORY_KEYWORDS);
  const isClothingCategory = category.includes('cloth') || category.includes('fashion');
  const isClothing = !isShoe && !isAccessory && (isClothingCategory || hasAnyKeyword(searchText, CLOTHING_KEYWORDS));

  if (isShoe) {
    return { isShoe: true, isClothing: false, sizeOptions: ['6', '7', '8', '9', '10', '11'], defaultSize: '8' };
  }

  if (isClothing) {
    return { isShoe: false, isClothing: true, sizeOptions: ['S', 'M', 'L', 'XL'], defaultSize: 'M' };
  }

  return { isShoe: false, isClothing: false, sizeOptions: [], defaultSize: '' };
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [suggested, setSuggested] = useState([]);
  const [loadingSuggested, setLoadingSuggested] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
        // Set default size only for products that truly require size selection.
        if (data) {
          const { defaultSize } = getSizeConfig(data);
          setSelectedSize(defaultSize);
          // Fetch suggested products after product loads
          fetchSuggested(data.category);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const fetchSuggested = async (category) => {
    if (!category) return;
    setLoadingSuggested(true);
    try {
      // Assuming endpoint accepts category and excludes current product
      const { data } = await api.get('/products', {
        params: { category, pageSize: 6, exclude: id }
      });
      setSuggested(data.products || []);
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
    } finally {
      setLoadingSuggested(false);
    }
  };

  const handleAddToCart = () => {
    addToCart({ ...product, selectedSize }, quantity);
    toast.success('Added to Cart');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to review'); return; }
    setSubmittingReview(true);
    try {
      await api.post(`/products/${id}/reviews`, reviewForm);
      toast.success('Review submitted!');
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
      setReviewForm({ rating: 5, title: '', comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!product) return <div className="text-center py-20 font-bold italic text-gray-400 dark:text-gray-500">Product not found</div>;

  const inWishlist = isInWishlist(product.id);
  const { sizeOptions } = getSizeConfig(product);
  const shouldShowCustomize = Boolean(product.isCustomizable);
  const price = parseFloat(product.price);
  const discount = 25; // mock discount, adjust as needed

  // Review summary
  const reviews = product.reviews || [];
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0';
  const ratingCounts = [5,4,3,2,1].map(star => reviews.filter(r => r.rating === star).length);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        
        {/* Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <nav className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-medium min-w-0 overflow-x-auto whitespace-nowrap pb-1 sm:pb-0">
            <Link to="/" className="hover:text-primary-600">Home</Link>
            <FiChevronRight className="w-3 h-3" />
            <Link to="/products" className="hover:text-primary-600">Products</Link>
            <FiChevronRight className="w-3 h-3" />
            <span className="text-gray-400 dark:text-gray-500 truncate max-w-[200px]">{product.name}</span>
          </nav>
          <button
            onClick={() => navigate(-1)}
            className="self-start sm:self-auto text-xs font-semibold text-primary-600 flex items-center gap-1 border border-primary-200 dark:border-primary-800 px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 shadow-sm hover:bg-primary-50"
          >
            <FiArrowLeft className="w-3 h-3" /> Back
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 items-start">
          
          {/* Left: Image Gallery */}
          <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 lg:sticky lg:top-24">
            <div className="relative rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-700 group">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-[280px] sm:h-[400px] md:h-[500px] object-contain p-4 sm:p-6 transition-transform duration-500 group-hover:scale-105"
              />
              <button
                onClick={() => { if (!user) { toast.error('Please login'); return; } toggleWishlist(product); }}
                className="absolute top-4 right-4 w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md border border-gray-200 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-90"
              >
                <FiHeart className={inWishlist ? 'text-red-500 fill-current' : 'text-gray-400 dark:text-gray-500'} size={20} />
              </button>
            </div>
            
            {/* Desktop Action Buttons */}
            <div className="hidden lg:flex gap-3 mt-5">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 border-2 border-primary-600 text-primary-600 py-3.5 rounded-xl font-bold text-sm hover:bg-primary-50 transition-all"
              >
                <FiShoppingCart size={18} /> ADD TO CART
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-primary-700 shadow-lg shadow-primary-100">
                <MdFlashOn size={20} /> BUY NOW
              </button>
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="space-y-4 min-w-0">
            
            {/* Price Card */}
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">{product.name}</h1>
              <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 mb-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">₹{price.toLocaleString('en-IN')}</span>
                <span className="text-sm text-gray-400 line-through">₹{(price * (1 + discount/100)).toFixed(0)}</span>
                <span className="text-green-600 font-semibold text-sm bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">{discount}% OFF</span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1 bg-green-600 text-white text-xs px-2 py-0.5 rounded">
                  <span>{avgRating}</span>
                  <FiStar className="fill-current w-3 h-3" />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{totalReviews} Ratings & {totalReviews} Reviews</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                <FiCheckCircle className="text-green-500 w-4 h-4" /> Free Delivery
              </div>
            </div>

            {/* Size & Quantity Card */}
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              {sizeOptions.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-3 text-sm">Select Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 rounded-full border-2 text-sm font-semibold transition-all ${
                          selectedSize === size
                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-600 shadow'
                            : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-3 text-sm">Quantity</h3>
                <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700 w-fit p-1 rounded-2xl border border-gray-100 dark:border-gray-600">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity === 1}
                    className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm flex items-center justify-center text-gray-500 hover:text-primary-600 disabled:opacity-30 transition-all"
                  >
                    <FiMinus size={16} strokeWidth={3} />
                  </button>
                  <div className="min-w-[40px] text-center">
                    <span className="text-lg font-bold text-gray-800 dark:text-white">{quantity}</span>
                  </div>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm flex items-center justify-center text-gray-500 hover:text-primary-600 disabled:opacity-30 transition-all"
                  >
                    <FiPlus size={16} strokeWidth={3} />
                  </button>
                </div>
                {product.stock <= 5 && product.stock > 0 && (
                  <p className="text-xs text-orange-500 mt-2">Only {product.stock} left in stock</p>
                )}
              </div>

              {/* Mobile fallback action buttons (in-content) */}
              <div className="lg:hidden grid grid-cols-2 gap-3 mt-5">
                <button
                  onClick={handleAddToCart}
                  className="border-2 border-primary-600 text-primary-600 py-3 rounded-xl font-bold text-sm hover:bg-primary-50 transition"
                >
                  Add to Cart
                </button>
                <button className="bg-primary-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary-100 hover:bg-primary-700 transition">
                  Buy Now
                </button>
              </div>
            </div>

            {/* Customization Card */}
            {shouldShowCustomize && (
              <Link
                to={`/customize/${product.id}`}
                className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                    <FiEdit className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Customize This Product</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Add text, stickers & personalize</p>
                  </div>
                </div>
                <FiChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
            )}

            {/* Product Specifications Table */}
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-4 text-sm border-b border-gray-100 dark:border-gray-700 pb-2">Specifications</h3>
              <div className="space-y-2">
                {[
                  { label: 'Category', value: product.category },
                  { label: 'Brand', value: product.brand || 'Generic' },
                  { label: 'Availability', value: product.stock > 0 ? 'In Stock' : 'Out of Stock', class: product.stock > 0 ? 'text-green-600' : 'text-red-600' },
                  { label: 'Delivery', value: '7 Days Replacement' },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col sm:flex-row py-1 border-b border-gray-50 dark:border-gray-700 last:border-0 gap-0.5 sm:gap-0">
                    <span className="sm:w-1/3 text-xs font-medium text-gray-500 dark:text-gray-400">{item.label}</span>
                    <span className={`sm:w-2/3 text-xs font-semibold ${item.class || 'text-gray-800 dark:text-white'}`}>{item.value}</span>
                  </div>
                ))}
              </div>
              {product.description && (
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 bg-primary-600 rounded-full"></div>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-white">About This Product</h4>
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {product.description.split('\n').filter(line => line.trim()).map((paragraph, idx) => (
                      <p
                        key={idx}
                        className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 mb-3 last:mb-0"
                      >
                        {paragraph.trim()}
                      </p>
                    ))}
                  </div>
                  {/* <div className="mt-5 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                      ℹ️ <span className="ml-1">Need more details? Contact our support team for personalized assistance.</span>
                    </p>
                  </div> */}
                </div>
              )}
            </div>

            {/* Customer Reviews Section */}
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-5 text-lg">Customer Reviews</h3>

              {/* Rating Summary */}
              {totalReviews > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-800 dark:text-white">{avgRating}</div>
                    <div className="flex items-center gap-1 mt-1">
                      {[1,2,3,4,5].map(star => (
                        <FiStar
                          key={star}
                          className={`w-4 h-4 ${star <= Math.round(avgRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{totalReviews} reviews</div>
                  </div>
                  <div className="flex-1 space-y-1">
                    {[5,4,3,2,1].map((star, idx) => {
                      const count = ratingCounts[5-star] || 0;
                      const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2 text-xs">
                          <span className="w-8 text-gray-600 dark:text-gray-400">{star} ★</span>
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percentage}%` }}></div>
                          </div>
                          <span className="w-8 text-gray-500 dark:text-gray-400">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Review Form - Always Visible */}
              {user ? (
                <form onSubmit={handleSubmitReview} className="mb-6 p-4 border border-gray-200 dark:border-gray-600 rounded-xl">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Write your review</h4>
                  <div className="mb-3">
                    <StarRating
                      rating={reviewForm.rating}
                      interactive
                      onChange={(r) => setReviewForm({...reviewForm, rating: r})}
                      size="lg"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Review title (optional)"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm({...reviewForm, title: e.target.value})}
                    className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:bg-gray-700"
                  />
                  <textarea
                    placeholder="Share your experience with this product..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                    className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:bg-gray-700"
                    rows="3"
                    required
                  />
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="bg-primary-600 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Please <Link to="/login" className="text-primary-600 font-semibold hover:underline">log in</Link> to write a review.
                  </p>
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-5">
                {reviews.length > 0 ? (
                  reviews.map((rev, idx) => (
                    <div key={rev.id || idx} className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-xs font-bold text-primary-700 dark:text-primary-300 uppercase">
                          {rev.user?.name?.[0] || rev.name?.[0] || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <span className="text-sm font-semibold text-gray-800 dark:text-white">{rev.user?.name || rev.name || 'Anonymous'}</span>
                            <div className="flex items-center gap-1 text-yellow-500">
                              {[...Array(5)].map((_, i) => (
                                <FiStar key={i} className={i < rev.rating ? 'fill-current w-3 h-3' : 'w-3 h-3 text-gray-300'} />
                              ))}
                            </div>
                          </div>
                          {rev.title && <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-1">"{rev.title}"</p>}
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{rev.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No reviews yet. Be the first to review this product!</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Suggested Products Section */}
        {suggested.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">You might also like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {suggested.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
        {loadingSuggested && (
          <div className="mt-12 text-center text-gray-500">Loading suggestions...</div>
        )}
      </div>

      {/* Mobile Sticky Buttons */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-3 pt-3 flex gap-3 z-[60] shadow-2xl"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      >
        <button
          onClick={handleAddToCart}
          className="flex-1 border-2 border-primary-600 text-primary-600 py-3 rounded-xl font-bold text-sm hover:bg-primary-50 transition"
        >
          Add to Cart
        </button>
        <button className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary-100 hover:bg-primary-700 transition">
          Buy Now
        </button>
      </div>
    </div>
  );
}