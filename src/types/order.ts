export type OrderStatus =
  | 'pendingPayment'
  | 'paid'
  | 'accepted'
  | 'assembling'
  | 'readyForDelivery'
  | 'outForDelivery'
  | 'delivered'
  | 'cancelled';

/** Customer-facing status names from the project glossary (US-6.2). */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pendingPayment: 'Очікує оплати',
  paid: 'Нове',
  accepted: 'Прийнято в роботу',
  assembling: 'У процесі складання',
  readyForDelivery: 'Готове до доставки',
  outForDelivery: 'В дорозі',
  delivered: 'Доставлено',
  cancelled: 'Скасовано',
};

export interface ServerCartItem {
  productId: string;
  sku: string;
  name: string;
  unitPrice: number;
  acceptedUnitPrice: number;
  priceChanged: boolean;
  currency: string;
  imageUrl: string | null;
  isAvailable: boolean;
  quantity: number;
  lineTotal: number;
}

export interface ServerCart {
  id: string;
  sessionToken: string;
  status: 'active' | 'converted' | 'abandoned';
  items: ServerCartItem[];
  subtotalAmount: number;
  deliveryFeeAmount: number;
  totalAmount: number;
  minimumOrderAmount: number;
  meetsMinimumOrder: boolean;
  hasPriceChanges: boolean;
  hasUnavailableItems: boolean;
  currency: string;
}

export interface DeliverySlot {
  scheduledFrom: string;
  scheduledTo: string;
  remainingCapacity: number;
  isAvailable: boolean;
  feeAmount: number;
  currency: string;
}

export interface DeliverySlotsResponse {
  date: string;
  slots: DeliverySlot[];
}

export interface CheckoutRequest {
  cartId: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  recipientName: string;
  recipientPhone: string;
  city: string;
  street: string;
  building: string;
  apartment?: string;
  deliveryNotes?: string;
  scheduledFrom: string;
  scheduledTo: string;
  cardMessage?: string;
  callBeforeDelivery: boolean;
}

export interface CheckoutResponse {
  orderId: string;
  orderNumber: string;
  trackingCode: string;
  status: OrderStatus;
  subtotalAmount: number;
  deliveryFeeAmount: number;
  totalAmount: number;
  currency: string;
  createdAt: string;
}

/** Per-item details of a 409 checkout conflict (US-4.5). */
export interface CheckoutConflictItem {
  productId: string;
  name: string;
  reason: 'unavailable' | 'insufficientQuantity' | 'priceChanged';
  acceptedUnitPrice?: number | null;
  currentUnitPrice?: number | null;
  quantityAvailable?: number | null;
}

export interface OrderDetails {
  orderId: string;
  orderNumber: string;
  trackingCode: string;
  status: OrderStatus;
  subtotalAmount: number;
  deliveryFeeAmount: number;
  totalAmount: number;
  currency: string;
  cardMessage: string | null;
  createdAt: string;
  items: { productId: string; name: string; sku: string; unitPrice: number; quantity: number; lineTotal: number }[];
  delivery: {
    recipientName: string;
    recipientPhone: string;
    city: string;
    street: string;
    building: string;
    apartment: string | null;
    deliveryNotes: string | null;
    callBeforeDelivery: boolean;
    scheduledFrom: string;
    scheduledTo: string;
  };
  payment: { provider: string; status: 'initiated' | 'succeeded' | 'failed' | 'expired'; amount: number; currency: string } | null;
  statusHistory: { status: OrderStatus; note: string | null; changedAt: string }[];
}

export interface TrackedOrder {
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  scheduledFrom: string;
  scheduledTo: string;
  totalAmount: number;
  currency: string;
  items: { name: string; quantity: number }[];
  statusHistory: { status: OrderStatus; changedAt: string }[];
}

/** What the browser keeps about a placed order: the cart token is needed to read it and pay (guest checkout). */
export interface StoredOrderSession {
  orderId: string;
  orderNumber: string;
  trackingCode: string;
  sessionToken: string;
  createdAt: string;
}
