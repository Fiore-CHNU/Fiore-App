import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  ExternalLink,
  Loader2,
  PackageSearch,
  Phone,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { ApiError, formatSlot, formatUah } from '../../services/http';
import { orderApi, orderSessionStore } from '../../services/orderApi';
import { ORDER_STATUS_LABELS, type OrderDetails, type StoredOrderSession } from '../../types/order';

const STORE_PHONE = '+380 50 123 45 67';
const POLL_INTERVAL_MS = 3_000;
const MAX_POLL_ATTEMPTS = 20;

type LoadState = 'loading' | 'ready' | 'missing' | 'error';

export const OrderThanksPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [session] = useState<StoredOrderSession | null>(() =>
    orderId ? orderSessionStore.read(orderId) : null
  );
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [state, setState] = useState<LoadState>(() => (orderId && session ? 'loading' : 'missing'));
  const [pollAttempts, setPollAttempts] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchOrder = useCallback(
    async (manual = false) => {
      if (!orderId || !session) return;
      if (manual) setIsChecking(true);
      try {
        const result = await orderApi.get(orderId, session.sessionToken);
        setOrder(result);
        setState('ready');
      } catch (error) {
        if (error instanceof ApiError && (error.status === 404 || error.status === 403)) {
          setState('missing');
        } else {
          setState('error');
        }
      } finally {
        if (manual) setIsChecking(false);
      }
    },
    [orderId, session]
  );

  // Initial load on mount / F5 refresh
  useEffect(() => {
    if (!orderId || !session) return;
    let cancelled = false;

    orderApi
      .get(orderId, session.sessionToken)
      .then(result => {
        if (!cancelled) {
          setOrder(result);
          setState('ready');
        }
      })
      .catch(error => {
        if (!cancelled) {
          setState(
            error instanceof ApiError && (error.status === 404 || error.status === 403)
              ? 'missing'
              : 'error'
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [orderId, session]);

  // Redirect automatically if order expired/cancelled while waiting or after refresh
  useEffect(() => {
    if (order?.status === 'cancelled') {
      navigate(`/order/${order.orderId}/expired`, { replace: true });
    }
  }, [order, navigate]);

  // Poll server if payment confirmation is still pending (e.g. returning from payment gateway / F5)
  useEffect(() => {
    if (order?.status !== 'pendingPayment' || pollAttempts >= MAX_POLL_ATTEMPTS) {
      return;
    }

    const timer = window.setTimeout(() => {
      setPollAttempts(count => count + 1);
      void fetchOrder();
    }, POLL_INTERVAL_MS);

    return () => window.clearTimeout(timer);
  }, [order?.status, pollAttempts, fetchOrder]);

  if (state === 'loading') {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-24 text-white/60">
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-[#F5B2E2]" />
        <p className="text-sm">Відновлюємо інформацію про замовлення…</p>
      </main>
    );
  }

  if (state === 'missing' || !session) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center sm:py-24">
        <div className="rounded-3xl border border-[#431A3B] bg-[#260E21] p-8 shadow-2xl">
          <PackageSearch className="mx-auto mb-4 h-12 w-12 text-[#F5B2E2]/70" />
          <h1 className="mb-2 font-serif text-2xl text-white">Замовлення не знайдено</h1>
          <p className="mb-6 text-sm text-white/60">
            Перевірте посилання з листа підтвердження або зверніться до магазину:{' '}
            <a className="text-[#F5B2E2] hover:underline" href={`tel:${STORE_PHONE.replace(/\s/g, '')}`}>
              {STORE_PHONE}
            </a>
            .
          </p>
          <Link
            to="/"
            className="inline-block rounded-full bg-[#F5B2E2] px-6 py-2.5 text-sm font-semibold text-[#1E0B1A] hover:bg-[#FDBDE9] transition-colors"
          >
            До каталогу
          </Link>
        </div>
      </main>
    );
  }

  // Resilient network-error fallback: preserves session info & tracking link on F5 offline/timeout
  if (state === 'error' || !order) {
    return (
      <main className="mx-auto max-w-xl px-4 py-14 sm:py-20">
        <div className="rounded-3xl border border-[#431A3B] bg-[#260E21] p-7 sm:p-8 shadow-2xl">
          <div className="mb-4 flex items-center gap-3 text-amber-300">
            <AlertCircle className="h-7 w-7 shrink-0" />
            <h1 className="font-serif text-2xl text-white">Тимчасова помилка з’єднання</h1>
          </div>
          <p className="mb-5 text-sm text-white/70 leading-relaxed">
            Не вдалося оновити статус замовлення <strong className="text-white">{session.orderNumber}</strong>.
            Не хвилюйтеся — якщо оплата вже пройшла, ваше замовлення збережено і повторне списання не відбудеться.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              disabled={isChecking}
              onClick={() => void fetchOrder(true)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#F5B2E2] px-5 py-2.5 text-sm font-semibold text-[#1E0B1A] hover:bg-[#FDBDE9] disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
              <span>Спробувати ще раз</span>
            </button>
            <Link
              to={`/track/${session.trackingCode}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#522149] bg-[#1E0B1A] px-5 py-2.5 text-sm font-medium text-white/85 hover:border-[#F5B2E2]/60"
            >
              <ExternalLink className="h-4 w-4 text-[#F5B2E2]" />
              <span>Перевірити статус</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Waiting for payment webhook confirmation (NFR-04.2)
  if (order.status === 'pendingPayment') {
    const pollingTimedOut = pollAttempts >= MAX_POLL_ATTEMPTS;

    return (
      <main className="mx-auto max-w-xl px-4 py-14 sm:py-20">
        <div className="rounded-3xl border border-[#431A3B] bg-[#260E21] p-7 sm:p-8 text-center shadow-2xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#F5B2E2]/30 bg-[#F5B2E2]/10 text-[#F5B2E2]">
            {pollingTimedOut ? <Clock className="h-8 w-8" /> : <Loader2 className="h-8 w-8 animate-spin" />}
          </div>
          <p className="mb-1 font-mono text-xs uppercase tracking-widest text-[#F5B2E2]/80">
            Замовлення {order.orderNumber}
          </p>
          <h1 className="mb-3 font-serif text-2xl sm:text-3xl text-white">
            {pollingTimedOut ? 'Очікуємо підтвердження оплати' : 'Перевіряємо оплату…'}
          </h1>
          <p className="mb-6 text-sm text-white/65 leading-relaxed">
            {pollingTimedOut
              ? 'Платіжна система ще не надіслала підтвердження. Якщо ви ще не завершили оплату, поверніться на сторінку оплати або перевірте статус повторно.'
              : 'Ми автоматично перевіряємо статус вашого платежу. Сторінка оновиться самостійно, щойно банк підтвердить операцію.'}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              type="button"
              disabled={isChecking}
              onClick={() => {
                setPollAttempts(0);
                void fetchOrder(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#F5B2E2] px-6 py-2.5 text-sm font-semibold text-[#1E0B1A] hover:bg-[#FDBDE9] disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
              <span>Оновити статус</span>
            </button>
            <Link
              to={`/order/${order.orderId}/payment`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#522149] bg-[#1E0B1A] px-5 py-2.5 text-sm font-medium text-white/85 hover:border-[#F5B2E2]/60"
            >
              <CreditCard className="h-4 w-4 text-[#F5B2E2]" />
              <span>До оплати</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const trackingUrl = `${window.location.origin}/track/${order.trackingCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(trackingUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="overflow-hidden rounded-3xl border border-[#431A3B] bg-[#260E21] shadow-2xl">
        {/* Success Header */}
        <div className="border-b border-[#431A3B] bg-gradient-to-br from-[#2E1029] via-[#260E21] to-[#1E0B1A] p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CheckCircle2 className="mb-3 h-11 w-11 text-[#F5B2E2]" />
              <h1 className="mb-2 font-serif text-2xl sm:text-3xl text-white">
                Дякуємо за замовлення!
              </h1>
              <p className="text-sm text-white/70">
                Замовлення <strong className="font-mono text-white">{order.orderNumber}</strong> успішно оплачено. Ми вже передали його флористам.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#A6E3A1]/35 bg-[#A6E3A1]/15 px-3.5 py-1 text-xs font-semibold text-[#A6E3A1]">
              <span className="h-2 w-2 rounded-full bg-current" />
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>

          <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-white/50">
            <ShieldCheck className="h-3.5 w-3.5 text-[#F5B2E2]/80" />
            <span>Сторінку можна безпечно оновлювати — повторне замовлення або списання не відбудеться.</span>
          </div>
        </div>

        {/* Details Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <ul className="divide-y divide-[#3A1734] text-sm">
            {order.items.map(item => (
              <li key={item.productId} className="flex justify-between gap-3 py-2.5 first:pt-0">
                <span className="text-white">
                  {item.name} <span className="text-white/50">× {item.quantity}</span>
                </span>
                <span className="font-medium text-[#FFD7F1]">{formatUah(item.lineTotal)}</span>
              </li>
            ))}
          </ul>

          <dl className="space-y-2 border-t border-[#431A3B] pt-4 text-sm">
            <div className="flex justify-between gap-4 text-white/70">
              <dt>Доставка</dt>
              <dd className="text-right text-white">
                {formatSlot(order.delivery.scheduledFrom, order.delivery.scheduledTo)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 text-white/70">
              <dt>Адреса</dt>
              <dd className="text-right text-white">
                {order.delivery.city}, {order.delivery.street}, {order.delivery.building}
                {order.delivery.apartment ? `, кв. ${order.delivery.apartment}` : ''}
              </dd>
            </div>
            <div className="flex justify-between gap-4 pt-1 text-base font-semibold">
              <dt className="text-white/85">Сплачено</dt>
              <dd className="text-[#F5B2E2]">{formatUah(order.totalAmount)}</dd>
            </div>
          </dl>

          {/* Tracking Link Card */}
          <div className="rounded-2xl border border-[#431A3B] bg-[#1E0B1A] p-4 space-y-3">
            <p className="text-sm text-white/85 font-medium">
              Статус замовлення завжди доступний за посиланням:
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                to={`/track/${order.trackingCode}`}
                className="flex-1 truncate rounded-xl border border-[#522149] px-3 py-2 text-xs text-[#F5B2E2] hover:border-[#F5B2E2] transition-colors"
              >
                {trackingUrl}
              </Link>
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#522149] px-3.5 py-2 text-xs font-medium text-white hover:border-[#F5B2E2] transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#A6E3A1]" />
                    <span className="text-[#A6E3A1]">Скопійовано</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-[#F5B2E2]" />
                    <span>Копіювати</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <Link
              to={`/track/${order.trackingCode}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#F5B2E2] px-6 py-2.5 text-sm font-semibold text-[#1E0B1A] hover:bg-[#FDBDE9] transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Відстежити замовлення</span>
            </Link>

            <Link
              to="/"
              className="text-sm text-white/65 hover:text-[#F5B2E2] transition-colors"
            >
              Повернутися до каталогу
            </Link>
          </div>

          <div className="flex items-center justify-between border-t border-[#3A1734] pt-4 text-xs text-white/45">
            <span>Питання щодо замовлення?</span>
            <a
              href={`tel:${STORE_PHONE.replace(/\s/g, '')}`}
              className="inline-flex items-center gap-1.5 text-[#F5B2E2] hover:underline"
            >
              <Phone className="h-3.5 w-3.5" />
              {STORE_PHONE}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
};
