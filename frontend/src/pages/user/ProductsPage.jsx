import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import ProductCard from '../../components/common/ProductCard';
import { SkeletonCard } from '../../components/common/Spinner';
import {
  FiFilter,
  FiX,
  FiChevronDown,
  FiStar,
  FiSearch,
  FiLoader
} from 'react-icons/fi';

// --- CONSTANTS ---
const CATEGORIES = ['Electronics', 'Clothing', 'Kitchen', 'Sports', 'Furniture', 'Home', 'Customizable'];
const GENDERS = ['Men', 'Women', 'Unisex', 'Kids', 'Boys', 'Girls'];
const RATINGS = [4, 3, 2, 1];

const COLORS = ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Pink', 'Purple', 'Orange', 'Brown', 'Grey', 'Navy', 'Teal', 'Maroon', 'Beige', 'Gold', 'Silver'];
const FABRICS = ['Cotton', 'Polyester', 'Silk', 'Wool', 'Linen', 'Nylon', 'Rayon', 'Spandex', 'Leather', 'Denim', 'Velvet', 'Fleece'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', '42', '44'];
const OCCASIONS = ['Casual', 'Formal', 'Party', 'Sports', 'Travel', 'Wedding', 'Workout', 'Outdoor', 'Beach', 'Office'];

const SORT_OPTIONS = [
  { value: 'createdAt_DESC', label: 'Newest First' },
  { value: 'price_ASC', label: 'Price: Low to High' },
  { value: 'price_DESC', label: 'Price: High to Low' },
  { value: 'rating_DESC', label: 'Top Rated' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [openSection, setOpenSection] = useState('category');

  // Product State for infinite scroll
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);

  // Observer ref for infinite scroll
  const observerRef = useRef();
  const lastProductRef = useRef();

  // Get filters from URL
  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const gender = searchParams.get('gender') || '';
  const rating = searchParams.get('rating') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt_DESC';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  // Multi-select filters
  const color = searchParams.get('color') || '';
  const fabric = searchParams.get('fabric') || '';
  const size = searchParams.get('size') || '';
  const occasion = searchParams.get('occasion') || '';

  const selectedColors = color ? color.split(',') : [];
  const selectedFabrics = fabric ? fabric.split(',') : [];
  const selectedSizes = size ? size.split(',') : [];
  const selectedOccasions = occasion ? occasion.split(',') : [];

  // Category search state
  const [categorySearch, setCategorySearch] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Reset everything when filters change
  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
    fetchProducts(1, true); // fetch first page
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProducts = async (pageNum, isNew = false) => {
    setLoading(true);
    try {
      const [sortField, sortOrder] = sortBy.split('_');
      const params = {
        page: pageNum,
        pageSize: 15,
        sortBy: sortField,
        order: sortOrder,
        category: category || undefined,
        gender: gender || undefined,
        rating: rating || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        keyword: keyword || undefined,
        color: selectedColors.length ? selectedColors.join(',') : undefined,
        fabric: selectedFabrics.length ? selectedFabrics.join(',') : undefined,
        size: selectedSizes.length ? selectedSizes.join(',') : undefined,
        occasion: selectedOccasions.length ? selectedOccasions.join(',') : undefined,
      };

      const { data } = await api.get('/products', { params });
      if (isNew) {
        setProducts(data.products || []);
      } else {
        setProducts(prev => [...prev, ...(data.products || [])]);
      }
      setTotal(data.total || 0);
      // If we got less than pageSize, no more pages
      if ((data.products || []).length < 15) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Fetch Error:', error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  // Intersection Observer callback
  const handleObserver = useCallback((entries) => {
    const [target] = entries;
    if (target.isIntersecting && hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, loading]);

  useEffect(() => {
    if (page > 1) {
      fetchProducts(page, false);
    }
  }, [page]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    });

    if (lastProductRef.current) {
      observer.observe(lastProductRef.current);
    }

    return () => {
      if (lastProductRef.current) {
        observer.unobserve(lastProductRef.current);
      }
    };
  }, [handleObserver, products]);

  // Update URL params (for filters only, not page)
  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          newParams.set(key, value.join(','));
        } else {
          newParams.delete(key);
        }
      } else {
        if (value && value !== '' && value !== 'All') {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      }
    });
    // Do NOT set page here; we handle page in state
    setSearchParams(newParams);
  };

  const toggleMultiSelect = (key, value, currentArray) => {
    const newArray = currentArray.includes(value)
      ? currentArray.filter(v => v !== value)
      : [...currentArray, value];
    updateParams({ [key]: newArray });
  };

  const resetFilters = () => {
    setSearchParams(keyword ? { keyword } : {});
    setShowMobileFilters(false);
  };

  // Filtered categories based on search
  const filteredCategories = CATEGORIES.filter(cat =>
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );
  const visibleCategories = showAllCategories ? filteredCategories : filteredCategories.slice(0, 5);

  const FilterContent = () => {
    const sections = [
      {
        key: 'category',
        title: 'Category',
        content: (
          <div className="space-y-2">
            <input
              type="text"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              placeholder="Search category"
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200"
            />
            <div className="space-y-1">
              {visibleCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => updateParams({ category: category === cat ? '' : cat })}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                    category === cat
                      ? 'bg-pink-100 text-pink-700 border border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800/60'
                      : 'bg-gray-50 border border-transparent hover:bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {filteredCategories.length > 5 && (
              <button
                onClick={() => setShowAllCategories((prev) => !prev)}
                className="text-xs font-semibold text-pink-600 dark:text-pink-300"
              >
                {showAllCategories ? 'Show Less' : 'Show More'}
              </button>
            )}
          </div>
        ),
      },
      {
        key: 'price',
        title: 'Price',
        content: (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => updateParams({ minPrice: e.target.value })}
              placeholder="Min"
              className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200"
            />
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => updateParams({ maxPrice: e.target.value })}
              placeholder="Max"
              className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200"
            />
          </div>
        ),
      },
      {
        key: 'rating',
        title: 'Rating',
        content: (
          <div className="space-y-1">
            {RATINGS.map((r) => (
              <button
                key={r}
                onClick={() => updateParams({ rating: rating === String(r) ? '' : String(r) })}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                  rating === String(r)
                    ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                }`}
              >
                <span>{r} & up</span>
                <FiStar className="text-yellow-500" />
              </button>
            ))}
          </div>
        ),
      },
      {
        key: 'gender',
        title: 'Gender',
        content: (
          <div className="flex flex-wrap gap-2">
            {GENDERS.map((g) => (
              <button
                key={g}
                onClick={() => updateParams({ gender: gender === g ? '' : g })}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  gender === g
                    ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        ),
      },
      {
        key: 'color',
        title: 'Color',
        content: (
          <div className="flex flex-wrap gap-2">
            {COLORS.map((item) => (
              <button
                key={item}
                onClick={() => toggleMultiSelect('color', item, selectedColors)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  selectedColors.includes(item)
                    ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        ),
      },
      {
        key: 'fabric',
        title: 'Fabric',
        content: (
          <div className="flex flex-wrap gap-2">
            {FABRICS.map((item) => (
              <button
                key={item}
                onClick={() => toggleMultiSelect('fabric', item, selectedFabrics)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  selectedFabrics.includes(item)
                    ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        ),
      },
      {
        key: 'size',
        title: 'Size',
        content: (
          <div className="flex flex-wrap gap-2">
            {SIZES.map((item) => (
              <button
                key={item}
                onClick={() => toggleMultiSelect('size', item, selectedSizes)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  selectedSizes.includes(item)
                    ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        ),
      },
      {
        key: 'occasion',
        title: 'Occasion',
        content: (
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((item) => (
              <button
                key={item}
                onClick={() => toggleMultiSelect('occasion', item, selectedOccasions)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  selectedOccasions.includes(item)
                    ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        ),
      },
    ];

    return (
      <div className="space-y-3">
        {sections.map((section) => (
          <div key={section.key} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3">
            <button
              onClick={() => setOpenSection(openSection === section.key ? '' : section.key)}
              className="w-full flex items-center justify-between"
            >
              <span className="text-sm font-semibold text-gray-800 dark:text-white">{section.title}</span>
              <FiChevronDown
                className={`transition-transform ${openSection === section.key ? 'rotate-180' : ''} text-gray-500`}
              />
            </button>
            {openSection === section.key && <div className="mt-3">{section.content}</div>}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <div className="flex justify-between items-center mb-6 px-1">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white tracking-tight">FILTERS</h2>
                <button onClick={resetFilters} className="text-[10px] font-black text-pink-600 hover:underline uppercase tracking-tighter">
                  Reset All
                </button>
              </div>
              <FilterContent />  {/* your existing filter component */}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Header & Sort Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                  {keyword ? `Search: "${keyword}"` : "Products For You"}
                </h1>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                  {total} products available
                </p>
              </div>
              
              <div className="flex items-center flex-wrap gap-3 sm:gap-4">
                <span className="hidden sm:block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  Sort by :
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => updateParams({ sortBy: e.target.value })}
                  className="min-w-[170px] text-sm font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-pink-100 outline-none cursor-pointer"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden p-2.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm text-pink-600"
                >
                  <FiFilter size={20} />
                </button>
              </div>
            </div>

            {/* Product Grid */}
            {initialLoad ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                {[...Array(15)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-32 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="bg-gray-50 dark:bg-gray-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiSearch className="text-3xl text-gray-200 dark:text-gray-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">No products found</h3>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Try resetting your filters or search keywords.</p>
                <button onClick={resetFilters} className="mt-6 px-8 py-2.5 bg-gray-900 dark:bg-gray-700 text-white rounded-full text-xs font-bold hover:bg-pink-600 transition-colors shadow-lg">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5 animate-in fade-in duration-500">
                  {products.map((product, index) => {
                    if (index === products.length - 1) {
                      return (
                        <div ref={lastProductRef} key={product.id || product._id}>
                          <ProductCard product={product} />
                        </div>
                      );
                    } else {
                      return <ProductCard key={product.id || product._id} product={product} />;
                    }
                  })}
                </div>

                {/* Loading indicator */}
                {loading && (
                  <div className="flex justify-center items-center py-8">
                    <FiLoader className="animate-spin text-pink-600 w-6 h-6" />
                    <span className="ml-2 text-sm text-gray-500">Loading more...</span>
                  </div>
                )}

                {/* No more products message */}
                {!hasMore && products.length > 0 && (
                  <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-8">
                    You've reached the end! 🎉
                  </p>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Sidebar Drawer – keep your existing mobile filter drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-[340px] bg-white dark:bg-gray-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <span className="font-bold text-gray-800 dark:text-white">Filters</span>
              <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <FiX size={22} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <FilterContent />
            </div>
            <div className="p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex gap-3">
              <button onClick={resetFilters} className="flex-1 py-3.5 text-[11px] font-bold border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl uppercase">
                Reset
              </button>
              <button onClick={() => setShowMobileFilters(false)} className="flex-1 py-3.5 text-[11px] font-bold bg-pink-600 text-white rounded-xl uppercase shadow-lg shadow-pink-200">
                View Items
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}