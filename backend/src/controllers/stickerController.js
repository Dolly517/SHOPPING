const asyncHandler = require('express-async-handler');
const { Sticker } = require('../models');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const STICKER_UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads', 'stickers');

const ensureStickerUploadDir = () => {
  if (!fs.existsSync(STICKER_UPLOAD_DIR)) {
    fs.mkdirSync(STICKER_UPLOAD_DIR, { recursive: true });
  }
};

const normalizeCategory = (category) => {
  if (typeof category !== 'string') return 'General';
  const trimmed = category.trim();
  return trimmed || 'General';
};

const getIncomingCategory = (body = {}) => {
  const candidates = [
    body.category,
    body.Category,
    body.stickerCategory,
    body.sticker_category,
  ];

  const firstString = candidates.find((value) => typeof value === 'string');
  return normalizeCategory(firstString);
};

const getProcessedStickerFile = async (imageBuffer) => {
  const processedBuffer = await removeWhiteBlackBackground(imageBuffer);
  ensureStickerUploadDir();

  const fileName = `sticker-processed-${Date.now()}-${Math.round(Math.random() * 1e9)}.png`;
  const outputPath = path.join(STICKER_UPLOAD_DIR, fileName);
  fs.writeFileSync(outputPath, processedBuffer);

  return {
    fileName,
    imageUrl: `/uploads/stickers/${fileName}`,
  };
};

