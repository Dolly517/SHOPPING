import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import StarRating from '../../components/common/StarRating';
import { PageLoader } from '../../components/common/Spinner';
import { FiShoppingCart, FiHeart, FiMinus, FiPlus, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
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
  if (!product) return <div className="text-center py-20"><p>Product not found</p></div>;

  const inWishlist = isInWishlist(product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
        <FiArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-10 mb-12">
        {/* Image */}
        <div className="bg-gray-100 rounded-2xl overflow-hidden">
          <img
            src={product.image || `https://via.placeholder.com/600x500?text=${encodeURIComponent(product.name)}`}
            alt={product.name}
            className="w-full h-96 md:h-[500px] object-cover"
            onError={(e) => { e.target.src = `https://via.placeholder.com/600x500?text=${encodeURIComponent(product.name)}`; }}
          />
        </div>

        {/* Details */}
        <div>
          <span className="badge bg-primary-100 text-primary-700 mb-3">{product.category}</span>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          {product.brand && <p className="text-gray-500 text-sm mb-3">by <span className="font-medium text-gray-700">{product.brand}</span></p>}
          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={parseFloat(product.rating || 0)} numReviews={product.numReviews} size="md" />
          </div>
          <div className="text-3xl font-bold text-primary-600 mb-4">${parseFloat(product.price).toFixed(2)}</div>
          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-6 ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </div>

          {product.stock > 0 && (
            <>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-8 h-8 rounded-md bg-white shadow flex items-center justify-center hover:bg-gray-50">
                    <FiMinus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center font-semibold">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="w-8 h-8 rounded-md bg-white shadow flex items-center justify-center hover:bg-gray-50">
                    <FiPlus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleAddToCart} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
                  <FiShoppingCart className="w-5 h-5" /> Add to Cart
                </button>
                <button
                  onClick={() => { if (!user) { toast.error('Please login'); return; } toggleWishlist(product); }}
                  className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all ${inWishlist ? 'border-red-500 bg-red-50 text-red-500' : 'border-gray-300 text-gray-400 hover:border-red-300'}`}
                >
                  <FiHeart className={`w-5 h-5 ${inWishlist ? 'fill-red-500' : ''}`} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold mb-4">Customer Reviews ({product.reviews?.length || 0})</h2>
          {product.reviews?.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl text-gray-400">
              <p>No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {product.reviews?.map(review => (
                <div key={review.id} className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-semibold text-xs">{review.user?.name?.[0]?.toUpperCase()}</span>
                      </div>
                      <span className="font-medium text-sm">{review.user?.name}</span>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>
                  {review.title && <p className="font-semibold text-sm mb-1">{review.title}</p>}
                  <p className="text-gray-600 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {user && (
          <div>
            <h3 className="text-lg font-bold mb-4">Write a Review</h3>
            <form onSubmit={handleSubmitReview} className="card p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <StarRating rating={reviewForm.rating} size="md" interactive onChange={r => setReviewForm(f => ({ ...f, rating: r }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input value={reviewForm.title} onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))} className="input-field text-sm" placeholder="Review title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                <textarea value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} required rows={4} className="input-field text-sm resize-none" placeholder="Share your experience..." />
              </div>
              <button type="submit" disabled={submittingReview} className="btn-primary w-full">
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
