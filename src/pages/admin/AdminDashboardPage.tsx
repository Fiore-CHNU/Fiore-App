import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, BellOff, ClipboardList, Flower2, Loader2, LogOut, RefreshCw, Shield, Store, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ApiError, formatDateTime, formatSlot, formatUah } from '../../services/http';
import { adminApi, type AdminOrderListItem, type AdminProduct } from '../../services/adminApi';
import { ORDER_STATUS_LABELS, type OrderStatus } from '../../types/order';
import { STAFF_ROLE_LABELS } from '../../types/auth';
import { OrderCardDrawer } from './OrderCardDrawer';

/** US-9.1: new paid orders appear within 30 seconds. */
const POLL_INTERVAL_MS = 30_000;

const STATUS_FILTERS: { value: OrderStatus | ''; label: string }[] = [
  { value: '', label: 'Усі, крім неоплачених' },
  { value: 'paid', label: ORDER_STATUS_LABELS.paid },
  { value: 'accepted', label: ORDER_STATUS_LABELS.accepted },
  { value: 'assembling', label: ORDER_STATUS_LABELS.assembling },
  { value: 'readyForDelivery', label: ORDER_STATUS_LABELS.readyForDelivery },
  { value: 'outForDelivery', label: ORDER_STATUS_LABELS.outForDelivery },
  { value: 'delivered', label: ORDER_STATUS_LABELS.delivered },
  { value: 'cancelled', label: ORDER_STATUS_LABELS.cancelled },
  { value: 'pendingPayment', label: ORDER_STATUS_LABELS.pendingPayment },
];

const STATUS_BADGE: Partial<Record<OrderStatus, string>> = {
  paid: 'bg-[#F5B2E2] text-[#1E0B1A]',
  cancelled: 'bg-red-500/15 text-red-200',
  delivered: 'bg-emerald-500/15 text-emerald-200',
};

/** Short tone for a new order; browsers allow audio only after the user enabled it with a click. */
const playChime = (context: AudioContext) => {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.frequency.value = 880;
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.2, context.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.6);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.6);
};

