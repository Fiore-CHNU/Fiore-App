import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Clock, Copy, CreditCard, Loader2, PackageSearch, ShieldCheck, TimerOff } from 'lucide-react';
import { ApiError, formatSlot, formatUah } from '../../services/http';
import { orderApi, orderSessionStore } from '../../services/orderApi';
import { useCart } from '../../hooks/useCart';
import type { OrderDetails } from '../../types/order';

/** Payment window from US-5.2 (BR-9); the server is the source of truth, this only drives the countdown. */
const PAYMENT_WINDOW_MS = 15 * 60 * 1000;
const STORE_PHONE = '+380 50 123 45 67';

const PageCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <main className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
    <div className="rounded-2xl border border-[#431A3B] bg-[#260E21] p-6 sm:p-8">{children}</div>
  </main>
);

const Spinner: React.FC = () => (
  <main className="flex justify-center px-4 py-24 text-white/60">
    <Loader2 className="h-6 w-6 animate-spin" aria-label="Завантаження" />
  </main>
);

const NotFound: React.FC<{ title?: string }> = ({ title = 'Замовлення не знайдено' }) => (
  <PageCard>
    <PackageSearch className="mb-4 h-10 w-10 text-[#F5B2E2]/70" />
    <h1 className="mb-2 font-serif text-2xl">{title}</h1>
    <p className="mb-6 text-sm text-white/60">
      Перевірте посилання або зверніться до магазину: <a className="text-[#F5B2E2]" href={`tel:${STORE_PHONE.replace(/\s/g, '')}`}>{STORE_PHONE}</a>.
    </p>
    <Link to="/" className="rounded-full bg-[#F5B2E2] px-6 py-2.5 text-sm font-semibold text-[#1E0B1A] hover:bg-[#FDBDE9]">До каталогу</Link>
  </PageCard>
);

const ItemsList: React.FC<{ items: { name: string; quantity: number; lineTotal?: number }[] }> = ({ items }) => (
  <ul className="divide-y divide-[#3A1734] text-sm">
    {items.map((item, index) => (
      <li key={`${item.name}-${index}`} className="flex justify-between gap-3 py-2">
        <span className="text-white">{item.name} <span className="text-white/50">× {item.quantity}</span></span>
        {item.lineTotal !== undefined && <span className="text-[#FFD7F1]">{formatUah(item.lineTotal)}</span>}
      </li>
    ))}
  </ul>
);