const removeWhiteBlackBackground = async (imageBuffer) => {
  const { data, info } = await sharp(imageBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const pixelCount = width * height;
  const bgMask = new Uint8Array(pixelCount);

  const WHITE_SEED_THRESHOLD = 248;
  const BLACK_SEED_THRESHOLD = 12;
  const WHITE_EXPAND_THRESHOLD = 238;
  const BLACK_EXPAND_THRESHOLD = 22;
  const GRAY_SEED_MAX_CHANNEL_GAP = 12;
  const GRAY_SEED_MIN_BRIGHTNESS = 40;
  const GRAY_SEED_MAX_BRIGHTNESS = 230;
  const GRAY_EXPAND_MAX_CHANNEL_GAP = 18;
  const GRAY_EXPAND_MIN_BRIGHTNESS = 30;
  const GRAY_EXPAND_MAX_BRIGHTNESS = 240;

  const idxFor = (x, y) => y * width + x;
  const rawIndexFor = (pixelIndex) => pixelIndex * 4;
  const colorDistance = (r1, g1, b1, r2, g2, b2) => {
    const dr = r1 - r2;
    const dg = g1 - g2;
    const db = b1 - b2;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  };

  const isWhite = (pixelIndex, threshold) => {
    const i = rawIndexFor(pixelIndex);
    return data[i + 3] > 0 && data[i] >= threshold && data[i + 1] >= threshold && data[i + 2] >= threshold;
  };

  const isBlack = (pixelIndex, threshold) => {
    const i = rawIndexFor(pixelIndex);
    return data[i + 3] > 0 && data[i] <= threshold && data[i + 1] <= threshold && data[i + 2] <= threshold;
  };

  const isGray = (pixelIndex, maxGap, minBrightness, maxBrightness) => {
    const i = rawIndexFor(pixelIndex);
    if (data[i + 3] === 0) return false;

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    const brightness = (r + g + b) / 3;

    return (maxC - minC) <= maxGap && brightness >= minBrightness && brightness <= maxBrightness;
  };

  const borderPixels = [];
  const addBorderPixel = (pixelIndex) => {
    const i = rawIndexFor(pixelIndex);
    if (data[i + 3] === 0) return;
    borderPixels.push({
      r: data[i],
      g: data[i + 1],
      b: data[i + 2],
    });
  };

  let borderWhiteCount = 0;
  let borderBlackCount = 0;
  let borderGrayCount = 0;
  let borderTotal = 0;

  for (let x = 0; x < width; x++) {
    const top = idxFor(x, 0);
    const bottom = idxFor(x, height - 1);
    addBorderPixel(top);
    addBorderPixel(bottom);
    borderTotal += 2;
    if (isWhite(top, WHITE_SEED_THRESHOLD)) borderWhiteCount += 1;
    if (isWhite(bottom, WHITE_SEED_THRESHOLD)) borderWhiteCount += 1;
    if (isBlack(top, BLACK_SEED_THRESHOLD)) borderBlackCount += 1;
    if (isBlack(bottom, BLACK_SEED_THRESHOLD)) borderBlackCount += 1;
    if (isGray(top, GRAY_SEED_MAX_CHANNEL_GAP, GRAY_SEED_MIN_BRIGHTNESS, GRAY_SEED_MAX_BRIGHTNESS)) borderGrayCount += 1;
    if (isGray(bottom, GRAY_SEED_MAX_CHANNEL_GAP, GRAY_SEED_MIN_BRIGHTNESS, GRAY_SEED_MAX_BRIGHTNESS)) borderGrayCount += 1;
  }

  for (let y = 1; y < height - 1; y++) {
    const left = idxFor(0, y);
    const right = idxFor(width - 1, y);
    addBorderPixel(left);
    addBorderPixel(right);
    borderTotal += 2;
    if (isWhite(left, WHITE_SEED_THRESHOLD)) borderWhiteCount += 1;
    if (isWhite(right, WHITE_SEED_THRESHOLD)) borderWhiteCount += 1;
    if (isBlack(left, BLACK_SEED_THRESHOLD)) borderBlackCount += 1;
    if (isBlack(right, BLACK_SEED_THRESHOLD)) borderBlackCount += 1;
    if (isGray(left, GRAY_SEED_MAX_CHANNEL_GAP, GRAY_SEED_MIN_BRIGHTNESS, GRAY_SEED_MAX_BRIGHTNESS)) borderGrayCount += 1;
    if (isGray(right, GRAY_SEED_MAX_CHANNEL_GAP, GRAY_SEED_MIN_BRIGHTNESS, GRAY_SEED_MAX_BRIGHTNESS)) borderGrayCount += 1;
  }

  const useWhiteBg = borderTotal > 0 && borderWhiteCount / borderTotal >= 0.06;
  const useBlackBg = borderTotal > 0 && borderBlackCount / borderTotal >= 0.06;
  const useGrayBg = borderTotal > 0 && borderGrayCount / borderTotal >= 0.08;

  const quantizedBorder = new Map();
  const QUANT = 16;
  for (const px of borderPixels) {
    const qr = Math.round(px.r / QUANT) * QUANT;
    const qg = Math.round(px.g / QUANT) * QUANT;
    const qb = Math.round(px.b / QUANT) * QUANT;
    const key = `${qr},${qg},${qb}`;
    quantizedBorder.set(key, (quantizedBorder.get(key) || 0) + 1);
  }

  const dominantBorderColors = Array.from(quantizedBorder.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .filter(([, count]) => borderTotal > 0 && count / borderTotal >= 0.04)
    .map(([key]) => {
      const [r, g, b] = key.split(',').map(Number);
      return { r, g, b };
    });

  const isNearDominantBorder = (pixelIndex, tolerance) => {
    if (dominantBorderColors.length === 0) return false;
    const i = rawIndexFor(pixelIndex);
    if (data[i + 3] === 0) return false;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    return dominantBorderColors.some((bg) => colorDistance(r, g, b, bg.r, bg.g, bg.b) <= tolerance);
  };

  const queue = new Uint32Array(pixelCount);
  let head = 0;
  let tail = 0;

  const pushSeed = (pixelIndex) => {
    if (bgMask[pixelIndex]) return;
    const isSeed =
      (useWhiteBg && isWhite(pixelIndex, WHITE_SEED_THRESHOLD)) ||
      (useBlackBg && isBlack(pixelIndex, BLACK_SEED_THRESHOLD)) ||
      (useGrayBg && isGray(pixelIndex, GRAY_SEED_MAX_CHANNEL_GAP, GRAY_SEED_MIN_BRIGHTNESS, GRAY_SEED_MAX_BRIGHTNESS)) ||
      isNearDominantBorder(pixelIndex, 18);
    if (!isSeed) return;
    bgMask[pixelIndex] = 1;
    queue[tail++] = pixelIndex;
  };

  for (let x = 0; x < width; x++) {
    pushSeed(idxFor(x, 0));
    pushSeed(idxFor(x, height - 1));
  }
  for (let y = 1; y < height - 1; y++) {
    pushSeed(idxFor(0, y));
    pushSeed(idxFor(width - 1, y));
  }

  const tryVisit = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const pixelIndex = idxFor(x, y);
    if (bgMask[pixelIndex]) return;

    const isBgCandidate =
      (useWhiteBg && isWhite(pixelIndex, WHITE_EXPAND_THRESHOLD)) ||
      (useBlackBg && isBlack(pixelIndex, BLACK_EXPAND_THRESHOLD)) ||
      (useGrayBg && isGray(pixelIndex, GRAY_EXPAND_MAX_CHANNEL_GAP, GRAY_EXPAND_MIN_BRIGHTNESS, GRAY_EXPAND_MAX_BRIGHTNESS)) ||
      isNearDominantBorder(pixelIndex, 30);

    if (!isBgCandidate) return;
    bgMask[pixelIndex] = 1;
    queue[tail++] = pixelIndex;
  };

  while (head < tail) {
    const pixelIndex = queue[head++];
    const y = Math.floor(pixelIndex / width);
    const x = pixelIndex - y * width;

    tryVisit(x - 1, y);
    tryVisit(x + 1, y);
    tryVisit(x, y - 1);
    tryVisit(x, y + 1);
  }

  for (let i = 0; i < pixelCount; i++) {
    if (!bgMask[i]) continue;
    const raw = rawIndexFor(i);
    data[raw + 3] = 0;
  }

  return sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();
};

const downloadAndProcessSticker = async (sourceUrl) => {
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error('Could not download image from URL');
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.startsWith('image/')) {
    throw new Error('Provided URL is not an image');
  }

  const arrayBuffer = await response.arrayBuffer();
  const originalBuffer = Buffer.from(arrayBuffer);
  const processed = await getProcessedStickerFile(originalBuffer);
  return processed.imageUrl;
};

