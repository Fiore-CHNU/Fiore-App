import type { CatalogProductItem } from './catalog';
import type { ServerCart } from './order';

export interface CartItem {
  product: CatalogProductItem;
  quantity: number;
  /** Price the customer saw when adding the item; differs from product.price after a price change (US-4.5). */
  acceptedUnitPrice: number;
  priceChanged: boolean;
  lineTotal: number;
}

export interface CartContextType {
  items: CartItem[];
  totalCount: number;
  /** Items subtotal (without delivery). */
  totalAmount: number;
  deliveryFeeAmount: number;
  grandTotalAmount: number;
  minimumOrderAmount: number;
  meetsMinimumOrder: boolean;
  hasPriceChanges: boolean;
  hasUnavailableItems: boolean;
  /** The server cart, needed for checkout; null until the first item is added. */
  serverCart: ServerCart | null;
  isSyncing: boolean;
  error: string | null;
  clearError: () => void;
  addToCart: (product: CatalogProductItem, quantity?: number) => Promise<boolean>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  acceptPrices: () => Promise<void>;
  refreshCart: () => Promise<ServerCart | null>;
  /** Forgets the converted cart after a successful checkout. */
  forgetCart: () => void;
  /** Re-creates a cart from a previous order (e.g. after the payment window expired). */
  restoreItems: (items: { productId: string; quantity: number }[]) => Promise<void>;
  getItemQuantity: (productId: string) => number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}