/** Loads a guest order using the cart token saved at checkout. */
const useGuestOrder = (orderId: string | undefined) => {
  const session = orderId ? orderSessionStore.read(orderId) : null;
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'error'>(session ? 'loading' : 'missing');

  const reload = useCallback(async () => {
    const stored = orderId ? orderSessionStore.read(orderId) : null;
    if (!orderId || !stored) return null;
    try {
      const result = await orderApi.get(orderId, stored.sessionToken);
      setOrder(result);
      setState('ready');
      return result;
    } catch (error) {
      setState(error instanceof ApiError && (error.status === 404 || error.status === 403) ? 'missing' : 'error');
      return null;
    }
  }, [orderId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { order, state, session, reload };
};

/* ---------- Sandbox payment (US-5.1, sandbox until a provider is chosen) ---------- */

export const PaymentPage: React.FC = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { order, state, session, reload } = useGuestOrder(orderId);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!order) return;
    if (order.status === 'cancelled') navigate(`/order/${order.orderId}/expired`, { replace: true });
    else if (order.status !== 'pendingPayment') navigate(`/order/${order.orderId}/thanks`, { replace: true });
  }, [order, navigate]);

  if (state === 'loading') return <Spinner />;
  if (state === 'missing' || !session) return <NotFound />;
  if (state === 'error' || !order) {
    return (
      <PageCard>
        <p className="mb-4 text-sm text-red-300">Не вдалося завантажити замовлення.</p>
        <button onClick={() => void reload()} className="rounded-full bg-[#F5B2E2] px-5 py-2 text-sm font-semibold text-[#1E0B1A]">Спробувати ще раз</button>
      </PageCard>
    );
  }

  const remainingMs = Math.max(0, new Date(order.createdAt).getTime() + PAYMENT_WINDOW_MS - now);
  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000).toString().padStart(2, '0');

  const pay = async () => {
    setPaying(true);
    setPayError(null);
    try {
      await orderApi.confirmSandboxPayment(order.orderId, session.sessionToken);
      navigate(`/order/${order.orderId}/thanks`, { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.code === 'PaymentWindowExpired') {
        navigate(`/order/${order.orderId}/expired`, { replace: true });
      } else if (error instanceof ApiError && error.code === 'NotPayable') {
        await reload();
      } else {
        setPayError('Оплата не пройшла. Спробуйте ще раз.');
      }
    } finally {
      setPaying(false);
    }
  };

  return (
    <PageCard>
      <p className="mb-1 text-xs uppercase tracking-widest text-[#F5B2E2]/80">Замовлення {order.orderNumber}</p>
      <h1 className="mb-6 font-serif text-2xl sm:text-3xl">Оплата замовлення</h1>

      <div className="mb-6 flex items-center gap-2 rounded-xl bg-[#1E0B1A] px-4 py-3 text-sm">
        <Clock className="h-4 w-4 text-[#F5B2E2]" />
        {remainingMs > 0 ? (
          <span>Час на оплату: <strong className="text-[#F5B2E2]">{minutes}:{seconds}</strong></span>
        ) : (
          <span>Час на оплату минув.</span>
        )}
      </div>

      <ItemsList items={order.items} />
      <dl className="mt-4 space-y-1.5 border-t border-[#431A3B] pt-4 text-sm">
        <div className="flex justify-between text-white/70"><dt>Доставка</dt><dd className="text-white">{order.deliveryFeeAmount === 0 ? 'Безкоштовно' : formatUah(order.deliveryFeeAmount)}</dd></div>
        <div className="flex justify-between text-white/70"><dt>Коли</dt><dd className="text-white">{formatSlot(order.delivery.scheduledFrom, order.delivery.scheduledTo)}</dd></div>
        <div className="flex justify-between pt-2 text-base font-semibold"><dt>До сплати</dt><dd className="text-lg text-[#F5B2E2]">{formatUah(order.totalAmount)}</dd></div>
      </dl>

      {payError && <p role="alert" className="mt-4 text-sm text-red-300">{payError}</p>}

      <button onClick={() => void pay()} disabled={paying}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#F5B2E2] px-4 py-3 text-sm font-semibold text-[#1E0B1A] hover:bg-[#FDBDE9] disabled:opacity-50">
        {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
        Оплатити {formatUah(order.totalAmount)}
      </button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-white/40">
        <ShieldCheck className="h-3.5 w-3.5" /> Тестовий режим: реальні гроші не списуються. Платіжного провайдера буде підключено після рішення команди.
      </p>
    </PageCard>
  );
};

/* ---------- Thank-you page ---------- */

export const OrderThanksPage: React.FC = () => {
  const { orderId } = useParams();
  const { order, state, session } = useGuestOrder(orderId);
  const [copied, setCopied] = useState(false);

  if (state === 'loading') return <Spinner />;
  if (state !== 'ready' || !order || !session) return <NotFound />;

  const trackingUrl = `${window.location.origin}/track/${order.trackingCode}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(trackingUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <PageCard>
      <CheckCircle2 className="mb-4 h-12 w-12 text-[#F5B2E2]" />
      <h1 className="mb-2 font-serif text-2xl sm:text-3xl">Дякуємо за замовлення!</h1>
      <p className="mb-6 text-sm text-white/70">
        Замовлення <strong className="text-white">{order.orderNumber}</strong> оплачено. Ми вже готуємо ваш букет.
      </p>
      <ItemsList items={order.items} />
      <dl className="mt-4 space-y-1.5 border-t border-[#431A3B] pt-4 text-sm">
        <div className="flex justify-between gap-4 text-white/70"><dt>Доставка</dt><dd className="text-right text-white">{formatSlot(order.delivery.scheduledFrom, order.delivery.scheduledTo)}</dd></div>
        <div className="flex justify-between gap-4 text-white/70">
          <dt>Адреса</dt>
          <dd className="text-right text-white">
            {order.delivery.city}, {order.delivery.street}, {order.delivery.building}{order.delivery.apartment ? `, кв. ${order.delivery.apartment}` : ''}
          </dd>
        </div>
        <div className="flex justify-between gap-4 text-white/70"><dt>Сплачено</dt><dd className="text-white">{formatUah(order.totalAmount)}</dd></div>
      </dl>

      <div className="mt-6 rounded-xl bg-[#1E0B1A] p-4">
        <p className="mb-2 text-sm text-white/80">Статус замовлення завжди доступний за посиланням:</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link to={`/track/${order.trackingCode}`} className="flex-1 truncate rounded-lg border border-[#522149] px-3 py-2 text-xs text-[#F5B2E2] hover:border-[#F5B2E2]">
            {trackingUrl}
          </Link>
          <button onClick={() => void copy()} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#522149] px-3 py-2 text-xs hover:border-[#F5B2E2]">
            <Copy className="h-3.5 w-3.5" /> {copied ? 'Скопійовано' : 'Копіювати'}
          </button>
        </div>
      </div>
      <Link to="/" className="mt-6 inline-block text-sm text-white/60 hover:text-[#F5B2E2]">Повернутися до каталогу</Link>
    </PageCard>
  );
};

/* ---------- Payment window expired (US-5.2 scenario 3) ---------- */

export const PaymentExpiredPage: React.FC = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { order, state } = useGuestOrder(orderId);
  const { restoreItems, setIsCartOpen } = useCart();
  const [restoring, setRestoring] = useState(false);

  if (state === 'loading') return <Spinner />;

  const backToCart = async () => {
    setRestoring(true);
    if (order) await restoreItems(order.items.map(item => ({ productId: item.productId, quantity: item.quantity })));
    setRestoring(false);
    navigate('/');
    setIsCartOpen(true);
  };

  return (
    <PageCard>
      <TimerOff className="mb-4 h-10 w-10 text-[#F5B2E2]/80" />
      <h1 className="mb-2 font-serif text-2xl">Час на оплату вичерпано</h1>
      <p className="mb-6 text-sm text-white/65">
        Замовлення {order?.orderNumber ?? ''} не було оплачено протягом 15 хвилин і скасоване, а букети повернулися у вітрину.
        Ви можете оформити замовлення ще раз.
      </p>
      <button onClick={() => void backToCart()} disabled={restoring}
        className="inline-flex items-center gap-2 rounded-full bg-[#F5B2E2] px-6 py-2.5 text-sm font-semibold text-[#1E0B1A] hover:bg-[#FDBDE9] disabled:opacity-50">
        {restoring && <Loader2 className="h-4 w-4 animate-spin" />} Повернутися до кошика
      </button>
    </PageCard>
  );
};

/* ---------- Public status page by tracking code (US-6.2 / EAN-411) ---------- */

export { TrackOrderPage } from './TrackOrderPage';