// @desc    Get all active stickers
// @route   GET /api/admin/stickers
// @access  Public (anyone can view stickers)
const getAllStickers = asyncHandler(async (req, res) => {
  const stickers = await Sticker.findAll({
    where: { isActive: true },
    order: [['createdAt', 'DESC']],
  });

  res.json(stickers);
});

// @desc    Get admin stickers (all, including inactive)
// @route   GET /api/admin/stickers/all
// @access  Private/Admin
const getAdminStickers = asyncHandler(async (req, res) => {
  const stickers = await Sticker.findAll({
    order: [['createdAt', 'DESC']],
  });

  res.json(stickers);
});

// @desc    Upload a new sticker
// @route   POST /api/admin/stickers
// @access  Private/Admin
const uploadSticker = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const { name } = req.body;
  const category = getIncomingCategory(req.body);

  let imageUrl = `/uploads/stickers/${req.file.filename}`;
  try {
    const originalBuffer = fs.readFileSync(req.file.path);
    const processed = await getProcessedStickerFile(originalBuffer);
    imageUrl = processed.imageUrl;
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  } catch (error) {
    console.warn('Sticker background processing failed for direct upload:', error.message);
  }

  const sticker = await Sticker.create({
    name: name || req.file.originalname.split('.')[0],
    imageUrl,
    category,
    uploadedBy: req.user.id,
    isActive: true,
  });

  res.status(201).json(sticker);
});

// @desc    Create a new sticker from image URL
// @route   POST /api/stickers/admin/url
// @access  Private/Admin
const createStickerFromUrl = asyncHandler(async (req, res) => {
  const { name, imageUrl } = req.body;
  const category = getIncomingCategory(req.body);

  if (!imageUrl || typeof imageUrl !== 'string') {
    res.status(400);
    throw new Error('Image URL is required');
  }

  const trimmedUrl = imageUrl.trim();
  const isHttpUrl = /^https?:\/\//i.test(trimmedUrl);
  const isUploadsPath = trimmedUrl.startsWith('/uploads/');

  if (!isHttpUrl && !isUploadsPath) {
    res.status(400);
    throw new Error('Provide a valid image URL');
  }

  let finalImageUrl = trimmedUrl;
  if (isHttpUrl) {
    finalImageUrl = await downloadAndProcessSticker(trimmedUrl);
  }

  const sticker = await Sticker.create({
    name: (name && String(name).trim()) || 'Sticker',
    imageUrl: finalImageUrl,
    category,
    uploadedBy: req.user.id,
    isActive: true,
  });

  res.status(201).json(sticker);
});

// @desc    Update sticker
// @route   PUT /api/admin/stickers/:id
// @access  Private/Admin
const updateSticker = asyncHandler(async (req, res) => {
  const { name, category, isActive } = req.body;
  const sticker = await Sticker.findByPk(req.params.id);

  if (!sticker) {
    res.status(404);
    throw new Error('Sticker not found');
  }

  if (name) sticker.name = name;
  if (category !== undefined) sticker.category = getIncomingCategory(req.body);
  if (isActive !== undefined) sticker.isActive = isActive;

  await sticker.save();
  res.json(sticker);
});

// @desc    Delete sticker
// @route   DELETE /api/admin/stickers/:id
// @access  Private/Admin
const deleteSticker = asyncHandler(async (req, res) => {
  const sticker = await Sticker.findByPk(req.params.id);

  if (!sticker) {
    res.status(404);
    throw new Error('Sticker not found');
  }

  // Delete physical file only for locally uploaded stickers
  try {
    const imageUrl = String(sticker.imageUrl || '');
    if (imageUrl.includes('/uploads/stickers/')) {
      const filename = imageUrl.split('/').pop();
      const filePath = path.join(__dirname, '..', '..', 'uploads', 'stickers', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (error) {
    console.error('Error deleting sticker file:', error);
  }

  await sticker.destroy();
  res.json({ message: 'Sticker deleted successfully' });
});

module.exports = {
  getAllStickers,
  getAdminStickers,
  uploadSticker,
  createStickerFromUrl,
  updateSticker,
  deleteSticker,
};
