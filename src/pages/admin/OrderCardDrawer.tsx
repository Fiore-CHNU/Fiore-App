import React, { useCallback, useEffect, useState } from 'react';
import { ArrowRight, Ban, Copy, Loader2, Phone, Printer, Truck, X } from 'lucide-react';
import { ApiError, formatDateTime, formatSlot, formatUah } from '../../services/http';
import { adminApi, CANCELLABLE, COURIER_STATUSES, NEXT_STATUS, type AdminOrderDetails } from '../../services/adminApi';
import { normalizePhoneInput, PHONE_PATTERN } from '../../services/orderApi';
import { ORDER_STATUS_LABELS } from '../../types/order';
import { printGreetingCard } from './printGreetingCard';

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  initiated: 'очікує',
  succeeded: 'оплачено',
  failed: 'не вдалася',
  expired: 'час вичерпано',
};

interface OrderCardDrawerProps {
  orderId: string;
  token: string;
  onClose: () => void;
  onChanged: () => void;
  onUnauthorized: () => void;
}

export const OrderCardDrawer: React.FC<OrderCardDrawerProps> = ({ orderId, token, onClose, onChanged, onUnauthorized }) => {
  const [order, setOrder] = useState<AdminOrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'error' | 'info'; text: string } | null>(null);
  const [courierName, setCourierName] = useState('');
  const [courierPhone, setCourierPhone] = useState('+380');

  const handleError = useCallback(
    (error: unknown, fallback: string) => {
      if (error instanceof ApiError && error.status === 401) {
        onUnauthorized();
        return;
      }
      const code = error instanceof ApiError ? error.code : undefined;
      const text =
        code === 'CourierRequired'
          ? 'Спочатку вкажіть кур’єра.'
          : code === 'InvalidOrderStatusTransition'
            ? 'Статус уже змінився. Оновіть картку.'
            : code === 'InvalidOrderStatusForCourierAssignment'
              ? 'Кур’єра можна призначити лише під час складання або коли замовлення готове.'
              : fallback;
      setMessage({ kind: 'error', text });
    },
    [onUnauthorized],
  );

  const load = useCallback(async () => {
    try {
      const result = await adminApi.getOrder(token, orderId);
      setOrder(result);
      setCourierName(result.delivery.courierName ?? '');
      setCourierPhone(result.delivery.courierPhone ?? '+380');
    } catch (error) {
      handleError(error, 'Не вдалося завантажити замовлення.');
    } finally {
      setLoading(false);
    }
  }, [token, orderId, handleError]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const run = async (action: () => Promise<unknown>, success: string, fallback: string) => {
    setBusy(true);
    setMessage(null);
    try {
      await action();
      setMessage({ kind: 'info', text: success });
      await load();
      onChanged();
    } catch (error) {
      handleError(error, fallback);
    } finally {
      setBusy(false);
    }
  };

  const copyDeliveryText = async () => {
    if (!order) return;
    try {
      const { text } = await adminApi.deliverySummary(token, order.id);
      await navigator.clipboard.writeText(text);
      setMessage({ kind: 'info', text: 'Дані доставки скопійовано.' });
    } catch (error) {
      handleError(error, 'Не вдалося скопіювати дані доставки.');
    }
  };

  const next = order ? NEXT_STATUS[order.status] : undefined;
  const canAssignCourier = order ? COURIER_STATUSES.includes(order.status) : false;
  const courierPhoneValid = courierPhone === '+380' || PHONE_PATTERN.test(courierPhone);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <aside role="dialog" aria-modal="true" aria-label="Картка замовлення"
        className="relative z-10 flex h-full w-full max-w-xl flex-col overflow-y-auto border-l border-[#431A3B] bg-[#240D20] p-5 sm:p-7">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white" aria-label="Закрити">
          <X className="h-5 w-5" />
        </button>

        {loading || !order ? (
          <div className="flex flex-1 items-center justify-center text-white/60">
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : message?.text}
          </div>
        ) : (
          <>
            <p className="text-xs uppercase tracking-widest text-[#F5B2E2]/80">{order.orderNumber}</p>
            <h2 className="mb-1 mt-1 font-serif text-2xl">{ORDER_STATUS_LABELS[order.status]}</h2>
            <p className="mb-5 text-xs text-white/50">Створено {formatDateTime(order.createdAt)}</p>

            {message && (
              <p role="status" className={`mb-4 rounded-xl px-3 py-2 text-sm ${message.kind === 'error' ? 'bg-red-500/10 text-red-200' : 'bg-emerald-500/10 text-emerald-200'}`}>
                {message.text}
              </p>
            )}

            {/* US-9.4: only the next step is offered; cancellation before dispatch. */}
            <div className="mb-6 flex flex-wrap gap-2">
              {next && (
                <button disabled={busy}
                  onClick={() => void run(() => adminApi.changeStatus(token, order.id, next), `Статус: ${ORDER_STATUS_LABELS[next]}`, 'Не вдалося змінити статус.')}
                  className="inline-flex items-center gap-2 rounded-full bg-[#F5B2E2] px-4 py-2 text-sm font-semibold text-[#1E0B1A] hover:bg-[#FDBDE9] disabled:opacity-50">
                  <ArrowRight className="h-4 w-4" /> {ORDER_STATUS_LABELS[next]}
                </button>
              )}
              {CANCELLABLE.includes(order.status) && (
                <button disabled={busy}
                  onClick={() => {
                    if (window.confirm(`Скасувати замовлення ${order.orderNumber}? Букети повернуться у вітрину.`)) {
                      void run(() => adminApi.changeStatus(token, order.id, 'cancelled'), 'Замовлення скасовано.', 'Не вдалося скасувати замовлення.');
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-red-400/40 px-4 py-2 text-sm text-red-200 hover:bg-red-500/10 disabled:opacity-50">
                  <Ban className="h-4 w-4" /> Скасувати
                </button>
              )}
            </div>

            <section className="mb-5 rounded-2xl bg-[#1B0918] p-4 text-sm">
              <h3 className="mb-2 font-serif text-base text-[#FFD7F1]">Доставка</h3>
              <p className="text-white">{formatSlot(order.delivery.scheduledFrom, order.delivery.scheduledTo)}</p>
              <p className="text-white/80">
                {order.delivery.city}, {order.delivery.street}, {order.delivery.building}{order.delivery.apartment ? `, кв. ${order.delivery.apartment}` : ''}
              </p>
              <p className="mt-2 text-white/80">Одержувач: {order.delivery.recipientName}, <a className="text-[#F5B2E2]" href={`tel:${order.delivery.recipientPhone}`}>{order.delivery.recipientPhone}</a></p>
              {order.delivery.callBeforeDelivery && <p className="mt-1 inline-flex items-center gap-1 text-amber-200"><Phone className="h-3.5 w-3.5" /> Зателефонувати перед доставкою</p>}
              {order.delivery.deliveryNotes && <p className="mt-1 text-white/60">Коментар: {order.delivery.deliveryNotes}</p>}

              {/* US-10.1: courier is external delivery data, required before "out for delivery". */}
              <div className="mt-4 border-t border-[#3A1734] pt-4">
                <p className="mb-2 flex items-center gap-2 text-[#FFD7F1]"><Truck className="h-4 w-4" /> Кур’єр</p>
                {order.delivery.courierName && (
                  <p className="mb-2 text-white">{order.delivery.courierName}{order.delivery.courierPhone ? `, ${order.delivery.courierPhone}` : ''}</p>
                )}
                {canAssignCourier && (
                  <form className="flex flex-col gap-2 sm:flex-row"
                    onSubmit={event => {
                      event.preventDefault();
                      if (!courierName.trim() || !courierPhoneValid) return;
                      void run(() => adminApi.assignCourier(token, order.id, courierName.trim(), courierPhone === '+380' ? undefined : courierPhone),
                        'Кур’єра призначено.', 'Не вдалося призначити кур’єра.');
                    }}>
                    <input aria-label="Ім’я кур’єра" placeholder="Ім’я кур’єра" value={courierName} maxLength={120}
                      onChange={event => setCourierName(event.target.value)}
                      className="flex-1 rounded-xl border border-[#522149] bg-[#240D20] px-3 py-2 text-sm text-white outline-none focus:border-[#F5B2E2]" />
                    <input aria-label="Телефон кур’єра" type="tel" value={courierPhone}
                      onChange={event => setCourierPhone(normalizePhoneInput(event.target.value))}
                      className={`w-full rounded-xl border bg-[#240D20] px-3 py-2 text-sm text-white outline-none focus:border-[#F5B2E2] sm:w-40 ${courierPhoneValid ? 'border-[#522149]' : 'border-red-400/70'}`} />
                    <button type="submit" disabled={busy || !courierName.trim() || !courierPhoneValid}
                      className="rounded-xl bg-[#4E1E45] px-3 py-2 text-sm font-semibold hover:bg-[#5C234E] disabled:opacity-50">
                      Зберегти
                    </button>
                  </form>
                )}
                {order.delivery.courierName && (
                  <button onClick={() => void copyDeliveryText()} className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#F5B2E2] hover:underline">
                    <Copy className="h-3.5 w-3.5" /> Копіювати дані доставки для месенджера
                  </button>
                )}
                {!order.delivery.courierName && !canAssignCourier && <p className="text-xs text-white/50">Кур’єра призначають під час складання.</p>}
              </div>
            </section>

            <section className="mb-5 text-sm">
              <h3 className="mb-2 font-serif text-base text-[#FFD7F1]">Склад</h3>
              <ul className="divide-y divide-[#3A1734]">
                {order.items.map(item => (
                  <li key={item.productId} className="flex justify-between gap-3 py-2">
                    <span>{item.productName} <span className="text-white/50">× {item.quantity}</span></span>
                    <span className="text-[#FFD7F1]">{formatUah(item.lineTotal)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex justify-between border-t border-[#3A1734] pt-2 text-white/70">
                <span>Доставка</span><span>{formatUah(order.deliveryFeeAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold"><span>Разом</span><span className="text-[#F5B2E2]">{formatUah(order.totalAmount)}</span></div>
              <p className="mt-1 text-xs text-white/50">Оплата: {order.payment ? PAYMENT_STATUS_LABELS[order.payment.status] ?? order.payment.status : '—'}</p>
            </section>

            {order.cardMessage && (
              <section className="mb-5 rounded-2xl border border-[#522149] p-4 text-sm">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div>
                    <h3 className="font-serif text-base text-[#FFD7F1]">Листівка</h3>
                    <p className="text-[11px] text-white/45">Формат друку: 15×10 см</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!printGreetingCard(order.orderNumber, order.cardMessage ?? '')) {
                        setMessage({ kind: 'error', text: 'Дозвольте спливаючі вікна для друку листівки.' });
                      }
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#F5B2E2]/40 px-3 py-1.5 text-xs font-medium text-[#F5B2E2] hover:bg-[#F5B2E2]/10"
                  >
                    <Printer className="h-3.5 w-3.5" /> Друкувати
                  </button>
                </div>
                <p className="whitespace-pre-wrap italic text-white/85">{order.cardMessage}</p>
              </section>
            )}

            <section className="mb-5 text-sm">
              <h3 className="mb-2 font-serif text-base text-[#FFD7F1]">Замовник</h3>
              <p>{order.contactName}</p>
              <p className="text-white/70"><a href={`tel:${order.contactPhone}`}>{order.contactPhone}</a> · {order.contactEmail}</p>
              {order.customerNote && <p className="mt-1 text-white/60">{order.customerNote}</p>}
            </section>

            <section className="text-sm">
              <h3 className="mb-2 font-serif text-base text-[#FFD7F1]">Історія</h3>
              <ul className="space-y-1.5">
                {order.statusHistory.map((entry, index) => (
                  <li key={`${entry.changedAt}-${index}`} className="flex flex-wrap justify-between gap-x-4 text-white/80">
                    <span>{ORDER_STATUS_LABELS[entry.status]}{entry.note ? <span className="text-white/45"> — {entry.note}</span> : null}</span>
                    <span className="text-white/50">{formatDateTime(entry.changedAt)}{entry.changedBy ? ` · ${entry.changedBy}` : ''}</span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </aside>
    </div>
  );
};
