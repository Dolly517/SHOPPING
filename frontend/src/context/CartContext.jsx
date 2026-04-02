import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const hasCanvasObjects = (state) => {
  if (!state || typeof state !== 'object') return false;
  return Array.isArray(state.objects) && state.objects.length > 0;
};

const getCustomizationKey = (customization) => {
  if (!customization || typeof customization !== 'object') return '';
  if (typeof customization.mergeKey === 'string' && customization.mergeKey.trim()) {
    return `merge:${customization.mergeKey.trim()}`;
  }
  return JSON.stringify(customization);
};

const mergeCustomizationPayload = (existing = {}, incoming = {}) => {
  const existingDesignData = existing?.designData && typeof existing.designData === 'object' ? existing.designData : {};
  const incomingDesignData = incoming?.designData && typeof incoming.designData === 'object' ? incoming.designData : {};

  const existingByAngle = existingDesignData?.byAngle && typeof existingDesignData.byAngle === 'object'
    ? existingDesignData.byAngle
    : {};
  const incomingByAngle = incomingDesignData?.byAngle && typeof incomingDesignData.byAngle === 'object'
    ? incomingDesignData.byAngle
    : {};

  const mergedByAngle = {
    ...existingByAngle,
    ...incomingByAngle,
  };

  const mergedAnglePreviews = {
    ...(existing?.anglePreviews && typeof existing.anglePreviews === 'object' ? existing.anglePreviews : {}),
    ...(incoming?.anglePreviews && typeof incoming.anglePreviews === 'object' ? incoming.anglePreviews : {}),
  };

  const mergedEditedAngles = Array.from(new Set([
    ...(Array.isArray(existing?.editedAngles) ? existing.editedAngles : []),
    ...(Array.isArray(incoming?.editedAngles) ? incoming.editedAngles : []),
    ...Object.keys(mergedByAngle).filter((key) => hasCanvasObjects(mergedByAngle[key])),
  ]));

  return {
    ...existing,
    ...incoming,
    previewImage: incoming?.previewImage || existing?.previewImage || null,
    designData: {
      ...existingDesignData,
      ...incomingDesignData,
      byAngle: mergedByAngle,
      activeAngle: Number.isInteger(incomingDesignData?.activeAngle)
        ? incomingDesignData.activeAngle
        : existingDesignData?.activeAngle,
    },
    anglePreviews: mergedAnglePreviews,
    editedAngles: mergedEditedAngles,
  };
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  // Local cart for unauthenticated users
  const [localCart, setLocalCart] = useState(() => {
    const saved = localStorage.getItem('localCart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (user) fetchCart();
    else setCart(null);
  }, [user]);

  useEffect(() => {
    localStorage.setItem('localCart', JSON.stringify(localCart));
  }, [localCart]);

  const fetchCart = async () => {
    try {
      const { data } = await api.get('/cart');
      setCart(data);
    } catch (error) {
      console.error('Cart fetch error:', error);
    }
  };

  const addToCart = async (product, quantity = 1, customization = null) => {
    if (!user) {
      // Local cart
      const customizationKey = getCustomizationKey(customization);
      setLocalCart(prev => {
        const existing = prev.find(
          i => i.productId === product.id && (i.customizationKey || '') === customizationKey
        );

        if (existing) {
          const shouldMergeCustomization = Boolean(customization?.mergeKey);
          toast.success(shouldMergeCustomization ? 'Customization updated in cart!' : 'Cart updated!');
          return prev.map(i => {
            const itemId = i.id ?? i.productId;
            const existingId = existing.id ?? existing.productId;
            if (itemId !== existingId) return i;
            return {
              ...i,
              quantity: shouldMergeCustomization ? i.quantity : i.quantity + quantity,
              customization: shouldMergeCustomization
                ? mergeCustomizationPayload(i.customization || {}, customization || {})
                : i.customization,
              customizationKey,
            };
          });
        }

        toast.success('Added to cart!');
        return [
          ...prev,
          {
            id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`,
            productId: product.id,
            product,
            quantity,
            customization,
            customizationKey,
          },
        ];
      });
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/cart', { 
        productId: product.id, 
        quantity,
        customization: customization || undefined, // Send customization if exists
      });
      setCart(data);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    if (!user) {
      if (quantity <= 0) {
        setLocalCart(prev => prev.filter(i => (i.id ?? i.productId) !== itemId));
      } else {
        setLocalCart(prev => prev.map(i => (i.id ?? i.productId) === itemId ? { ...i, quantity } : i));
      }
      return;
    }
    try {
      const { data } = await api.put(`/cart/${itemId}`, { quantity });
      setCart(data);
    } catch (error) {
      toast.error('Failed to update cart');
    }
  };

  const removeFromCart = async (itemId) => {
    if (!user) {
      setLocalCart(prev => prev.filter(i => (i.id ?? i.productId) !== itemId));
      toast.success('Removed from cart');
      return;
    }
    try {
      const { data } = await api.delete(`/cart/${itemId}`);
      setCart(data);
      toast.success('Removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    if (!user) { setLocalCart([]); return; }
    try {
      await api.delete('/cart');
      setCart(prev => prev ? { ...prev, cartItems: [] } : prev);
    } catch (error) {
      console.error(error);
    }
  };

  const cartItems = user
    ? (cart?.cartItems || [])
    : localCart.map(item => ({
        id: item.id ?? item.productId,
        productId: item.productId,
        quantity: item.quantity,
        product: item.product,
        customization: item.customization || null,
      }));

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const cartTotal = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.product?.price || 0);
    return sum + price * (item.quantity || 0);
  }, 0);

  return (
    <CartContext.Provider value={{ cart, cartItems, cartCount, cartTotal, loading, addToCart, updateCartItem, removeFromCart, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
