import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { FiTrash2, FiUpload } from 'react-icons/fi';

export default function Stickers() {
  const PRESET_CATEGORIES = ['General', 'Emoji', 'Shapes', 'Nature', 'Animals', 'Objects', 'Holidays'];
  const [stickers, setStickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [uploadSource, setUploadSource] = useState('file');
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [stickerName, setStickerName] = useState('');
  const [stickerCategory, setStickerCategory] = useState('');
  const fileInputRef = useRef(null);

  // Fetch stickers
  useEffect(() => {
    fetchStickers();
  }, []);

  const fetchStickers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/stickers/admin/all');
      setStickers(res.data || []);
    } catch (error) {
      toast.error('Failed to load stickers');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!stickerName) {
        setStickerName(file.name.split('.')[0]);
      }
    }
  };

  const handleUploadSticker = async (e) => {
    e.preventDefault();

    setUploading(true);
    try {
      let res;

      const finalCategory = stickerCategory.trim();
      if (!finalCategory) {
        toast.error('Please enter category');
        setUploading(false);
        return;
      }

      if (uploadSource === 'url') {
        const trimmedUrl = imageUrl.trim();
        if (!trimmedUrl) {
          toast.error('Please enter image URL');
          setUploading(false);
          return;
        }

        res = await api.post('/stickers/admin/url', {
          name: stickerName || 'Sticker',
          category: finalCategory,
          imageUrl: trimmedUrl,
        });
      } else {
        if (!selectedFile) {
          toast.error('Please select an image');
          setUploading(false);
          return;
        }

        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('name', stickerName || selectedFile.name.split('.')[0]);
        formData.append('category', finalCategory);

        res = await api.post('/stickers/admin/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setStickers([res.data, ...stickers]);
      setStickerName('');
      setStickerCategory('');
      setSelectedFile(null);
      setImageUrl('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.success('Sticker added successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSticker = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sticker?')) return;

    try {
      await api.delete(`/stickers/admin/${id}`);
      setStickers(stickers.filter(s => s.id !== id));
      toast.success('Sticker deleted');
    } catch (error) {
      toast.error('Failed to delete sticker');
    }
  };

  const availableCategories = Array.from(new Set([
    ...PRESET_CATEGORIES,
    ...stickers
      .map((s) => (s?.category || '').trim())
      .filter(Boolean),
  ])).sort((a, b) => a.localeCompare(b));

  const statusFiltered =
    filter === 'active' ? stickers.filter(s => s.isActive) :
    filter === 'inactive' ? stickers.filter(s => !s.isActive) :
    stickers;

  const filtered = categoryFilter === 'all'
    ? statusFiltered
    : statusFiltered.filter((s) => (s?.category || 'General') === categoryFilter);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading stickers...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Manage Stickers
      </h1>

      {/* Upload Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Upload New Sticker
        </h2>
        <form onSubmit={handleUploadSticker} className="space-y-4">
          <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
            <button
              type="button"
              onClick={() => setUploadSource('file')}
              className={`px-4 py-2 text-sm font-medium ${uploadSource === 'file' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
            >
              File
            </button>
            <button
              type="button"
              onClick={() => setUploadSource('url')}
              className={`px-4 py-2 text-sm font-medium border-l border-gray-300 dark:border-gray-600 ${uploadSource === 'url' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
            >
              URL
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sticker Name
              </label>
              <input
                type="text"
                value={stickerName}
                onChange={(e) => setStickerName(e.target.value)}
                placeholder="Enter sticker name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <input
                type="text"
                list="sticker-category-options"
                value={stickerCategory}
                onChange={(e) => setStickerCategory(e.target.value)}
                onBlur={(e) => setStickerCategory(e.target.value.trim())}
                placeholder="e.g. Skull, Sports, Festival"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
              <datalist id="sticker-category-options">
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {uploadSource === 'url' ? 'Image URL' : 'Image File'}
              </label>
              {uploadSource === 'url' ? (
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/sticker.png"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              ) : (
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {uploadSource === 'file' && selectedFile && (
              <div className="w-12 h-12 rounded border border-gray-300 overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={uploading || (uploadSource === 'file' ? !selectedFile : !imageUrl.trim())}
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <FiUpload size={18} />
              {uploading ? 'Adding...' : 'Add Sticker'}
            </button>
          </div>
        </form>
      </div>

      {/* Stickers List */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            All Stickers ({filtered.length})
          </h2>
          <div className="flex gap-2 flex-wrap justify-end">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'active'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'inactive'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
              }`}
            >
              Inactive
            </button>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            >
              <option value="all">All Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No stickers found</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filtered.map((sticker) => (
              <div
                key={sticker.id}
                className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg hover:shadow-lg transition group"
              >
                <div className="aspect-square bg-white dark:bg-gray-600 rounded-lg mb-2 flex items-center justify-center border border-gray-200 dark:border-gray-600 overflow-hidden">
                  {sticker.imageUrl ? (
                    <img
                      src={sticker.imageUrl}
                      alt={sticker.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-4xl">📷</div>
                  )}
                </div>

                <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                  {sticker.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {sticker.category}
                </p>
                <span
                  className={`inline-block text-xs py-1 px-2 rounded mt-1 ${
                    sticker.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                  }`}
                >
                  {sticker.isActive ? 'Active' : 'Inactive'}
                </span>

                <button
                  onClick={() => handleDeleteSticker(sticker.id)}
                  className="mt-3 w-full flex items-center justify-center gap-1 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 opacity-0 group-hover:opacity-100 transition"
                >
                  <FiTrash2 size={14} />
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
