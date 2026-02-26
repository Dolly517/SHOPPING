import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (user) fetchWishlist();
    else setWishlist([]);
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const { data } = await api.get('/wishlist');
      setWishlist(data);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleWishlist = async (product) => {
    try {
      const { data } = await api.post('/wishlist', { productId: product.id });
      if (data.inWishlist) {
        setWishlist(prev => [...prev, { productId: product.id, product }]);
      } else {
        setWishlist(prev => prev.filter(i => i.productId !== product.id));
      }
      return data.inWishlist;
    } catch (error) {
      console.error(error);
    }
  };

  const isInWishlist = (productId) => wishlist.some(i => i.productId === productId);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
