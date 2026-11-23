import { useContext } from 'react';
import { CartContext } from '../context/cart-context';
import type { CartContextType } from '../types/cart';

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
