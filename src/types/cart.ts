import type { CatalogProductItem } from './catalog';

export interface CartItem {
  product: CatalogProductItem;
  quantity: number;
}

export interface CartContextType {
  items: CartItem[];
  totalCount: number;
  totalAmount: number;
  addToCart: (product: CatalogProductItem, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}
