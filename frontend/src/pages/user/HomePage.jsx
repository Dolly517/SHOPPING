import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import ProductCard from '../../components/common/ProductCard';
import { SkeletonCard } from '../../components/common/Spinner';
import { FiArrowRight, FiShoppingBag, FiTruck, FiShield, FiRotateCcw, FiEdit2, FiStar, FiLayers } from 'react-icons/fi';

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const CATEGORIES = ['Electronics', 'Clothing', 'Kitchen', 'Sports', 'Furniture', 'Home', 'Customizable'];

// Hero slides data
const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?q=80&w=2070',
    title: 'Create Your Own Style',
    subtitle: 'Browse products you can personalize with text and stickers.',
    buttonText: 'Shop Customizable',
    buttonLink: '/products?category=Customizable'
  },
  {
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070',
    title: 'Shop The Best Products Online',
    subtitle: 'Discover thousands of quality products at unbeatable prices.',
    buttonText: 'Shop Now',
    buttonLink: '/products'
  },
  {
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070',
    title: 'New Season Deals',
    subtitle: 'Step up your style with our latest exclusive arrivals.',
    buttonText: 'Explore Now',
    buttonLink: '/products?category=Clothing'
  },
  {
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070',
    title: 'Electronics at Best Prices',
    subtitle: 'Upgrade your gadgets with amazing discounts.',
    buttonText: 'Shop Electronics',
    buttonLink: '/products?category=Electronics'
  }
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [customizable, setCustomizable] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [allRes, customRes] = await Promise.all([
          api.get('/products?pageSize=10').catch(() => ({ data: { products: [] } })),
          api.get('/products?category=Customizable&pageSize=6').catch(() => ({ data: { products: [] } }))
        ]);
        setFeatured(Array.isArray(allRes.data?.products) ? allRes.data.products : []);
        setCustomizable(Array.isArray(customRes.data?.products) ? customRes.data.products : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      {/* 1. HERO SWIPER SLIDER */}
      <section className="relative overflow-hidden">
        <Swiper
          spaceBetween={0}
          centeredSlides={true}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation={true}
          modules={[Autoplay, Pagination, Navigation]}
          className="hero-swiper"
        >
          {HERO_SLIDES.map((slide, index) => (
            <SwiperSlide key={index}>
              <div
                className="relative bg-cover bg-center bg-no-repeat py-20 md:py-28"
                style={{ backgroundImage: `url('${slide.image}')` }}
              >
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 text-white">
                  <div className="max-w-2xl">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
                      {slide.title}
                    </h1>
                    <p className="text-lg md:text-xl mb-8 opacity-90">{slide.subtitle}</p>
                    <Link
                      to={slide.buttonLink}
                      className="inline-flex items-center gap-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                      {slide.buttonText} <FiArrowRight />
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* 2. FEATURES BAR */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
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
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section className="bg-primary-50 dark:bg-primary-900/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Personalize Your Products in 3 Steps</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Express yourself with custom text, stickers, and designs on your favorite products</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                icon: FiShoppingBag,
                title: 'Choose a Product',
                desc: 'Browse and select from our customizable collection'
              },
              {
                step: 2,
                icon: FiEdit2,
                title: 'Design & Customize',
                desc: 'Add text, stickers, and arrange elements your way'
              },
              {
                step: 3,
                icon: FiStar,
                title: 'Order & Save',
                desc: 'Checkout and save your design for future use'
              }
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-full mb-4 text-2xl font-bold">
                  {step}
                </div>
                <Icon className="w-8 h-8 text-primary-600 dark:text-primary-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CUSTOMIZABLE PRODUCTS FEATURED SECTION */}
      {customizable.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FiEdit2 className="text-primary-600" /> Customize These Products
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Make them uniquely yours with text and stickers</p>
            </div>
            <Link to="/products?category=Customizable" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1">
              View All <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
              {customizable.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </section>
      )}

      {/* 5. CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Shop by Category</h2>
          <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1">
            All Products <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => navigate(`/products?category=${cat}`)}
              className="flex flex-col items-center gap-4 p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center overflow-hidden">
                <img
                  src={getCategoryImage(cat)}
                  alt={cat}
                  className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'https://img.icons8.com/color/96/shopping-bag.png';
                  }}
                />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 group-hover:text-primary-600 transition-colors">
                {cat}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 6. FEATURED PRODUCTS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Featured Products</h2>
          <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1">
            View All <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {[...Array(10)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">No featured products available.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {featured.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </section>

      {/* 7. CTA BANNER - DESIGN YOUR OWN */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-900 dark:to-primary-800 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-6">
            <FiLayers className="w-4 h-4" />
            <span className="text-sm font-semibold">New Feature</span>
          </div>
          <h2 className="text-3xl font-bold mb-3">Design Your Own Products</h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">Create personalized products with custom text, stickers, and designs. Save your designs and order them anytime!</p>
          <Link to="/products?category=Customizable" className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all hover:scale-105">
            Start Customizing <FiArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function getCategoryImage(cat) {
  const map = {
    Electronics: 'https://rukminim2.flixcart.com/fk-p-flap/196/196/image/a080ac3397f3612d.png?q=60',
    Clothing: 'https://rukminim2.flixcart.com/fk-p-flap/196/196/image/5dca7713b355df43.jpg?q=60',
    Kitchen: 'https://rukminim2.flixcart.com/fk-p-flap/196/196/image/506347d817d14025.jpg?q=60',
    Sports: 'https://rukminim2.flixcart.com/fk-p-flap/196/196/image/c632b839ac6d183e.jpg?q=60',
    Furniture: 'https://rukminim2.flixcart.com/fk-p-flap/196/196/image/9be859f78d39cc22.jpg?q=60',
    Home: 'https://rukminim2.flixcart.com/fk-p-flap/196/196/image/51b0d5f9aabc2462.jpg?q=60',
    Customizable: 'https://img.icons8.com/color/96/design.png'
  };
  return map[cat] || 'https://img.icons8.com/color/96/shopping-bag.png';
}