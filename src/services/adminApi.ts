import { apiRequest } from './http';
import type { OrderStatus } from '../types/order';

export interface AdminOrderListItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  contactName: string;
  contactPhone: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  payment: { status: string; provider: string } | null;
  delivery: {
    recipientName: string;
    city: string;
    scheduledFrom: string;
    scheduledTo: string;
    courierName: string | null;
    canMoveToOutForDelivery: boolean;
  };
}

export interface AdminOrderDetails {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  subtotalAmount: number;
  deliveryFeeAmount: number;
  totalAmount: number;
  currency: string;
  customerNote: string | null;
  cardMessage: string | null;
  createdAt: string;
  updatedAt: string;
  items: { productId: string; productName: string; productSku: string; unitPrice: number; quantity: number; lineTotal: number }[];
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
    courierName: string | null;
    courierPhone: string | null;
    courierAssignedAt: string | null;
  };
  payment: { provider: string; status: string; amount: number; currency: string; completedAt: string | null } | null;
  statusHistory: { status: OrderStatus; note: string | null; changedBy: string | null; changedAt: string }[];
}

export interface AdminProduct {
  id: string;
  sku: string;
  name: string;
  price: number;
  currency: string;
  status: 'available' | 'hidden' | 'discontinued';
  isTemporarilyUnavailable: boolean;
  quantityAvailable: number;
  isAvailable: boolean;
  imageUrl: string | null;
}

export interface OrderQueueFilter {
  status?: OrderStatus | '';
  deliveryDate?: string;
}

/** Staff transitions accepted by PUT /admin/orders/{id}/status (backend OrderLifecycleService). */
export const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  paid: 'accepted',
  accepted: 'assembling',
  assembling: 'readyForDelivery',
  readyForDelivery: 'outForDelivery',
  outForDelivery: 'delivered',
};

export const CANCELLABLE: OrderStatus[] = ['pendingPayment', 'paid', 'accepted', 'assembling', 'readyForDelivery'];
export const COURIER_STATUSES: OrderStatus[] = ['assembling', 'readyForDelivery'];

export const adminApi = {
  listOrders: (token: string, filter: OrderQueueFilter = {}) => {
    const query = new URLSearchParams();
    if (filter.status) query.set('status', filter.status);
    if (filter.deliveryDate) query.set('deliveryDate', filter.deliveryDate);
    const suffix = query.toString() ? `?${query}` : '';
    return apiRequest<AdminOrderListItem[]>(`/admin/orders${suffix}`, { accessToken: token });
  },
  getOrder: (token: string, orderId: string) => apiRequest<AdminOrderDetails>(`/admin/orders/${orderId}`, { accessToken: token }),
  changeStatus: (token: string, orderId: string, status: OrderStatus) =>
    apiRequest<{ id: string; status: OrderStatus }>(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      accessToken: token,
      body: { status },
    }),
  assignCourier: (token: string, orderId: string, courierName: string, courierPhone?: string) =>
    apiRequest<{ deliverySummaryText: string }>(`/admin/orders/${orderId}/courier`, {
      method: 'PUT',
      accessToken: token,
      body: { courierName, courierPhone: courierPhone || undefined },
    }),
  deliverySummary: (token: string, orderId: string) =>
    apiRequest<{ text: string }>(`/admin/orders/${orderId}/delivery-summary`, { accessToken: token }),
  listProducts: (token: string, search?: string) =>
    apiRequest<AdminProduct[]>(`/admin/products${search ? `?search=${encodeURIComponent(search)}` : ''}`, { accessToken: token }),
  setAvailability: (token: string, productId: string, isAvailable: boolean) =>
    apiRequest<{ id: string; isTemporarilyUnavailable: boolean; isAvailable: boolean; quantityAvailable: number }>(
      `/admin/products/${productId}/availability`,
      { method: 'PUT', accessToken: token, body: { isAvailable } },
    ),
};
