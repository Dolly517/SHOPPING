import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import ProductCard from '../../components/common/ProductCard';
import { SkeletonCard } from '../../components/common/Spinner';
import { FiArrowRight, FiShoppingBag, FiTruck, FiShield, FiRotateCcw } from 'react-icons/fi';

const CATEGORIES = ['Electronics', 'Clothing', 'Kitchen', 'Sports', 'Furniture', 'Home'];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get('/products/featured');
        setFeatured(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <span className="inline-block bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-4 backdrop-blur-sm">
              🛍️ New arrivals just dropped
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Shop The Best<br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Products Online
              </span>
            </h1>
            <p className="text-primary-100 text-lg md:text-xl mb-8 max-w-lg">
              Discover thousands of quality products at unbeatable prices. Shop with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/products" className="btn-primary bg-white text-primary-700 hover:bg-gray-100 flex items-center justify-center gap-2 text-base py-3 px-8">
                Shop Now <FiArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/products?category=Electronics" className="py-3 px-8 border-2 border-white/50 text-white rounded-lg font-semibold hover:bg-white/10 transition-all text-base text-center">
                Explore Electronics
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: FiTruck, title: 'Free Shipping', desc: 'On orders over $50' },
              { icon: FiShield, title: 'Secure Payment', desc: '100% protected' },
              { icon: FiRotateCcw, title: 'Easy Returns', desc: '30-day policy' },
              { icon: FiShoppingBag, title: '24/7 Support', desc: 'Always here to help' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{title}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
          <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1">
            All Products <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => navigate(`/products?category=${cat}`)}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:border-primary-300 hover:shadow-md transition-all group"
            >
              <span className="text-2xl">{getCategoryEmoji(cat)}</span>
              <span className="text-xs font-medium text-gray-700 group-hover:text-primary-600">{cat}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1">
            View All <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {featured.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">Ready to start shopping?</h2>
          <p className="text-gray-400 mb-6">Join thousands of happy customers shopping on ShopWave</p>
          <Link to="/register" className="btn-primary bg-primary-500 hover:bg-primary-400 py-3 px-8 text-base inline-flex items-center gap-2">
            Create Free Account <FiArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function getCategoryEmoji(cat) {
  const map = { Electronics: '📱', Clothing: '👕', Kitchen: '🍳', Sports: '⚽', Furniture: '🪑', Home: '🏠' };
  return map[cat] || '🛍️';
}
