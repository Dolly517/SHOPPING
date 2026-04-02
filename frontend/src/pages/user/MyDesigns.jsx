import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const getApiOrigin = () => {
  const apiBase = import.meta.env.VITE_API_URL;
  if (!apiBase || typeof apiBase !== 'string') return '';

  try {
    const url = new URL(apiBase, window.location.origin);
    return url.origin;
  } catch {
    return '';
  }
};

const resolveMediaUrl = (src) => {
  if (!src || typeof src !== 'string') return '';
  const trimmed = src.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  if (trimmed.startsWith('uploads/')) {
    const apiOrigin = getApiOrigin();
    return apiOrigin ? `${apiOrigin}/${trimmed}` : `/${trimmed}`;
  }

  if (trimmed.startsWith('/')) {
    const apiOrigin = getApiOrigin();
    return apiOrigin ? `${apiOrigin}${trimmed}` : trimmed;
  }

  return trimmed;
};

export default function MyDesigns() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!user) {
      toast.error('Please login to view your designs');
      navigate('/login');
      return;
    }

    const fetchDesigns = async () => {
      try {
        const res = await api.get('/custom/my-designs');
        setDesigns(res.data || []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load designs');
      } finally {
        setLoading(false);
      }
    };

    fetchDesigns();
  }, [user, navigate]);

  const handleUseDesign = (design) => {
    navigate(`/customize/${design.productId}?design=${design.id}`);
  };

  const handleAddToCart = (design) => {
    toast('Redirecting to customizer to add to cart...');
    navigate(`/customize/${design.productId}?design=${design.id}`);
  };

  const handleDeleteDesign = async (designId) => {
    const ok = window.confirm('Delete this saved design?');
    if (!ok) return;

    setDeletingId(designId);
    try {
      await api.delete(`/custom/design/${designId}`);
      setDesigns((prev) => prev.filter((item) => item.id !== designId));
      toast.success('Design deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete design');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500 dark:text-gray-300">
        Loading your designs...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Saved Designs</h1>

      {designs.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">You haven&apos;t saved any designs yet.</p>
          <Link
            to="/products"
            className="inline-block mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map((design) => {
            const firstCustomImage = Array.isArray(design?.product?.customImages)
              ? design.product.customImages.find((img) => typeof img === 'string' && img.trim())
              : '';
            const baseImageSrc = resolveMediaUrl(firstCustomImage || '');
            const fallbackProductImageSrc = resolveMediaUrl(design?.product?.image || '');
            const initialBaseImageSrc = baseImageSrc || fallbackProductImageSrc;

            return (
              <div
                key={design.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="aspect-square bg-gray-100 dark:bg-gray-900">
                  <div className="relative w-full h-full">
                    {initialBaseImageSrc && (
                      <img
                        src={initialBaseImageSrc}
                        alt={`${design.name} base`}
                        className="absolute inset-0 w-full h-full object-contain"
                        data-fallback={fallbackProductImageSrc}
                        onError={(event) => {
                          const fallbackSrc = event.currentTarget.dataset.fallback || '';
                          if (fallbackSrc && event.currentTarget.src !== fallbackSrc) {
                            event.currentTarget.src = fallbackSrc;
                            event.currentTarget.dataset.fallback = '';
                            return;
                          }
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                    )}

                    {design?.previewImage ? (
                      <img
                        src={resolveMediaUrl(design.previewImage)}
                        alt={design.name}
                        className="absolute inset-0 w-full h-full object-contain"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      !baseImageSrc && !fallbackProductImageSrc && (
                        <img
                          src="https://via.placeholder.com/300?text=No+Preview"
                          alt={design.name}
                          className="w-full h-full object-contain"
                        />
                      )
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{design.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Saved on {new Date(design.createdAt).toLocaleDateString()}
                  </p>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleUseDesign(design)}
                      className="flex-1 py-2 border border-primary-600 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    >
                      Use Design
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddToCart(design)}
                      className="flex-1 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
                    >
                      Add to Cart
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteDesign(design.id)}
                    disabled={deletingId === design.id}
                    className="mt-2 w-full py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-60"
                  >
                    {deletingId === design.id ? 'Deleting...' : 'Delete Design'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
