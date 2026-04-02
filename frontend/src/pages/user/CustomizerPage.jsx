import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import * as fabric from 'fabric';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { FiChevronLeft, FiChevronRight, FiTrash2 } from 'react-icons/fi';

// Fallback trending stickers (Apple emoji) – replace with your own URLs
const DEFAULT_STICKERS = [
  'https://cdn.jsdelivr.net/npm/emoji-datasource-apple@14.0.0/img/apple/64/1f60a.png', // 😊 smile
  'https://cdn.jsdelivr.net/npm/emoji-datasource-apple@14.0.0/img/apple/64/2764.png',   // ❤️ heart
  'https://cdn.jsdelivr.net/npm/emoji-datasource-apple@14.0.0/img/apple/64/1f44d.png', // 👍 thumbs up
  'https://cdn.jsdelivr.net/npm/emoji-datasource-apple@14.0.0/img/apple/64/1f4bb.png', // 💻 laptop
  'https://cdn.jsdelivr.net/npm/emoji-datasource-apple@14.0.0/img/apple/64/1f455.png', // 👕 t-shirt
  'https://cdn.jsdelivr.net/npm/emoji-datasource-apple@14.0.0/img/apple/64/1f3a8.png', // 🎨 art
  'https://api.iconify.design/mdi:tshirt-crew.svg',
  'https://api.iconify.design/mdi:hoodie.svg',
  'https://api.iconify.design/mdi:shoe-sneaker.svg',
  'https://api.iconify.design/mdi:hat-fedora.svg',
  'https://api.iconify.design/mdi:sunglasses.svg',
  'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f525.png',
  'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f480.png',
  'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/26a1.png',
  'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f451.png',
  'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4a7.png',
  'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2764.png',
  'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2b50.png',
  'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2601.png',
  'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2728.png',
];

const REMOVABLE_OBJECT_TYPES = ['image', 'textbox', 'text', 'i-text'];

