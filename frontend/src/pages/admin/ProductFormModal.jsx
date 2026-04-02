import { useState, useRef, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiX, FiUpload, FiTrash2 } from 'react-icons/fi';

const CATEGORIES = ['Electronics', 'Clothing', 'Kitchen', 'Sports', 'Furniture', 'Home', 'General'];
const MAX_UPLOAD_SIZE_MB = 20;
const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

export default function ProductFormModal({ isOpen, onClose, product, onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'Electronics',
    brand: '',
    featured: false,
    image: '',
    isCustomizable: false,
  });

  const [customSettings, setCustomSettings] = useState({
    maxImages: 5,
    supportsText: true,
    supportsImageUpload: true,
    selectedStickers: [],
  });

  const [customImages, setCustomImages] = useState([]); // Reference images for customizable products
  const [stickers, setStickers] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [customImageFiles, setCustomImageFiles] = useState([]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef();
  const customImagesRef = useRef();

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        stock: product.stock || '',
        category: product.category || 'Electronics',
        brand: product.brand || '',
        featured: product.featured || false,
        image: product.image || '',
        isCustomizable: product.isCustomizable || false,
      });
      setCustomImages(product.customImages || []);
      setCustomImageFiles([]);
      setCustomImageUrl('');
      setImageFile(null);
    } else {
      setForm({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: 'Electronics',
        brand: '',
        featured: false,
        image: '',
        isCustomizable: false,
      });
      setCustomSettings({
        maxImages: 5,
        supportsText: true,
        supportsImageUpload: true,
        selectedStickers: [],
      });
      setCustomImages([]);
      setCustomImageFiles([]);
      setCustomImageUrl('');
      setImageFile(null);
    }
  }, [product, isOpen]);

  useEffect(() => {
    // Fetch available stickers
    const fetchStickers = async () => {
      try {
        const res = await api.get('/stickers');
        setStickers(res.data || []);
      } catch (error) {
        console.error('Failed to load stickers');
      }
    };
    if (isOpen) fetchStickers();
  }, [isOpen]);

  const handleRemoveCustomImage = (index) => {
    const removedImage = customImages[index];
    setCustomImages(customImages.filter((_, i) => i !== index));
    setCustomImageFiles(customImageFiles.filter((item) => item.preview !== removedImage));
  };

  const handleAddCustomImages = (e) => {
    const files = Array.from(e.target.files || []);
    const oversized = files.find((file) => file.size > MAX_UPLOAD_SIZE_BYTES);
    if (oversized) {
      toast.error(`Each image must be under ${MAX_UPLOAD_SIZE_MB}MB`);
      if (customImagesRef.current) customImagesRef.current.value = '';
      return;
    }

    const remainingSlots = Math.max(0, 5 - customImages.length);
    const filesToAdd = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      toast.error('Maximum 5 reference images allowed');
    }

    filesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const preview = event.target.result;
        setCustomImages(prev => [...prev, preview]);
        setCustomImageFiles(prev => [...prev, { file, preview }]);
      };
      reader.readAsDataURL(file);
    });
    if (customImagesRef.current) customImagesRef.current.value = '';
  };

  const handleAddCustomImageUrl = () => {
    const url = customImageUrl.trim();
    if (!url) return;

    if (customImages.length >= 5) {
      toast.error('Maximum 5 reference images allowed');
      return;
    }

    if (!/^https?:\/\//i.test(url)) {
      toast.error('Please enter a valid image URL (http/https)');
      return;
    }

    setCustomImages((prev) => [...prev, url]);
    setCustomImageUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (imageFile && imageFile.size > MAX_UPLOAD_SIZE_BYTES) {
      toast.error(`Product image must be under ${MAX_UPLOAD_SIZE_MB}MB`);
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([k, v]) => {
        if (k === 'isCustomizable') {
          formData.append(k, v);
        } else {
          formData.append(k, v);
        }
      });

      if (imageFile) formData.append('image', imageFile);

      // Add custom images
      customImageFiles.forEach(({ file }) => {
        formData.append('customImages', file);
      });

      // Keep URL links and existing upload paths so admin can mix both methods.
      const customImageLinks = customImages.filter((img) => {
        if (typeof img !== 'string') return false;
        return /^https?:\/\//i.test(img) || img.startsWith('/uploads/');
      });
      formData.append('customImageLinks', JSON.stringify(customImageLinks));

      // Add customization settings if customizable
      if (form.isCustomizable) {
        formData.append('customSettings', JSON.stringify(customSettings));
      }

      if (product) {
        await api.put(`/admin/products/${product.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product updated!');
      } else {
        await api.post('/admin/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product created!');
      }

      onSuccess();
      onClose();
    } catch (err) {
      const backendMessage = err?.response?.data?.message || err?.response?.data?.error;
      const fallbackMessage = err?.message === 'Network Error' ? 'Server not reachable. Please ensure backend is running.' : err?.message;
      toast.error(backendMessage || fallbackMessage || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4 pb-4 border-b-2 border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <span className="bg-primary-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
              Basic Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. iPhone 15 Pro"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stock *
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  placeholder="Brand name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="Product description..."
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4 pb-4 border-b-2 border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <span className="bg-primary-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
              Product Image
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Image URL
              </label>
              <input
                type="text"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Or Upload Image
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <FiUpload className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {imageFile ? imageFile.name : 'Click to upload'}
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.heic,.heif,.jfif,.svg"
                className="hidden"
                onChange={(e) => setImageFile(e.target.files?.[0])}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <label htmlFor="featured" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Featured product
              </label>
            </div>
          </div>

          {/* Customization Settings */}
          <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4 bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
            <h3 className="font-bold text-lg text-blue-900 dark:text-blue-100 flex items-center gap-2">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
              🎨 Customization Settings
            </h3>

            <div className="flex items-center gap-3 bg-white dark:bg-gray-700 p-3 rounded-lg">
              <input
                type="checkbox"
                id="customizable"
                checked={form.isCustomizable}
                onChange={(e) => setForm({ ...form, isCustomizable: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <label htmlFor="customizable" className="text-base font-semibold text-gray-700 dark:text-gray-300">
                ✅ Enable Customization for this Product
              </label>
            </div>

            {form.isCustomizable && (
              <div className="space-y-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                {/* Reference Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reference Images (Front, Back, Side, etc.)
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 mb-3">
                    <input
                      type="text"
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      placeholder="Paste image URL (https://...)"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomImageUrl}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                      Add URL
                    </button>
                  </div>

                  <div
                    onClick={() => customImagesRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-white dark:hover:bg-gray-600 transition"
                  >
                    <FiUpload className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Upload from device ({customImages.length}/5)
                    </span>
                  </div>
                  <input
                    ref={customImagesRef}
                    type="file"
                    multiple
                    accept="image/*,.heic,.heif,.jfif,.svg"
                    className="hidden"
                    onChange={handleAddCustomImages}
                  />

                  {customImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                      {customImages.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={img}
                            alt="custom"
                            className="w-full h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomImage(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Customization Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Max Images User Can Add
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={customSettings.maxImages}
                      onChange={(e) =>
                        setCustomSettings({ ...customSettings, maxImages: parseInt(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={customSettings.supportsText}
                      onChange={(e) =>
                        setCustomSettings({ ...customSettings, supportsText: e.target.checked })
                      }
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Allow text customization</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={customSettings.supportsImageUpload}
                      onChange={(e) =>
                        setCustomSettings({ ...customSettings, supportsImageUpload: e.target.checked })
                      }
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Allow users to upload images</span>
                  </label>
                </div>

                {/* Show Sticker Selection */}
                {stickers.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Available Sticker Presets
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-24 overflow-y-auto">
                      {stickers.map((sticker) => (
                        <label key={sticker.id} className="cursor-pointer">
                          <input
                            type="checkbox"
                            checked={customSettings.selectedStickers.includes(sticker.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCustomSettings({
                                  ...customSettings,
                                  selectedStickers: [...customSettings.selectedStickers, sticker.id],
                                });
                              } else {
                                setCustomSettings({
                                  ...customSettings,
                                  selectedStickers: customSettings.selectedStickers.filter(
                                    (id) => id !== sticker.id
                                  ),
                                });
                              }
                            }}
                            className="hidden"
                          />
                          <div className="w-12 h-12 rounded border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:border-primary-500 transition overflow-hidden">
                            {sticker.imageUrl ? (
                              <img src={sticker.imageUrl} alt={sticker.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>📷</span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition font-medium"
            >
              {submitting ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
