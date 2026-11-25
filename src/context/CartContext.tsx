import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CatalogProductItem } from '../types/catalog';
import type { CartItem } from '../types/cart';
import type { ServerCart } from '../types/order';
import { CartContext } from './cart-context';
import { ApiError } from '../services/http';
import { cartApi, cartSessionStore, type CartSession } from '../services/orderApi';

/** Cart kept only in the browser before the API cart existed; migrated once on load. */
const LEGACY_CART_KEY = 'fiore_cart_items_v1';

const toCartItems = (cart: ServerCart | null): CartItem[] =>
  (cart?.items ?? []).map(item => ({
    product: {
      id: item.productId,
      sku: item.sku,
      name: item.name,
      price: item.unitPrice,
      currency: item.currency === 'UAH' ? '₴' : item.currency,
      imageUrl: item.imageUrl,
      isAvailable: item.isAvailable,
    },
    quantity: item.quantity,
    acceptedUnitPrice: item.acceptedUnitPrice,
    priceChanged: item.priceChanged,
    lineTotal: item.lineTotal,
  }));

const describeCartError = (error: unknown): string => {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'ProductNotAvailable':
        return 'Цього букета зараз немає в наявності.';
      case 'QuantityExceedsAvailability':
        return 'Такої кількості немає в наявності.';
      default:
        if (error.status === 404) return 'Букет не знайдено. Оновіть каталог і спробуйте ще раз.';
    }
  }
  return 'Не вдалося оновити кошик. Перевірте з’єднання та спробуйте ще раз.';
};

/** A stored cart that the server no longer accepts (converted, expired, or unknown) must be dropped. */
const isStaleSession = (error: unknown) =>
  error instanceof ApiError && (error.status === 404 || error.status === 403 || error.code === 'Inactive');

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [serverCart, setServerCart] = useState<ServerCart | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const sessionRef = useRef<CartSession | null>(cartSessionStore.read());

  const setSession = (session: CartSession | null) => {
    sessionRef.current = session;
    cartSessionStore.write(session);
  };

  const ensureSession = useCallback(async (): Promise<CartSession> => {
    if (sessionRef.current) return sessionRef.current;
    const cart = await cartApi.create();
    const session = { cartId: cart.id, sessionToken: cart.sessionToken };
    setSession(session);
    setServerCart(cart);
    return session;
  }, []);

  /** Runs a cart operation; recreates the cart once if the stored one is no longer valid. */
  const run = useCallback(
    async (operation: (session: CartSession) => Promise<ServerCart>): Promise<boolean> => {
      setIsSyncing(true);
      setError(null);
      try {
        try {
          setServerCart(await operation(await ensureSession()));
        } catch (err) {
          if (!isStaleSession(err) || !sessionRef.current) throw err;
          setSession(null);
          setServerCart(await operation(await ensureSession()));
        }
        return true;
      } catch (err) {
        setError(describeCartError(err));
        return false;
      } finally {
        setIsSyncing(false);
      }
    },
    [ensureSession],
  );

  const refreshCart = useCallback(async (): Promise<ServerCart | null> => {
    const session = sessionRef.current;
    if (!session) return null;
    try {
      const cart = await cartApi.get(session);
      setServerCart(cart);
      return cart;
    } catch (err) {
      if (isStaleSession(err)) {
        setSession(null);
        setServerCart(null);
      }
      return null;
    }
  }, []);

  // Load the stored cart and migrate items from the old browser-only cart.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      await refreshCart();
      let legacy: { product: { id: string; isAvailable?: boolean }; quantity: number }[] = [];
      try {
        legacy = JSON.parse(localStorage.getItem(LEGACY_CART_KEY) ?? '[]');
        localStorage.removeItem(LEGACY_CART_KEY);
      } catch {
        legacy = [];
      }
      for (const item of Array.isArray(legacy) ? legacy : []) {
        if (cancelled) return;
        if (item?.product?.id && item.quantity > 0) {
          await run(session => cartApi.addItem(session, item.product.id, item.quantity));
        }
      }
      // Migration problems (e.g. mock products) must not greet the customer with an error.
      if (!cancelled) setError(null);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [refreshCart, run]);

  const items = useMemo(() => toCartItems(serverCart), [serverCart]);

  const addToCart = useCallback(
    (product: CatalogProductItem, quantity = 1) =>
      product.isAvailable ? run(session => cartApi.addItem(session, product.id, quantity)) : Promise.resolve(false),
    [run],
  );

  const removeFromCart = useCallback(
    async (productId: string) => {
      await run(session => cartApi.removeItem(session, productId));
    },
    [run],
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }
      await run(session => cartApi.updateItem(session, productId, Math.min(99, Math.floor(quantity))));
    },
    [removeFromCart, run],
  );

  const clearCart = useCallback(async () => {
    for (const item of serverCart?.items ?? []) {
      await run(session => cartApi.removeItem(session, item.productId));
    }
  }, [run, serverCart]);

  const acceptPrices = useCallback(async () => {
    await run(session => cartApi.acceptPrices(session));
  }, [run]);

  const forgetCart = useCallback(() => {
    setSession(null);
    setServerCart(null);
  }, []);

  const restoreItems = useCallback(
    async (toRestore: { productId: string; quantity: number }[]) => {
      for (const item of toRestore) {
        await run(session => cartApi.addItem(session, item.productId, item.quantity));
      }
    },
    [run],
  );

  const getItemQuantity = useCallback(
    (productId: string) => items.find(item => item.product.id === productId)?.quantity ?? 0,
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      totalCount: items.reduce((sum, item) => sum + item.quantity, 0),
      totalAmount: serverCart?.subtotalAmount ?? 0,
      deliveryFeeAmount: serverCart?.deliveryFeeAmount ?? 0,
      grandTotalAmount: serverCart?.totalAmount ?? 0,
      minimumOrderAmount: serverCart?.minimumOrderAmount ?? 500,
      meetsMinimumOrder: serverCart?.meetsMinimumOrder ?? false,
      hasPriceChanges: serverCart?.hasPriceChanges ?? false,
      hasUnavailableItems: serverCart?.hasUnavailableItems ?? false,
      serverCart,
      isSyncing,
      error,
      clearError: () => setError(null),
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      acceptPrices,
      refreshCart,
      forgetCart,
      restoreItems,
      getItemQuantity,
      isCartOpen,
      setIsCartOpen,
    }),
    [
      items,
      serverCart,
      isSyncing,
      error,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      acceptPrices,
      refreshCart,
      forgetCart,
      restoreItems,
      getItemQuantity,
      isCartOpen,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
