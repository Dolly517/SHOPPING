import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import ProductCard from '../../components/common/ProductCard';
import { SkeletonCard } from '../../components/common/Spinner';
import { FiFilter, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Kitchen', 'Sports', 'Furniture', 'Home'];
const SORT_OPTIONS = [
  { value: 'createdAt_DESC', label: 'Newest First' },
  { value: 'price_ASC', label: 'Price: Low to High' },
  { value: 'price_DESC', label: 'Price: High to Low' },
  { value: 'rating_DESC', label: 'Top Rated' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const [sortBy, setSortBy] = useState('createdAt_DESC');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedCategory, setSelectedCategory] = useState(category || 'All');

  useEffect(() => {
    setSelectedCategory(category || 'All');
  }, [category]);

  useEffect(() => {
    fetchProducts();
  }, [page, keyword, selectedCategory, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [sortField, sortOrder] = sortBy.split('_');
      const params = { page, pageSize: 12, sortBy: sortField, order: sortOrder };
      if (keyword) params.keyword = keyword;
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
      if (priceRange.min) params.minPrice = priceRange.min;
      if (priceRange.max) params.maxPrice = priceRange.max;
      const { data } = await api.get('/products', { params });
      setProducts(data.products);
      setPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    setPage(1);
    if (cat !== 'All') setSearchParams({ category: cat });
    else setSearchParams({});
  };

  const applyFilters = () => {
    setPage(1);
    fetchProducts();
    setShowFilters(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {keyword ? `Results for "${keyword}"` : selectedCategory !== 'All' ? selectedCategory : 'All Products'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{total} products found</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }} className="input-field py-2 text-sm w-48">
            {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <button onClick={() => setShowFilters(true)} className="btn-secondary flex items-center gap-2 py-2 text-sm">
            <FiFilter className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategory === cat ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🛒</p>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary py-2 px-3 disabled:opacity-40">
            <FiChevronLeft className="w-4 h-4" />
          </button>
          {[...Array(Math.min(pages, 5))].map((_, i) => {
            const pageNum = i + 1;
            return (
              <button key={pageNum} onClick={() => setPage(pageNum)} className={`w-10 h-10 rounded-lg font-medium text-sm ${page === pageNum ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                {pageNum}
              </button>
            );
          })}
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary py-2 px-3 disabled:opacity-40">
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Sidebar */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={() => setShowFilters(false)}>
          <div className="bg-white w-80 h-full p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Filters</h3>
              <button onClick={() => setShowFilters(false)}><FiX className="w-5 h-5" /></button>
            </div>
            <div className="mb-6">
              <h4 className="font-semibold mb-3 text-sm uppercase text-gray-500">Price Range</h4>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={priceRange.min} onChange={e => setPriceRange(p => ({ ...p, min: e.target.value }))} className="input-field text-sm" />
                <input type="number" placeholder="Max" value={priceRange.max} onChange={e => setPriceRange(p => ({ ...p, max: e.target.value }))} className="input-field text-sm" />
              </div>
            </div>
            <button onClick={applyFilters} className="btn-primary w-full">Apply Filters</button>
            <button onClick={() => { setPriceRange({ min: '', max: '' }); setSelectedCategory('All'); setPage(1); fetchProducts(); setShowFilters(false); }} className="btn-secondary w-full mt-2">Reset</button>
          </div>
        </div>
      )}
    </div>
  );
}
