const CLOTHING_COLOR_OPTIONS = [
  { name: 'White', hex: '#ffffff' },
  { name: 'Black', hex: '#111827' },
  { name: 'Navy', hex: '#1e3a8a' },
  { name: 'Crimson', hex: '#dc2626' },
  { name: 'Forest', hex: '#166534' },
  { name: 'Mustard', hex: '#ca8a04' },
];

const STICKER_PRESETS = [
  'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f525.png',
  'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2b50.png',
  'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f680.png',
  'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f60e.png',
  'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4a5.png',
  'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f389.png',
];

const isClothingCustomizable = (product = {}) => {
  const category = String(product.category || '').toLowerCase();
  return category === 'clothing';
};

const isElectronicsCustomizable = (product = {}) => {
  const category = String(product.category || '').toLowerCase();
  const name = String(product.name || '').toLowerCase();
  if (category !== 'electronics') return false;
  return /(mobile|smartphone|iphone|galaxy|oneplus|pixel|laptop|macbook|notebook)/i.test(name);
};

const getCustomizationConfig = (product = {}) => {
  const enabled = Boolean(product?.isCustomizable);
  if (!enabled) {
    return {
      canCustomize: false,
      allowColorChange: false,
      availableColors: [],
      supportsText: false,
      supportsImageUpload: false,
      maxImages: 0,
      stickerPresets: [],
    };
  }

  if (isClothingCustomizable(product)) {
    return {
      canCustomize: true,
      allowColorChange: true,
      availableColors: CLOTHING_COLOR_OPTIONS,
      supportsText: true,
      supportsImageUpload: true,
      maxImages: 5,
      stickerPresets: STICKER_PRESETS,
    };
  }

  if (isElectronicsCustomizable(product)) {
    return {
      canCustomize: true,
      allowColorChange: false,
      // Keep original color only; user cannot switch colors for electronics.
      availableColors: product.color ? [{ name: product.color, hex: '#9ca3af' }] : [],
      supportsText: true,
      supportsImageUpload: false,
      maxImages: 0,
      stickerPresets: [],
    };
  }

  return {
    canCustomize: false,
    allowColorChange: false,
    availableColors: [],
    supportsText: false,
    supportsImageUpload: false,
    maxImages: 0,
    stickerPresets: [],
  };
};

module.exports = {
  getCustomizationConfig,
};
