import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { PageLoader } from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import ProductFormModal from './ProductFormModal';


export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/products', { params: { page, keyword, pageSize: 10 } });
      setProducts(data.products);
      setPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [page, keyword]);

  const openCreate = () => { 
    setEditProduct(null); 
    setModalOpen(true); 
  };
  
  const openEdit = (p) => {
    setEditProduct(p);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Product deleted');
      setDeleteConfirm(null);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">{total} products total</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
          <FiPlus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="relative w-full sm:max-w-xs">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input value={keyword} onChange={e => { setKeyword(e.target.value); setPage(1); }} placeholder="Search products..." className="input-field pl-10 text-sm" />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Product</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Category</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Price</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Stock</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Featured</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center text-gray-400">Loading...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-gray-400">No products found</td></tr>
              ) : products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={p.image || `https://via.placeholder.com/40?text=${p.name[0]}`} alt={p.name} className="w-10 h-10 object-cover rounded-lg" onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }} />
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4"><span className="badge bg-gray-100 text-gray-600">{p.category}</span></td>
                  
                  {/* <-- CLEANED: Direct price render */}
                  <td className="py-3 px-4 text-right font-semibold">
                    ₹{parseFloat(p.price).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </td>
                  
                  <td className="py-3 px-4 text-right">
                    <span className={`font-medium ${p.stock === 0 ? 'text-red-600' : p.stock <= 5 ? 'text-orange-500' : 'text-green-600'}`}>{p.stock}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`badge ${p.featured ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-400'}`}>{p.featured ? 'Yes' : 'No'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-200 transition-colors">
                        <FiEdit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteConfirm(p.id)} className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors">
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 p-4 border-t border-gray-100">
            {[...Array(Math.min(pages, 5))].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 rounded-lg text-sm font-medium ${page === i + 1 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{i + 1}</button>
            ))}
          </div>
        )}
      </div>

      {/* Product Form Modal with Full Customization Features */}
      <ProductFormModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        product={editProduct} 
        onSuccess={() => fetchProducts()}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-sm w-full text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiTrash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold mb-2">Delete Product?</h3>
            <p className="text-gray-500 text-sm mb-4">This action cannot be undone.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger flex-1">Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}