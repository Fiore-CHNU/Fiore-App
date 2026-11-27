import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  Loader2,
  Phone,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  TimerOff,
} from 'lucide-react';
import { formatSlot, formatUah } from '../../services/http';
import { orderApi, orderSessionStore } from '../../services/orderApi';
import { useCart } from '../../hooks/useCart';
import type { OrderDetails } from '../../types/order';

const STORE_PHONE = '+380 50 123 45 67';

export const PaymentExpiredPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { restoreItems, setIsCartOpen } = useCart();

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(() => Boolean(orderId && orderSessionStore.read(orderId)));
  const [restoring, setRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  useEffect(() => {
    const stored = orderId ? orderSessionStore.read(orderId) : null;
    if (!orderId || !stored) return;

    let cancelled = false;
    orderApi
      .get(orderId, stored.sessionToken)
      .then(result => {
        if (!cancelled) setOrder(result);
      })
      .catch(() => {
        // Order details are optional on the expired page; fallback UI still works cleanly.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const handleRestoreCart = async () => {
    setRestoring(true);
    setRestoreError(null);
    try {
      if (order && order.items.length > 0) {
        await restoreItems(
          order.items.map(item => ({ productId: item.productId, quantity: item.quantity }))
        );
      }
      navigate('/');
      setIsCartOpen(true);
    } catch {
      setRestoreError('Не вдалося автоматично відновити кошик. Ви можете обрати букети у каталозі.');
    } finally {
      setRestoring(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-24 text-white/60">
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-[#F5B2E2]" />
        <p className="text-sm">Завантаження деталей замовлення…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 hover:text-[#F5B2E2] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>До каталогу</span>
      </Link>

      <div className="overflow-hidden rounded-3xl border border-[#431A3B] bg-[#260E21] shadow-2xl">
        {/* Top Hero Header */}
        <div className="border-b border-[#431A3B] bg-gradient-to-br from-[#2E1029] via-[#260E21] to-[#1E0B1A] p-6 sm:p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-400/10 text-amber-300 shadow-[0_0_25px_rgba(251,191,36,0.12)]">
            <TimerOff className="h-8 w-8" />
          </div>

          {order?.orderNumber && (
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-[#F5B2E2]/80">
              Замовлення {order.orderNumber}
            </p>
          )}

          <h1 className="mb-3 font-serif text-2xl sm:text-3xl text-white">
            Час на оплату вичерпано
          </h1>

          <p className="mx-auto max-w-md text-sm leading-relaxed text-white/65">
            Ми резервуємо букети та інтервал доставки на <strong className="text-white/90">15 хвилин</strong>.
            Оскільки оплату не було завершено вчасно, замовлення автоматично скасовано, а букети повернулися у вітрину.
          </p>

          {/* Trust badge */}
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#A6E3A1]/30 bg-[#A6E3A1]/10 px-4 py-1.5 text-xs font-medium text-[#A6E3A1]">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>Кошти з вашої картки не списано</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Saved items recap (if available) */}
          {order && order.items.length > 0 && (
            <div className="rounded-2xl border border-[#431A3B] bg-[#1E0B1A]/60 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#F5B2E2]">
                  <ShoppingBag className="h-4 w-4" />
                  <span>Букети з цього замовлення</span>
                </h2>
                <span className="text-sm font-bold text-white">{formatUah(order.totalAmount)}</span>
              </div>

              <ul className="divide-y divide-[#3A1734] text-sm">
                {order.items.map(item => (
                  <li key={item.productId} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                    <span className="truncate text-white/90">
                      {item.name} <span className="text-white/45">× {item.quantity}</span>
                    </span>
                    <span className="shrink-0 font-medium text-[#FFD7F1]">{formatUah(item.lineTotal)}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2 border-t border-[#3A1734] pt-3 text-xs text-white/55">
                <CalendarClock className="h-4 w-4 shrink-0 text-[#F5B2E2]/70" />
                <span>
                  Обраний раніше слот: {formatSlot(order.delivery.scheduledFrom, order.delivery.scheduledTo)} (актуальність перевіриться при новому оформленні)
                </span>
              </div>
            </div>
          )}

          {restoreError && (
            <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-xs text-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{restoreError}</span>
            </div>
          )}

          {/* Primary & Secondary Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => void handleRestoreCart()}
              disabled={restoring}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#F5B2E2] px-6 py-3 text-sm font-semibold text-[#1E0B1A] shadow-md transition-all hover:bg-[#FDBDE9] active:scale-[0.98] disabled:opacity-50"
            >
              {restoring ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              <span>{order ? 'Відновити кошик і оформити ще раз' : 'Повернутися до кошика'}</span>
            </button>

            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full border border-[#522149] bg-[#1E0B1A] px-6 py-3 text-sm font-medium text-white/85 hover:border-[#F5B2E2]/60 hover:text-white transition-colors"
            >
              До каталогу
            </Link>
          </div>

          {/* Support footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 rounded-2xl border border-[#522149]/40 bg-[#1E0B1A]/40 px-4 py-3 text-xs text-white/55">
            <span>Виникли труднощі з оплатою? Ми допоможемо оформити замовлення.</span>
            <a
              href={`tel:${STORE_PHONE.replace(/\s/g, '')}`}
              className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-[#F5B2E2] hover:text-[#FDBDE9]"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>{STORE_PHONE}</span>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
};
