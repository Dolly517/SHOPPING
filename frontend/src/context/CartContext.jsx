import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const CartContext = createContext();

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

  const addToCart = async (product, quantity = 1) => {
    if (!user) {
      // Local cart
      setLocalCart(prev => {
        const existing = prev.find(i => i.productId === product.id);
        if (existing) {
          toast.success('Cart updated!');
          return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i);
        }
        toast.success('Added to cart!');
        return [...prev, { productId: product.id, product, quantity }];
      });
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/cart', { productId: product.id, quantity });
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
        setLocalCart(prev => prev.filter(i => i.productId !== itemId));
      } else {
        setLocalCart(prev => prev.map(i => i.productId === itemId ? { ...i, quantity } : i));
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
      setLocalCart(prev => prev.filter(i => i.productId !== itemId));
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
    : localCart.map(item => ({ id: item.productId, productId: item.productId, quantity: item.quantity, product: item.product }));

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