export const AdminDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'orders' | 'catalog'>('orders');

  const handleSignOut = useCallback(() => {
    // US-7.1 scenario 4: sign out and return to the login page.
    logout();
    navigate('/admin/login', { replace: true });
  }, [logout, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#180816] text-white flex flex-col">
      <header className="bg-[#240D20] border-b border-[#431A3C] sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="font-serif text-2xl font-bold tracking-widest text-[#F5B2E2]">FIORE</Link>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#3D1735] border border-[#5A2250] text-[11px] font-semibold text-[#FFD7F1] uppercase tracking-wider">
              <Shield className="w-3 h-3 text-[#F5B2E2]" /> Панель персоналу
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-[#1B0918] border border-[#3E1638] px-3 py-1.5 rounded-full">
              <User className="w-4 h-4 text-[#F5B2E2]" />
              <span className="text-xs">{user.email}</span>
              <span className="text-[10px] text-[#F5B2E2]">{STAFF_ROLE_LABELS[user.role]}</span>
            </div>
            <Link to="/" className="hidden sm:flex items-center gap-1.5 p-2 text-xs text-white/70 hover:text-white"><Store className="w-4 h-4" /> Магазин</Link>
            <button onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#3B1533] hover:bg-red-950/80 hover:text-red-300 border border-[#521E47] text-xs font-semibold">
              <LogOut className="w-3.5 h-3.5" /> Вийти
            </button>
          </div>
        </div>
        <nav className="max-w-7xl mx-auto px-4 sm:px-8 flex gap-1" aria-label="Розділи">
          {([['orders', 'Замовлення', ClipboardList], ['catalog', 'Каталог', Flower2]] as const).map(([value, label, Icon]) => (
            <button key={value} onClick={() => setTab(value)} aria-current={tab === value ? 'page' : undefined}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 transition-colors ${tab === value ? 'border-[#F5B2E2] text-[#F5B2E2]' : 'border-transparent text-white/60 hover:text-white'}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8">
        {tab === 'orders'
          ? <OrdersPanel token={user.token} onUnauthorized={handleSignOut} />
          : <CatalogPanel token={user.token} onUnauthorized={handleSignOut} />}
      </main>
    </div>
  );
};

/* ---------- Order queue (US-9.1) ---------- */

const OrdersPanel: React.FC<{ token: string; onUnauthorized: () => void }> = ({ token, onUnauthorized }) => {
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const knownIds = useRef<Set<string> | null>(null);
  const audio = useRef<AudioContext | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await adminApi.listOrders(token, { status, deliveryDate: deliveryDate || undefined });
      const previous = knownIds.current;
      const fresh = previous ? result.filter(order => !previous.has(order.id) && order.status === 'paid').map(order => order.id) : [];
      knownIds.current = new Set(result.map(order => order.id));
      if (fresh.length > 0) {
        setHighlighted(current => new Set([...current, ...fresh]));
        if (audio.current) playChime(audio.current);
      }
      setOrders(result);
      setUpdatedAt(new Date());
      setError(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) onUnauthorized();
      else setError('Не вдалося завантажити замовлення. Спробуємо ще раз за 30 секунд.');
    } finally {
      setLoading(false);
    }
  }, [token, status, deliveryDate, onUnauthorized]);

  // A new filter starts a new baseline, so existing orders are not flagged as new.
  useEffect(() => {
    knownIds.current = null;
    setHighlighted(new Set());
    setLoading(true);
    void load();
    const timer = window.setInterval(() => void load(), POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  const toggleSound = () => {
    if (soundOn) {
      setSoundOn(false);
      void audio.current?.close();
      audio.current = null;
      return;
    }
    audio.current = new AudioContext();
    playChime(audio.current);
    setSoundOn(true);
  };

  const openOrder = (id: string) => {
    setOpenOrderId(id);
    setHighlighted(current => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
  };

  return (
    <section>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl">Черга замовлень</h1>
          <p className="mt-1 text-xs text-white/50">
            {updatedAt ? `Оновлено о ${updatedAt.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} · автооновлення кожні 30 с` : 'Завантаження…'}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-xs text-white/60">
            Статус
            <select value={status} onChange={event => setStatus(event.target.value as OrderStatus | '')}
              className="rounded-xl border border-[#522149] bg-[#1B0918] px-3 py-2 text-sm text-white outline-none focus:border-[#F5B2E2]">
              {STATUS_FILTERS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-white/60">
            Дата доставки
            <input type="date" value={deliveryDate} onChange={event => setDeliveryDate(event.target.value)}
              className="rounded-xl border border-[#522149] bg-[#1B0918] px-3 py-2 text-sm text-white outline-none focus:border-[#F5B2E2]" />
          </label>
          <button onClick={() => void load()} className="rounded-xl border border-[#522149] p-2.5 text-white/70 hover:text-white" aria-label="Оновити">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button onClick={toggleSound} aria-pressed={soundOn}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm ${soundOn ? 'border-[#F5B2E2] text-[#F5B2E2]' : 'border-[#522149] text-white/70'}`}>
            {soundOn ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />} Звук
          </button>
        </div>
      </div>

      {error && <p role="alert" className="mb-4 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}

      {loading && orders.length === 0 ? (
        <div className="flex justify-center py-16 text-white/60"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : orders.length === 0 ? (
        <p className="rounded-2xl border border-[#481A3F] bg-[#240D20] p-8 text-center text-sm text-white/60">Замовлень за цими умовами немає.</p>
      ) : (
        <ul className="space-y-2.5">
          {orders.map(order => {
            const isNew = highlighted.has(order.id);
            return (
              <li key={order.id}>
                <button onClick={() => openOrder(order.id)}
                  className={`grid w-full grid-cols-2 gap-x-4 gap-y-1 rounded-2xl border p-4 text-left text-sm transition-colors hover:border-[#F5B2E2]/60 md:grid-cols-[120px_1fr_1.2fr_110px_150px] md:items-center ${
                    isNew ? 'border-[#F5B2E2] bg-[#3D1735]' : 'border-[#481A3F] bg-[#240D20]'
                  }`}>
                  <span className="whitespace-nowrap font-semibold text-white">
                    {order.orderNumber}
                    {isNew && <span className="ml-2 rounded-full bg-[#F5B2E2] px-1.5 py-0.5 text-[10px] font-bold text-[#1E0B1A]">NEW</span>}
                  </span>
                  <span className="text-right text-white/70 md:text-left">{order.delivery.recipientName}</span>
                  <span className="text-white/80">{formatSlot(order.delivery.scheduledFrom, order.delivery.scheduledTo)}</span>
                  <span className="text-right font-semibold text-[#FFD7F1] md:text-left">{formatUah(order.totalAmount)}</span>
                  <span className="col-span-2 md:col-span-1 md:text-right">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs ${STATUS_BADGE[order.status] ?? 'bg-[#3D1735] text-[#FFD7F1]'}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                    <span className="ml-2 text-[11px] text-white/40 md:block md:ml-0 md:mt-1">{formatDateTime(order.createdAt)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {openOrderId && (
        <OrderCardDrawer orderId={openOrderId} token={token} onClose={() => setOpenOrderId(null)}
          onChanged={() => void load()} onUnauthorized={onUnauthorized} />
      )}
    </section>
  );
};

/* ---------- One-click availability (US-8.3) ---------- */

const PRODUCT_STATUS_LABELS: Record<AdminProduct['status'], string> = {
  available: 'На вітрині',
  hidden: 'Прихований',
  discontinued: 'Знято з продажу',
};

const CatalogPanel: React.FC<{ token: string; onUnauthorized: () => void }> = ({ token, onUnauthorized }) => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      adminApi.listProducts(token, search.trim() || undefined)
        .then(result => { if (!cancelled) setProducts(result); })
        .catch(error => {
          if (cancelled) return;
          if (error instanceof ApiError && error.status === 401) onUnauthorized();
          else setMessage('Не вдалося завантажити товари.');
        })
        .finally(() => { if (!cancelled) setLoading(false); });
    }, 250);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [token, search, onUnauthorized]);

  const toggle = async (product: AdminProduct) => {
    setPending(product.id);
    setMessage(null);
    try {
      const result = await adminApi.setAvailability(token, product.id, product.isTemporarilyUnavailable);
      setProducts(current => current.map(item => (item.id === product.id
        ? { ...item, isTemporarilyUnavailable: result.isTemporarilyUnavailable, isAvailable: result.isAvailable, quantityAvailable: result.quantityAvailable }
        : item)));
      if (!result.isTemporarilyUnavailable && !result.isAvailable) {
        setMessage(`«${product.name}» увімкнено, але покупці його не побачать у продажу: ${product.status !== 'available' ? 'товар прихований' : 'залишок 0'}.`);
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) onUnauthorized();
      else setMessage('Не вдалося змінити наявність.');
    } finally {
      setPending(null);
    }
  };

  return (
    <section>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mb-1 font-serif text-2xl sm:text-3xl">Наявність букетів</h1>
          <p className="text-xs text-white/50">Перемикач «Немає в наявності» одразу ховає кнопку «Додати в кошик» на сайті; букет лишається у вітрині з міткою.</p>
        </div>
        <input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Пошук за назвою або SKU"
          aria-label="Пошук товарів"
          className="w-full rounded-xl border border-[#522149] bg-[#1B0918] px-3 py-2 text-sm text-white outline-none focus:border-[#F5B2E2] sm:w-64" />
      </div>
      {message && <p role="status" className="mb-4 rounded-xl bg-amber-400/10 px-3 py-2 text-sm text-amber-100">{message}</p>}
      {loading ? (
        <div className="flex justify-center py-16 text-white/60"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : products.length === 0 ? (
        <p className="rounded-2xl border border-[#481A3F] bg-[#240D20] p-8 text-center text-sm text-white/60">Товарів не знайдено.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map(product => {
            const switchedOn = !product.isTemporarilyUnavailable;
            return (
              <li key={product.id} className={`flex items-center gap-3 rounded-2xl border p-3 ${product.status === 'available' ? 'border-[#481A3F] bg-[#240D20]' : 'border-dashed border-[#481A3F] bg-[#1B0918]'}`}>
                {product.imageUrl
                  ? <img src={product.imageUrl} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                  : <div className="h-14 w-14 shrink-0 rounded-xl bg-[#1B0918]" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-white/50">{product.sku} · {formatUah(product.price)} · залишок {product.quantityAvailable}</p>
                  <p className={`text-[11px] ${product.isAvailable ? 'text-emerald-300' : 'text-white/45'}`}>
                    {product.status !== 'available' ? PRODUCT_STATUS_LABELS[product.status] : product.isAvailable ? 'Продається' : switchedOn ? 'Залишок 0' : 'Немає в наявності'}
                  </p>
                </div>
                <label className="flex cursor-pointer flex-col items-center gap-1 text-[10px] text-white/60">
                  <input type="checkbox" role="switch" className="peer sr-only" checked={switchedOn} disabled={pending === product.id}
                    onChange={() => void toggle(product)} aria-label={`${product.name}: ${switchedOn ? 'в наявності' : 'немає в наявності'}`} />
                  <span className="relative h-6 w-11 rounded-full bg-[#4E1E45] transition-colors peer-checked:bg-emerald-500 peer-disabled:opacity-50 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
                  {switchedOn ? 'Є' : 'Немає'}
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
