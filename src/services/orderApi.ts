import { apiRequest } from './http';
import type {
  CheckoutRequest,
  CheckoutResponse,
  DeliverySlotsResponse,
  OrderDetails,
  ServerCart,
  StoredOrderSession,
  TrackedOrder,
} from '../types/order';

/* ---------- Guest cart (X-Cart-Token) ---------- */

export interface CartSession {
  cartId: string;
  sessionToken: string;
}

export const cartApi = {
  create: () => apiRequest<ServerCart>('/carts', { method: 'POST' }),
  get: (session: CartSession) => apiRequest<ServerCart>(`/carts/${session.cartId}`, { cartToken: session.sessionToken }),
  addItem: (session: CartSession, productId: string, quantity: number) =>
    apiRequest<ServerCart>(`/carts/${session.cartId}/items`, {
      method: 'POST',
      cartToken: session.sessionToken,
      body: { productId, quantity },
    }),
  updateItem: (session: CartSession, productId: string, quantity: number) =>
    apiRequest<ServerCart>(`/carts/${session.cartId}/items/${productId}`, {
      method: 'PUT',
      cartToken: session.sessionToken,
      body: { quantity },
    }),
  removeItem: (session: CartSession, productId: string) =>
    apiRequest<ServerCart>(`/carts/${session.cartId}/items/${productId}`, {
      method: 'DELETE',
      cartToken: session.sessionToken,
    }),
  acceptPrices: (session: CartSession) =>
    apiRequest<ServerCart>(`/carts/${session.cartId}/accept-prices`, { method: 'POST', cartToken: session.sessionToken }),
};

/* ---------- Delivery, checkout, payment, tracking ---------- */

export const orderApi = {
  /** Without a date the server returns today, or tomorrow when nothing is left today (US-4.3). */
  slots: (date?: string) =>
    apiRequest<DeliverySlotsResponse>(`/delivery/slots${date ? `?date=${encodeURIComponent(date)}` : ''}`),
  checkout: (sessionToken: string, request: CheckoutRequest) =>
    apiRequest<CheckoutResponse>('/checkout', { method: 'POST', cartToken: sessionToken, body: request }),
  get: (orderId: string, sessionToken: string) =>
    apiRequest<OrderDetails>(`/orders/${orderId}`, { cartToken: sessionToken }),
  confirmSandboxPayment: (orderId: string, sessionToken: string) =>
    apiRequest<{ paymentStatus: string; orderStatus: string }>(`/orders/${orderId}/payments/sandbox/confirm`, {
      method: 'POST',
      cartToken: sessionToken,
    }),
  track: (trackingCode: string) => apiRequest<TrackedOrder>(`/orders/track/${encodeURIComponent(trackingCode)}`),
};

/* ---------- Browser storage for guest sessions ---------- */

const CART_SESSION_KEY = 'fiore_cart_session_v1';
const ORDER_SESSIONS_KEY = 'fiore_order_sessions_v1';

const readJson = <T,>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

const writeJson = (key: string, value: unknown) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private mode); the session then lasts for this page only.
  }
};

export const cartSessionStore = {
  read: () => readJson<CartSession>(CART_SESSION_KEY),
  write: (session: CartSession | null) => writeJson(CART_SESSION_KEY, session),
};

export const orderSessionStore = {
  read: (orderId: string): StoredOrderSession | null =>
    readJson<Record<string, StoredOrderSession>>(ORDER_SESSIONS_KEY)?.[orderId] ?? null,
  write: (session: StoredOrderSession) => {
    const all = readJson<Record<string, StoredOrderSession>>(ORDER_SESSIONS_KEY) ?? {};
    all[session.orderId] = session;
    writeJson(ORDER_SESSIONS_KEY, all);
  },
};

/* ---------- Phone helpers (+380XXXXXXXXX, US-4.1) ---------- */

export const PHONE_PATTERN = /^\+380\d{9}$/;

/** Keeps the value in the +380XXXXXXXXX shape while the customer types. */
export const normalizePhoneInput = (value: string): string => {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `38${digits}`;
  if (!digits.startsWith('380')) digits = `380${digits.replace(/^3?8?0?/, '')}`;
  return `+${digits.slice(0, 12)}`;
};