export default function CustomizerPage() {
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const designId = searchParams.get('design');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [customData, setCustomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDesign, setLoadingDesign] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [selectedFont, setSelectedFont] = useState('Arial');
  const [textColor, setTextColor] = useState('#000000');
  const [uploadedImageCount, setUploadedImageCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [bgImageFailed, setBgImageFailed] = useState(false);
  const [referenceImageIndex, setReferenceImageIndex] = useState(0);
  const [adminStickers, setAdminStickers] = useState([]);
  const [angleDesigns, setAngleDesigns] = useState({});
  const [selectedStickerCategory, setSelectedStickerCategory] = useState('All');
  const [stickerToolbar, setStickerToolbar] = useState({ visible: false, left: 0, top: 0 });

  const fabricCanvasRef = useRef(null);
  const loadedDesignRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const selectedImageRef = useRef(null);
  const angleDesignsRef = useRef({});
  const angleOverlaySnapshotsRef = useRef({});

  useEffect(() => {
    angleDesignsRef.current = angleDesigns;
  }, [angleDesigns]);

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
    if (src.startsWith('data:') || src.startsWith('blob:')) return src;
    if (/^https?:\/\//i.test(src)) {
      try {
        const parsed = new URL(trimmed);
        const apiOrigin = getApiOrigin();
        const isUploadsAsset = parsed.pathname.startsWith('/uploads/');
        const isLocalHost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';

        if (apiOrigin && isUploadsAsset && isLocalHost) {
          return `${apiOrigin}${parsed.pathname}${parsed.search}`;
        }
      } catch {
        // Ignore URL parsing errors and use original value.
      }
      return trimmed;
    }
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

  const loadDesignJson = async (canvas, json) => {
    // Fabric versions differ: some return Promise, some use callback.
    await new Promise((resolve, reject) => {
      try {
        const result = canvas.loadFromJSON(json, () => resolve());
        if (result && typeof result.then === 'function') {
          result.then(resolve).catch(reject);
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  const hasCanvasObjects = (state) => {
    if (!state || typeof state !== 'object') return false;
    return Array.isArray(state.objects) && state.objects.length > 0;
  };

  const getAngleIndexFromKey = (key) => {
    if (key === 'default') return 0;
    const match = /^angle-(\d+)$/.exec(String(key || ''));
    if (!match) return 0;
    return Number(match[1]) || 0;
  };

  const loadImageElement = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

  const waitForFabricImages = async (canvas) => {
    if (!canvas) return;

    const imageObjects = canvas
      .getObjects()
      .filter((obj) => obj?.type === 'image');

    if (!imageObjects.length) return;

    await Promise.all(imageObjects.map((imgObj) => new Promise((resolve) => {
      const element = imgObj.getElement?.();
      if (!element) {
        resolve();
        return;
      }

      if (element.complete) {
        resolve();
        return;
      }

      const onDone = () => {
        element.removeEventListener('load', onDone);
        element.removeEventListener('error', onDone);
        resolve();
      };

      element.addEventListener('load', onDone, { once: true });
      element.addEventListener('error', onDone, { once: true });
    })));
  };

  const composePreviewImage = async (baseImage, overlayDataUrl, width, height) => {
    if (!baseImage) {
      return overlayDataUrl;
    }

    const output = document.createElement('canvas');
    output.width = width;
    output.height = height;
    const ctx = output.getContext('2d');
    if (!ctx) return overlayDataUrl;

    try {
      const [productImg, overlayImg] = await Promise.all([
        loadImageElement(baseImage),
        loadImageElement(overlayDataUrl),
      ]);

      const fit = Math.min(output.width / productImg.width, output.height / productImg.height);
      const drawWidth = productImg.width * fit;
      const drawHeight = productImg.height * fit;
      const drawX = (output.width - drawWidth) / 2;
      const drawY = (output.height - drawHeight) / 2;

      ctx.clearRect(0, 0, output.width, output.height);
      ctx.drawImage(productImg, drawX, drawY, drawWidth, drawHeight);
      ctx.drawImage(overlayImg, 0, 0, output.width, output.height);

      return output.toDataURL('image/png', 0.5);
    } catch {
      return overlayDataUrl;
    }
  };

  const createOverlayFromState = async (state, width, height) => {
    const tempCanvasEl = document.createElement('canvas');
    const tempCanvas = new fabric.StaticCanvas(tempCanvasEl, {
      width,
      height,
      backgroundColor: 'transparent',
      renderOnAddRemove: false,
    });

    try {
      await loadDesignJson(tempCanvas, state);
      await waitForFabricImages(tempCanvas);
      tempCanvas.renderAll();
      return tempCanvas.toDataURL({ format: 'png', quality: 0.5 });
    } finally {
      tempCanvas.dispose();
    }
  };

  const createPreviewImage = async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return '';

    const activeBaseImage = referenceImages[referenceImageIndex] || product?.image;
    const overlayDataUrl = canvas.toDataURL({ format: 'png', quality: 0.5 });
    return composePreviewImage(activeBaseImage, overlayDataUrl, canvas.getWidth(), canvas.getHeight());
  };

  const createAnglePreviews = async (byAngle, currentKey, currentCanvas) => {
    const previews = {};
    const sourceImages = {};
    const width = currentCanvas?.getWidth?.() || 600;
    const height = currentCanvas?.getHeight?.() || 600;

    for (const [key, state] of Object.entries(byAngle || {})) {
      if (!hasCanvasObjects(state)) continue;

      const angleIndex = getAngleIndexFromKey(key);
      const baseImage = referenceImages[angleIndex] || product?.image || '';
      sourceImages[key] = baseImage;

      let overlayDataUrl = '';
      if (key === currentKey && currentCanvas) {
        overlayDataUrl = currentCanvas.toDataURL({ format: 'png', quality: 0.5 });
      } else if (angleOverlaySnapshotsRef.current[key]) {
        overlayDataUrl = angleOverlaySnapshotsRef.current[key];
      } else {
        try {
          overlayDataUrl = await createOverlayFromState(state, width, height);
        } catch {
          overlayDataUrl = '';
        }
      }

      if (!overlayDataUrl) continue;
      previews[key] = await composePreviewImage(baseImage, overlayDataUrl, width, height);
    }

    return { previews, sourceImages };
  };

  // Keep objects inside canvas boundaries
  const keepObjectInsideCanvas = (obj, canvas) => {
    if (!obj || !canvas) return;

    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const bounds = obj.getBoundingRect(true, true);

    let newLeft = obj.left;
    let newTop = obj.top;

    if (bounds.left < 0) {
      newLeft -= bounds.left;
    }
    if (bounds.top < 0) {
      newTop -= bounds.top;
    }
    if (bounds.left + bounds.width > canvasWidth) {
      newLeft -= (bounds.left + bounds.width - canvasWidth);
    }
    if (bounds.top + bounds.height > canvasHeight) {
      newTop -= (bounds.top + bounds.height - canvasHeight);
    }

    obj.set({ left: newLeft, top: newTop });
    obj.setCoords();
  };

  const hideStickerToolbar = () => {
    selectedImageRef.current = null;
    setStickerToolbar((prev) => (prev.visible ? { ...prev, visible: false } : prev));
  };

  const updateStickerToolbarPosition = (targetObject) => {
    const canvas = fabricCanvasRef.current;
    const container = canvasContainerRef.current;
    const target = targetObject || canvas?.getActiveObject();

    if (!canvas || !container || !target || !REMOVABLE_OBJECT_TYPES.includes(target.type)) {
      hideStickerToolbar();
      return;
    }

    const canvasElement = typeof canvas.getElement === 'function' ? canvas.getElement() : null;
    if (!canvasElement) {
      hideStickerToolbar();
      return;
    }

    const bounds = target.getBoundingRect(true, true);
    const canvasRect = canvasElement.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const scaleX = canvasRect.width / canvas.getWidth();
    const scaleY = canvasRect.height / canvas.getHeight();

    const centerX = bounds.left + bounds.width / 2;
    const topY = bounds.top;

    const left = Math.max(36, Math.min(containerRect.width - 36, centerX * scaleX));
    const top = Math.max(8, topY * scaleY - 42);

    selectedImageRef.current = target;
    setStickerToolbar({ visible: true, left, top });
  };

  const applyObjectControls = (obj) => {
    if (!obj || typeof obj.setControlsVisibility !== 'function') return;

    const isRemovableObject = REMOVABLE_OBJECT_TYPES.includes(obj.type);

    if (isRemovableObject) {
      const baseControls = fabric?.Object?.prototype?.controls;
      if (baseControls) {
        obj.controls = {
          ...obj.controls,
          ...(baseControls.deleteControl ? { deleteControl: baseControls.deleteControl } : {}),
        };
      }
      obj.set({ hasControls: true, hasBorders: true });
    }

    obj.setControlsVisibility({
      copyControl: false,
      deleteControl: isRemovableObject,
    });
  };

  const installDeleteControl = () => {
    const objectPrototype = fabric?.Object?.prototype;
    const controls = objectPrototype?.controls;
    const FabricControl = fabric?.Control;

    if (!objectPrototype || !controls || !FabricControl) {
      return;
    }

    if (controls.deleteControl) return;

    controls.deleteControl = new FabricControl({
      x: 0.5,
      y: -0.5,
      offsetX: 12,
      offsetY: -12,
      cornerSize: 24,
      cursorStyle: 'pointer',
      mouseUpHandler: (_eventData, transform) => {
        const target = transform?.target;
        const canvas = target?.canvas;
        if (!target || !canvas) return false;

        if (target.type === 'image') {
          setUploadedImageCount((count) => Math.max(0, count - 1));
        }

        canvas.remove(target);
        canvas.requestRenderAll();
        hideStickerToolbar();
        return true;
      },
      render: (ctx, left, top) => {
        const radius = 11;

        ctx.save();
        ctx.beginPath();
        ctx.arc(left, top, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Draw a compact trash-bin icon.
        ctx.beginPath();
        ctx.moveTo(left - 4, top - 2);
        ctx.lineTo(left + 4, top - 2);
        ctx.moveTo(left - 3, top - 4);
        ctx.lineTo(left + 3, top - 4);
        ctx.moveTo(left - 1, top - 5);
        ctx.lineTo(left + 1, top - 5);
        ctx.moveTo(left - 3, top - 2);
        ctx.lineTo(left - 2.2, top + 4);
        ctx.lineTo(left + 2.2, top + 4);
        ctx.lineTo(left + 3, top - 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.restore();
      },
    });
  };

  // Customization capabilities
  const supportsText = true;
  const supportsImageUpload = customData?.supportsImageUpload === true;
  const maxImages = Number(customData?.maxImages || 0);
  const ruleStickerPresets = Array.isArray(customData?.stickerPresets)
    ? customData.stickerPresets
        .map((url) => ({
          url: resolveMediaUrl(url),
          category: 'General',
        }))
        .filter((item) => typeof item.url === 'string' && item.url.trim())
    : [];
  const adminStickerPresets = adminStickers
    .map((sticker) => ({
      url: resolveMediaUrl(sticker?.imageUrl),
      category: (sticker?.category || 'General').trim() || 'General',
    }))
    .filter((item) => typeof item.url === 'string' && item.url.trim());
  const defaultStickerPresets = DEFAULT_STICKERS
    .map((url) => ({ url, category: 'General' }))
    .filter((item) => typeof item.url === 'string' && item.url.trim());

  const stickerMap = new Map();
  [...adminStickerPresets, ...ruleStickerPresets, ...defaultStickerPresets].forEach((item) => {
    if (!stickerMap.has(item.url)) {
      stickerMap.set(item.url, item.category || 'General');
    }
  });

  const stickerPresets = Array.from(stickerMap.entries()).map(([url, category]) => ({ url, category }));
  const stickerCategories = ['All', ...Array.from(new Set(stickerPresets.map((item) => item.category))).sort((a, b) => a.localeCompare(b))];
  const visibleStickerPresets = selectedStickerCategory === 'All'
    ? stickerPresets
    : stickerPresets.filter((item) => item.category === selectedStickerCategory);

  const referenceImages = Array.isArray(product?.customImages)
    ? product.customImages.filter((img) => typeof img === 'string' && img.trim())
    : [];

  const getAngleKey = (index = 0) => (referenceImages.length > 0 ? `angle-${index}` : 'default');

  const clearCanvasObjects = (canvas) => {
    if (!canvas) return;
    canvas.getObjects().forEach((obj) => canvas.remove(obj));
    canvas.renderAll();
  };

  const loadAngleState = async (angleIndex) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const key = getAngleKey(angleIndex);
    const savedState = angleDesigns[key];

    if (savedState) {
      canvas.clear();
      await loadDesignJson(canvas, savedState);
      canvas.getObjects().forEach((obj) => {
        keepObjectInsideCanvas(obj, canvas);
        applyObjectControls(obj);
      });
      canvas.requestRenderAll();
      setTimeout(() => canvas.requestRenderAll(), 0);
      const imageCount = canvas.getObjects().filter((obj) => obj.type === 'image').length;
      setUploadedImageCount(imageCount);
      return;
    }

    clearCanvasObjects(canvas);
    setUploadedImageCount(0);
  };

  const saveCurrentAngleState = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const key = getAngleKey(referenceImageIndex);
    const currentObjects = canvas.getObjects();
    const next = {
      ...angleDesignsRef.current,
      [key]: canvas.toJSON(),
    };
    if (currentObjects.length > 0) {
      angleOverlaySnapshotsRef.current[key] = canvas.toDataURL({ format: 'png', quality: 0.5 });
    } else {
      delete angleOverlaySnapshotsRef.current[key];
    }
    angleDesignsRef.current = next;
    setAngleDesigns(next);
  };

  const switchAngle = (nextIndex) => {
    if (nextIndex === referenceImageIndex) return;
    saveCurrentAngleState();
    setReferenceImageIndex(nextIndex);
  };

  // Load product and customization data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const stickerEndpoint = user?.role === 'admin' ? '/stickers/admin/all' : '/stickers';
        const [productRes, customRes, stickersRes] = await Promise.all([
          api.get(`/products/${productId}`),
          api.get(`/custom/products/${productId}`).catch(() => ({ data: null })),
          api.get(stickerEndpoint).catch(() => ({ data: [] })),
        ]);

        setProduct(productRes.data);
        setCustomData(customRes.data);
        setAdminStickers(Array.isArray(stickersRes.data) ? stickersRes.data : []);
        angleDesignsRef.current = {};
        angleOverlaySnapshotsRef.current = {};
        setAngleDesigns({});
      } catch (error) {
        toast.error('Failed to load product customization data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [productId, user?.role]);

  useEffect(() => {
    if (!stickerCategories.includes(selectedStickerCategory)) {
      setSelectedStickerCategory('All');
    }
  }, [selectedStickerCategory, stickerCategories]);

  useEffect(() => {
    setReferenceImageIndex(0);
  }, [product?.id, referenceImages.length]);

  useEffect(() => {
    if (!product || !fabricCanvasRef.current) return;
    loadAngleState(referenceImageIndex);
  }, [referenceImageIndex, product?.id, angleDesigns]);

  // Initialize Fabric canvas when product is loaded
  useEffect(() => {
    if (!product) return;

    try {
      installDeleteControl();
    } catch (error) {
      console.error('Delete control init failed:', error);
    }

    const canvas = new fabric.Canvas('design-canvas', {
      width: 600,
      height: 600,
      backgroundColor: 'transparent',
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;

    // Keep objects inside canvas
    canvas.on('object:moving', (event) => keepObjectInsideCanvas(event.target, canvas));
    canvas.on('object:scaling', (event) => keepObjectInsideCanvas(event.target, canvas));
    canvas.on('object:modified', (event) => keepObjectInsideCanvas(event.target, canvas));
    canvas.on('object:added', (event) => applyObjectControls(event.target));

    const handleSelection = (event) => {
      const selected = event?.selected?.[0] || event?.target || null;
      updateStickerToolbarPosition(selected);
    };

    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', hideStickerToolbar);
    canvas.on('object:moving', (event) => {
      if (event?.target && event.target === selectedImageRef.current) {
        updateStickerToolbarPosition(event.target);
      }
    });
    canvas.on('object:scaling', (event) => {
      if (event?.target && event.target === selectedImageRef.current) {
        updateStickerToolbarPosition(event.target);
      }
    });
    canvas.on('object:modified', (event) => {
      if (event?.target && event.target === selectedImageRef.current) {
        updateStickerToolbarPosition(event.target);
      }
    });

    const handleWindowResize = () => updateStickerToolbarPosition(selectedImageRef.current);
    window.addEventListener('resize', handleWindowResize);

    canvas.renderAll();

    return () => {
      window.removeEventListener('resize', handleWindowResize);
      hideStickerToolbar();
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [product]);

  // Load a saved design if URL has ?design=<id>
  useEffect(() => {
    const loadSavedDesign = async () => {
      if (!designId || !fabricCanvasRef.current) return;
      if (loadedDesignRef.current === designId) return;

      setLoadingDesign(true);
      try {
        const res = await api.get(`/custom/design/${designId}`);
        const canvas = fabricCanvasRef.current;
        const responseProductId = Number(res.data?.productId);
        const activeProductId = Number(productId);
        if (responseProductId && responseProductId !== activeProductId) {
          toast.error('This design belongs to another product');
          return;
        }

        let data = res.data?.designData;
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch {
            data = null;
          }
        }

        if (!canvas || !data) {
          throw new Error('Invalid design data');
        }

        if (data?.byAngle && typeof data.byAngle === 'object') {
          const safeIndex = referenceImages.length > 0
            ? Math.min(Math.max(Number(data.activeAngle) || 0, 0), referenceImages.length - 1)
            : 0;
          angleDesignsRef.current = data.byAngle;
          setAngleDesigns(data.byAngle);
          setReferenceImageIndex(safeIndex);

          const initialKey = referenceImages.length > 0 ? `angle-${safeIndex}` : 'default';
          const initialState = data.byAngle[initialKey];
          if (initialState) {
            canvas.clear();
            await loadDesignJson(canvas, initialState);
            canvas.getObjects().forEach((obj) => {
              keepObjectInsideCanvas(obj, canvas);
              applyObjectControls(obj);
            });
            canvas.requestRenderAll();
            setTimeout(() => canvas.requestRenderAll(), 0);
            const imageCount = canvas.getObjects().filter((obj) => obj.type === 'image').length;
            setUploadedImageCount(imageCount);
          } else {
            clearCanvasObjects(canvas);
            setUploadedImageCount(0);
          }
        } else {
          const defaultKey = getAngleKey(0);
          angleDesignsRef.current = { [defaultKey]: data };
          setAngleDesigns({ [defaultKey]: data });
          setReferenceImageIndex(0);

          canvas.clear();
          await loadDesignJson(canvas, data);
          canvas.getObjects().forEach((obj) => {
            keepObjectInsideCanvas(obj, canvas);
            applyObjectControls(obj);
          });
          canvas.requestRenderAll();
          setTimeout(() => canvas.requestRenderAll(), 0);
          const imageCount = canvas.getObjects().filter((obj) => obj.type === 'image').length;
          setUploadedImageCount(imageCount);
        }

        loadedDesignRef.current = designId;
        toast.success('Design loaded');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load saved design');
      } finally {
        setLoadingDesign(false);
      }
    };

    loadSavedDesign();
  }, [designId, productId, product]);

  // Add text to canvas
  const addText = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !textInput.trim()) return;

    const text = new fabric.Textbox(textInput.trim(), {
      left: 100,
      top: 100,
      width: 200,
      fontSize: 32,
      fontFamily: selectedFont,
      fill: textColor,
      editable: true,
    });

    canvas.add(text);
    applyObjectControls(text);
    keepObjectInsideCanvas(text, canvas);
    canvas.setActiveObject(text);
    canvas.renderAll();
    setTextInput('');
  };

  // Handle image upload (user's own stickers)
  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!supportsImageUpload) {
      toast.error('Image stickers are not available for this product');
      event.target.value = '';
      return;
    }

    if (maxImages > 0 && uploadedImageCount >= maxImages) {
      toast.error(`You can upload up to ${maxImages} images`);
      event.target.value = '';
      return;
    }

    try {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      const localUrl = URL.createObjectURL(file);
      const img = await fabric.Image.fromURL(localUrl, { crossOrigin: 'anonymous' });

      img.scaleToWidth(Math.min(150, canvas.getWidth() * 0.35));
      img.set({ left: 150, top: 150 });
      canvas.add(img);
      applyObjectControls(img);
      keepObjectInsideCanvas(img, canvas);
      canvas.setActiveObject(img);
      canvas.renderAll();

      setUploadedImageCount((count) => count + 1);
      URL.revokeObjectURL(localUrl);
      toast.success('Image added');
    } catch {
      toast.error('Failed to load image');
    } finally {
      event.target.value = '';
    }
  };

  // Add sticker from preset (trending stickers)
  const addStickerFromPreset = async (url) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (maxImages > 0 && uploadedImageCount >= maxImages) {
      toast.error(`You can use up to ${maxImages} stickers`);
      return;
    }

    try {
      const img = await fabric.Image.fromURL(url, { crossOrigin: 'anonymous' });
      img.scaleToWidth(Math.min(80, canvas.getWidth() * 0.2));
      img.set({ left: 200, top: 200 });
      canvas.add(img);
      applyObjectControls(img);
      keepObjectInsideCanvas(img, canvas);
      canvas.setActiveObject(img);
      canvas.renderAll();
      setUploadedImageCount((count) => count + 1);
    } catch {
      toast.error('Failed to add sticker');
    }
  };

  // Remove selected object
  const removeSelectedObject = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    if (activeObject.type === 'image') {
      setUploadedImageCount((count) => Math.max(0, count - 1));
    }

    canvas.remove(activeObject);
    hideStickerToolbar();
    canvas.renderAll();
  };

  // Reset canvas (clear all user-added objects)
  const resetCanvas = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    clearCanvasObjects(canvas);
    const currentKey = getAngleKey(referenceImageIndex);
    setAngleDesigns((prev) => {
      const next = { ...prev };
      delete next[currentKey];
      delete angleOverlaySnapshotsRef.current[currentKey];
      angleDesignsRef.current = next;
      return next;
    });
    setUploadedImageCount(0);
  };

  // Save design to backend
  const saveDesign = async () => {
    if (!user) {
      toast.error('Please login to save your design');
      return;
    }

    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    setSaving(true);
    try {
      const currentKey = getAngleKey(referenceImageIndex);
      const mergedByAngle = {
        ...angleDesignsRef.current,
        [currentKey]: canvas.toJSON(),
      };

      const previewImage = await createPreviewImage();
      await api.post('/custom/save', {
        productId,
        designData: {
          byAngle: mergedByAngle,
          activeAngle: referenceImageIndex,
        },
        previewImage,
        name: `${product?.name || 'Product'} design`,
      });
      angleDesignsRef.current = mergedByAngle;
      setAngleDesigns(mergedByAngle);
      toast.success('Design saved');
    } catch (error) {
      console.error('Error saving design:', error);
      toast.error(error.response?.data?.message || 'Failed to save design');
    } finally {
      setSaving(false);
    }
  };

  // Add to cart
  const handleAddToCart = async () => {
    if (!product) return;

    try {
      saveCurrentAngleState();
      const canvas = fabricCanvasRef.current;
      const currentKey = getAngleKey(referenceImageIndex);
      const mergedByAngle = canvas
        ? {
            ...angleDesignsRef.current,
            [currentKey]: canvas.toJSON(),
          }
        : angleDesignsRef.current;

      const editedAngles = Object.keys(mergedByAngle).filter((key) => hasCanvasObjects(mergedByAngle[key]));
      const { previews: anglePreviews, sourceImages: angleSources } = await createAnglePreviews(
        mergedByAngle,
        currentKey,
        canvas,
      );

      const previewImage = await createPreviewImage();
      const customization = {
        mergeKey: `multi-angle-product-${product.id}`,
        previewImage: previewImage || null,
        editedAngles,
        anglePreviews,
        angleSources,
        designData: canvas
          ? {
              byAngle: mergedByAngle,
              activeAngle: referenceImageIndex,
            }
          : null,
      };

          angleDesignsRef.current = mergedByAngle;
      setAngleDesigns(mergedByAngle);
      await addToCart(product, 1, customization);
      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart. Please try again.');
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">Loading customizer...</div>;
  }

  if (!product) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">Product not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-5 sm:py-8">
      {/* Breadcrumb */}
      <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-500 overflow-x-auto whitespace-nowrap">
        <Link to="/products" className="text-primary-600 hover:underline">Products</Link>
        <span> / </span>
        <Link to={`/products/${product.id}`} className="text-primary-600 hover:underline">{product.name}</Link>
        <span> / Customize</span>
      </div>

      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
        Customize {product.name}
        {loadingDesign && <span className="ml-2 text-sm font-normal text-gray-500">(Loading design...)</span>}
      </h1>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Left: Editable Canvas with Background Image */}
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Design Area</h2>

          {/* Reference Images Gallery */}
          {referenceImages.length > 0 && (
            <div className="mb-4 p-2.5 sm:p-3 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-600 dark:text-blue-300 mb-2 font-medium">
                📸 View Product from Different Angles - {referenceImageIndex + 1}/{referenceImages.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => switchAngle((referenceImageIndex - 1 + referenceImages.length) % referenceImages.length)}
                  className="p-1.5 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <FiChevronLeft size={16} />
                </button>
                <div className="flex-1 h-14 sm:h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <img
                    src={referenceImages[referenceImageIndex]}
                    alt={`View ${referenceImageIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>
                <button
                  onClick={() => switchAngle((referenceImageIndex + 1) % referenceImages.length)}
                  className="p-1.5 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <FiChevronRight size={16} />
                </button>
              </div>
              <div className="flex gap-1 mt-2">
                {referenceImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => switchAngle(idx)}
                    className={`h-2 flex-1 rounded-full transition ${
                      idx === referenceImageIndex ? 'bg-blue-600' : 'bg-blue-200 dark:bg-blue-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={canvasContainerRef} className="relative w-full border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 aspect-square max-w-[320px] sm:max-w-[420px] md:max-w-[520px] lg:max-w-[600px] mx-auto">
            {!bgImageFailed && (referenceImages[referenceImageIndex] || product.image) ? (
              <img
                src={referenceImages[referenceImageIndex] || product.image}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-contain opacity-100"
                onError={() => setBgImageFailed(true)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                Image unavailable
              </div>
            )}
            <canvas
              id="design-canvas"
              className="absolute inset-0 w-full h-full"
              style={{ width: '100%', height: '100%' }}
            />
            {stickerToolbar.visible && (
              <div
                className="absolute z-20 -translate-x-1/2 flex items-center gap-1 rounded-full bg-white/95 shadow-lg border border-gray-200 px-1 py-1"
                style={{ left: `${stickerToolbar.left}px`, top: `${stickerToolbar.top}px` }}
              >
                <button
                  type="button"
                  onClick={removeSelectedObject}
                  className="h-8 w-8 rounded-full bg-red-500 text-white hover:bg-red-600 flex items-center justify-center"
                  title="Delete sticker"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 10v7" />
                    <path d="M14 10v7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Click on objects to select, then drag to move or use handles to resize.
          </p>
        </div>

        {/* Right: Controls */}
        <div className="space-y-4 sm:space-y-5 overflow-visible max-h-none pr-0 lg:overflow-y-auto lg:max-h-[700px] lg:pr-2">
          {/* Text Tool */}
          {supportsText && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Add Text</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Enter text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-gray-100"
                />
                <div className="flex gap-2">
                  <select
                    value={selectedFont}
                    onChange={(e) => setSelectedFont(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                  </select>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-10 h-10 p-1 border border-gray-300 dark:border-gray-600 rounded"
                    title="Text color"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addText}
                    className="flex-1 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
                  >
                    Add Text
                  </button>
                  {/* <button
                    type="button"
                    onClick={removeSelectedObject}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 flex items-center justify-center gap-2 whitespace-nowrap"
                    title="Delete selected item"
                  >
                    <FiTrash2 size={16} />
                    <span className="hidden sm:inline">D</span>
                  </button> */}
                </div>
              </div>
            </div>
          )}

          {/* Stickers & Upload */}
          {(stickerPresets.length > 0 || supportsImageUpload) && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Stickers & Images</h3>

              {/* Sticker categories */}
              {stickerCategories.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {stickerCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedStickerCategory(category)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${selectedStickerCategory === category ? 'bg-primary-600 border-primary-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200'}`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}

              {/* Trending stickers */}
              {visibleStickerPresets.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {visibleStickerPresets.map(({ url }, idx) => (
                    <button
                      key={`${url}-${idx}`}
                      type="button"
                      onClick={() => addStickerFromPreset(url)}
                      className="w-12 h-12 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden hover:scale-105 transition-transform"
                      title="Add sticker"
                    >
                      <img
                        src={url}
                        alt="sticker"
                        className="w-full h-full object-cover"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f5bc.png';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {supportsImageUpload && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-gray-500 dark:text-gray-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Used {uploadedImageCount}/{maxImages || '∞'} slots
                  </p>
                </>
              )}

              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={removeSelectedObject}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                >
                  Remove Selected
                </button>
                <button
                  type="button"
                  onClick={resetCanvas}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                >
                  Reset Canvas
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={saveDesign}
              disabled={saving}
              className="flex-1 py-3 border-2 border-primary-600 text-primary-600 rounded-xl font-bold hover:bg-primary-50 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Design'}
            </button>
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}