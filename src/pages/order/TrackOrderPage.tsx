import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  Check,
  CheckCircle2,
  Copy,
  Flower2,
  Gift,
  Loader2,
  PackageSearch,
  Phone,
  RefreshCw,
  Share2,
  Sparkles,
  Truck,
} from 'lucide-react';
import { ApiError, formatDateTime, formatSlot, formatUah } from '../../services/http';
import { orderApi } from '../../services/orderApi';
import { ORDER_STATUS_LABELS, type OrderStatus, type TrackedOrder } from '../../types/order';

const STORE_PHONE = '+380 50 123 45 67';
const POLL_INTERVAL_MS = 20_000;

interface StepInfo {
  id: number;
  label: string;
  subLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STEPS: StepInfo[] = [
  {
    id: 0,
    label: 'Підтверджено',
    subLabel: 'Оплачено, передано в роботу',
    icon: CheckCircle2,
  },
  {
    id: 1,
    label: 'Складання',
    subLabel: 'Флорист формує композицію',
    icon: Sparkles,
  },
  {
    id: 2,
    label: 'В дорозі',
    subLabel: 'Кур’єр вирушив за адресою',
    icon: Truck,
  },
  {
    id: 3,
    label: 'Вручено',
    subLabel: 'Замовлення успішно доставлено',
    icon: Gift,
  },
];

const getStepIndex = (status: OrderStatus): number => {
  switch (status) {
    case 'paid':
    case 'accepted':
      return 0;
    case 'assembling':
    case 'readyForDelivery':
      return 1;
    case 'outForDelivery':
      return 2;
    case 'delivered':
      return 3;
    default:
      return -1;
  }
};

const getStatusBadgeClass = (status: OrderStatus): string => {
  switch (status) {
    case 'delivered':
      return 'border-[#A6E3A1]/40 bg-[#A6E3A1]/15 text-[#A6E3A1]';
    case 'outForDelivery':
      return 'border-amber-400/40 bg-amber-400/15 text-amber-300';
    case 'assembling':
    case 'readyForDelivery':
      return 'border-[#F5B2E2]/40 bg-[#F5B2E2]/15 text-[#F5B2E2]';
    case 'paid':
    case 'accepted':
      return 'border-blue-400/40 bg-blue-400/15 text-blue-300';
    case 'cancelled':
      return 'border-red-400/40 bg-red-400/15 text-red-300';
    default:
      return 'border-white/20 bg-white/10 text-white/70';
  }
};

export const TrackOrderPage: React.FC = () => {
  const { trackingCode } = useParams<{ trackingCode: string }>();
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(() => new Date());

  const fetchOrder = useCallback(
    async (isManualRefresh = false) => {
      if (!trackingCode) {
        setState('missing');
        return;
      }

      if (isManualRefresh) setIsRefreshing(true);

      try {
        const data = await orderApi.track(trackingCode);
        setOrder(data);
        setState('ready');
        setLastUpdated(new Date());
      } catch (error) {
        if (!order) {
          setState(error instanceof ApiError && error.status === 404 ? 'missing' : 'error');
        }
      } finally {
        if (isManualRefresh) setIsRefreshing(false);
      }
    },
    [trackingCode, order]
  );

  useEffect(() => {
    void fetchOrder();
  }, [fetchOrder]);

  // Live auto-polling every 20s if order is active
  useEffect(() => {
    if (!order || order.status === 'delivered' || order.status === 'cancelled') {
      return;
    }

    const interval = window.setInterval(() => {
      void fetchOrder();
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [order, fetchOrder]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleCopyNumber = async () => {
    if (!order) return;
    try {
      await navigator.clipboard.writeText(order.orderNumber);
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2000);
    } catch {
      // ignore
    }
  };

  if (state === 'loading') {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-24 text-white/60">
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-[#F5B2E2]" />
        <p className="text-sm font-medium">Завантаження інформації про замовлення…</p>
      </main>
    );
  }

  if (state === 'missing' || !order) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center sm:py-24">
        <div className="rounded-3xl border border-[#431A3B] bg-[#260E21] p-8 shadow-2xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#522149] bg-[#1E0B1A] text-[#F5B2E2]">
            <PackageSearch className="h-8 w-8" />
          </div>
          <h1 className="mb-3 font-serif text-2xl text-white sm:text-3xl">Замовлення не знайдено</h1>
          <p className="mb-6 text-sm text-white/60 leading-relaxed">
            Перевірте правильність посилання для відстеження або зверніться до нашої служби підтримки.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="w-full sm:w-auto rounded-full bg-[#F5B2E2] px-6 py-2.5 text-sm font-semibold text-[#1E0B1A] hover:bg-[#FDBDE9] transition-colors"
            >
              До каталогу
            </Link>
            <a
              href={`tel:${STORE_PHONE.replace(/\s/g, '')}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-[#522149] bg-[#1E0B1A] px-5 py-2.5 text-sm text-white/80 hover:text-white hover:border-[#F5B2E2]/60 transition-colors"
            >
              <Phone className="h-4 w-4 text-[#F5B2E2]" />
              {STORE_PHONE}
            </a>
          </div>
        </div>
      </main>
    );
  }

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
      {/* Back button & quick actions */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-[#F5B2E2] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>До каталогу</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Manual Refresh Button */}
          <button
            type="button"
            onClick={() => void fetchOrder(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#522149] bg-[#260E21] px-3 py-1.5 text-xs font-medium text-white/80 hover:border-[#F5B2E2]/60 hover:text-white transition-colors"
            title="Оновити статус"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#F5B2E2] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Оновити</span>
          </button>

          {/* Share / Copy Tracking Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#522149] bg-[#260E21] px-3 py-1.5 text-xs font-medium text-white/80 hover:border-[#F5B2E2]/60 hover:text-white transition-colors"
          >
            {copiedLink ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#A6E3A1]" />
                <span className="text-[#A6E3A1]">Скопійовано!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-[#F5B2E2]" />
                <span>Поділитися</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Order Status Card */}
      <div className="overflow-hidden rounded-3xl border border-[#431A3B] bg-[#260E21] shadow-2xl">
        {/* Header Banner */}
        <div className="border-b border-[#431A3B] bg-gradient-to-r from-[#2B1127] to-[#1E0B1A] p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs uppercase tracking-wider text-white/50">
                  Замовлення
                </span>
                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className="group inline-flex items-center gap-1 font-mono text-sm font-semibold text-white hover:text-[#F5B2E2] transition-colors"
                  title="Натисніть, щоб скопіювати номер"
                >
                  <span>{order.orderNumber}</span>
                  {copiedNumber ? (
                    <Check className="h-3.5 w-3.5 text-[#A6E3A1]" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-white/30 group-hover:text-[#F5B2E2]" />
                  )}
                </button>
              </div>

              <h1 className="mt-2 font-serif text-2xl sm:text-3xl text-white">
                {ORDER_STATUS_LABELS[order.status]}
              </h1>
            </div>

            <div className="flex flex-col sm:items-end gap-1">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-semibold ${getStatusBadgeClass(
                  order.status
                )}`}
              >
                {!isCancelled && <span className="h-2 w-2 rounded-full bg-current animate-pulse" />}
                {ORDER_STATUS_LABELS[order.status]}
              </span>
              <span className="text-[11px] text-white/40">
                Оновлено {lastUpdated.toLocaleTimeString('uk-UA', { timeZone: 'Europe/Kyiv', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* Visual Progress Stepper (if not cancelled) */}
          {!isCancelled ? (
            <div>
              <div className="relative mb-2">
                {/* Horizontal Progress Bar */}
                <div className="absolute top-5 left-6 right-6 hidden h-0.5 bg-[#431A3B] sm:block">
                  <div
                    className="h-full bg-gradient-to-r from-[#F5B2E2] to-[#FDBDE9] transition-all duration-700"
                    style={{
                      width: `${(Math.max(0, currentStep) / (STEPS.length - 1)) * 100}%`,
                    }}
                  />
                </div>

                {/* Steps */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-2">
                  {STEPS.map(step => {
                    const isCompleted = currentStep > step.id;
                    const isCurrent = currentStep === step.id;
                    const Icon = step.icon;

                    return (
                      <div
                        key={step.id}
                        className={`relative z-10 flex flex-col items-center text-center ${
                          isCurrent
                            ? 'text-white'
                            : isCompleted
                            ? 'text-white/90'
                            : 'text-white/40'
                        }`}
                      >
                        <div
                          className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border transition-all ${
                            isCompleted
                              ? 'border-[#F5B2E2] bg-[#F5B2E2] text-[#1E0B1A] shadow-[0_0_15px_rgba(245,178,226,0.3)]'
                              : isCurrent
                              ? 'border-[#F5B2E2] bg-[#2B1127] text-[#F5B2E2] ring-4 ring-[#F5B2E2]/20 animate-pulse'
                              : 'border-[#431A3B] bg-[#1E0B1A] text-white/30'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        <span className="text-xs font-semibold tracking-wide">
                          {step.label}
                        </span>
                        <span className="mt-0.5 text-[11px] leading-tight text-white/50">
                          {step.subLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-200">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
              <div>
                <p className="font-semibold">Замовлення було скасовано</p>
                <p className="text-xs text-red-200/70 mt-0.5">
                  Якщо у вас виникли запитання, зв’яжіться з нашою підтримкою за номером {STORE_PHONE}.
                </p>
              </div>
            </div>
          )}

          {/* Delivery & Items Section */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Delivery Info */}
            <div className="rounded-2xl border border-[#431A3B] bg-[#1E0B1A]/60 p-5">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#F5B2E2]">
                <CalendarClock className="h-4 w-4" />
                <span>Інтервал доставки</span>
              </div>
              <p className="text-sm font-semibold text-white leading-relaxed">
                {formatSlot(order.scheduledFrom, order.scheduledTo)}
              </p>
              <p className="mt-1 text-xs text-white/50">
                Кур’єрська доставка по місту Чернівці
              </p>
            </div>

            {/* Total Summary */}
            <div className="rounded-2xl border border-[#431A3B] bg-[#1E0B1A]/60 p-5">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#F5B2E2]">
                <Flower2 className="h-4 w-4" />
                <span>Сума до сплати</span>
              </div>
              <p className="font-serif text-2xl font-bold text-white">
                {formatUah(order.totalAmount)}
              </p>
              <p className="mt-1 text-xs text-white/50">
                Оплачено онлайн (карткою)
              </p>
            </div>
          </div>

          {/* Composition Items */}
          <div>
            <h2 className="mb-3 font-serif text-lg text-white">
              Склад замовлення
            </h2>
            <div className="rounded-2xl border border-[#431A3B] bg-[#1E0B1A]/40 divide-y divide-[#3A1734]">
              {order.items.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="flex items-center justify-between p-4 text-sm"
                >
                  <span className="font-medium text-white">{item.name}</span>
                  <span className="rounded-md border border-[#522149] bg-[#2B1127] px-2.5 py-0.5 text-xs font-semibold text-[#F5B2E2]">
                    {item.quantity} шт.
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* History Timeline */}
          {order.statusHistory.length > 0 && (
            <div>
              <h2 className="mb-4 font-serif text-lg text-white">
                Історія статусів
              </h2>
              <div className="relative pl-6 space-y-4 border-l border-[#431A3B] ml-2">
                {order.statusHistory.map((entry, index) => (
                  <div key={`${entry.status}-${index}`} className="relative group">
                    <span className="absolute -left-[31px] top-1 flex h-3 w-3 items-center justify-center rounded-full border-2 border-[#1E0B1A] bg-[#F5B2E2]" />
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm">
                      <span className="font-semibold text-white/90">
                        {ORDER_STATUS_LABELS[entry.status]}
                      </span>
                      <span className="text-xs text-white/40 font-mono">
                        {formatDateTime(entry.changedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Support */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-[#522149]/40 bg-[#1E0B1A]/40 p-4 text-xs text-white/60">
            <span>Маєте запитання або побажання щодо замовлення?</span>
            <a
              href={`tel:${STORE_PHONE.replace(/\s/g, '')}`}
              className="inline-flex items-center gap-1.5 font-semibold text-[#F5B2E2] hover:text-[#FDBDE9] transition-colors"
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
