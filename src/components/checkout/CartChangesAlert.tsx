import React from 'react';
import { AlertTriangle, Check, Loader2, PackageX, RefreshCw, Tag, Trash2 } from 'lucide-react';
import { formatUah } from '../../services/http';
import type { CheckoutConflictItem } from '../../types/order';
import type { CartItem } from '../../types/cart';

export interface CartChangesAlertProps {
  banner?: string | null;
  conflictItems?: CheckoutConflictItem[];
  items: CartItem[];
  hasPriceChanges: boolean;
  hasUnavailableItems: boolean;
  meetsMinimumOrder: boolean;
  minimumOrderAmount: number;
  totalAmount: number;
  isSyncing: boolean;
  onAcceptPrices: () => void | Promise<void>;
  onRemoveUnavailable: () => void | Promise<void>;
  onAdjustQuantity?: (productId: string, quantity: number) => void | Promise<void>;
  compact?: boolean;
}

export const CartChangesAlert: React.FC<CartChangesAlertProps> = ({
  banner,
  conflictItems = [],
  items,
  hasPriceChanges,
  hasUnavailableItems,
  meetsMinimumOrder,
  minimumOrderAmount,
  totalAmount,
  isSyncing,
  onAcceptPrices,
  onRemoveUnavailable,
  onAdjustQuantity,
  compact = false,
}) => {
  const priceChangedItems = items.filter(item => item.product.isAvailable && item.priceChanged);
  const unavailableItems = items.filter(item => !item.product.isAvailable);
  const insufficientItems = conflictItems.filter(
    item => item.reason === 'insufficientQuantity' && item.quantityAvailable != null
  );

  const missingForMin = Math.max(0, minimumOrderAmount - totalAmount);
  const hasMinOrderBlocker = !meetsMinimumOrder && items.length > 0;

  const hasAnyAlert =
    Boolean(banner) ||
    hasPriceChanges ||
    hasUnavailableItems ||
    insufficientItems.length > 0 ||
    hasMinOrderBlocker;

  if (!hasAnyAlert) return null;

  const isCritical = hasUnavailableItems || insufficientItems.length > 0;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`rounded-2xl border p-3.5 text-xs transition-all space-y-3 ${
        isCritical
          ? 'border-red-400/35 bg-red-500/10 text-red-100'
          : 'border-amber-300/35 bg-amber-400/10 text-amber-100'
      }`}
    >
      {/* Header / Main Banner */}
      <div className="flex items-start gap-2.5">
        {isCritical ? (
          <PackageX className="h-4 w-4 shrink-0 text-red-300 mt-0.5" />
        ) : (
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-300 mt-0.5" />
        )}
        <div className="space-y-1 flex-1">
          <p className="font-semibold text-[13px] leading-snug">
            {banner ??
              (hasUnavailableItems
                ? 'Деякі букети у кошику стали недоступними'
                : hasPriceChanges
                ? 'Ціни деяких букетів оновилися'
                : 'Зверніть увагу на умови замовлення')}
          </p>
        </div>
      </div>

      {/* Price Changes List */}
      {priceChangedItems.length > 0 && (
        <div className="rounded-xl border border-amber-300/20 bg-[#1E0B1A]/50 p-2.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-200/90">
            <Tag className="h-3 w-3" />
            <span>Оновлення цін</span>
          </div>
          <ul className="space-y-1">
            {priceChangedItems.map(item => {
              const diff = item.product.price - item.acceptedUnitPrice;
              return (
                <li key={item.product.id} className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="truncate text-white/90 font-medium">{item.product.name}</span>
                  <span className="flex items-center gap-1.5 font-mono">
                    <span className="line-through text-white/40">{formatUah(item.acceptedUnitPrice)}</span>
                    <span className="text-amber-200 font-bold">→ {formatUah(item.product.price)}</span>
                    {diff !== 0 && (
                      <span
                        className={`rounded px-1 py-0.5 text-[10px] font-semibold ${
                          diff > 0 ? 'bg-amber-400/20 text-amber-200' : 'bg-[#A6E3A1]/20 text-[#A6E3A1]'
                        }`}
                      >
                        {diff > 0 ? `+${formatUah(diff)}` : `-${formatUah(Math.abs(diff))}`}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Unavailable Items List */}
      {unavailableItems.length > 0 && (
        <div className="rounded-xl border border-red-400/20 bg-[#1E0B1A]/50 p-2.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-red-300">
            <PackageX className="h-3 w-3" />
            <span>Немає в наявності</span>
          </div>
          <ul className="space-y-1">
            {unavailableItems.map(item => (
              <li key={item.product.id} className="flex items-center justify-between gap-2 text-xs">
                <span className="truncate text-white/90">{item.product.name}</span>
                <span className="text-red-300/90 text-[11px] shrink-0">закінчився</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Insufficient Quantity Conflicts */}
      {insufficientItems.length > 0 && (
        <div className="rounded-xl border border-red-400/20 bg-[#1E0B1A]/50 p-2.5 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-red-300">
            <RefreshCw className="h-3 w-3" />
            <span>Змінилась доступна кількість</span>
          </div>
          <ul className="space-y-2">
            {insufficientItems.map(item => (
              <li key={item.productId} className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-white/90">
                  {item.name} — <strong className="text-red-200">доступно {item.quantityAvailable} шт.</strong>
                </span>
                {onAdjustQuantity && item.quantityAvailable != null && item.quantityAvailable > 0 && (
                  <button
                    type="button"
                    disabled={isSyncing}
                    onClick={() => void onAdjustQuantity(item.productId, item.quantityAvailable!)}
                    className="rounded-lg bg-red-300/20 px-2.5 py-1 text-[11px] font-semibold text-red-100 hover:bg-red-300/30 transition-colors disabled:opacity-50"
                  >
                    Встановити {item.quantityAvailable} шт.
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Minimum Order Notice */}
      {hasMinOrderBlocker && !compact && (
        <div className="rounded-xl border border-[#F5B2E2]/25 bg-[#1E0B1A]/50 p-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#FFD7F1]">
            <span>Мінімальна сума замовлення: {formatUah(minimumOrderAmount)}</span>
            <span className="font-semibold">ще {formatUah(missingForMin)}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#431A3B]">
            <div
              className="h-full rounded-full bg-[#F5B2E2] transition-all duration-300"
              style={{ width: `${Math.min(100, Math.round((totalAmount / minimumOrderAmount) * 100))}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {(hasPriceChanges || hasUnavailableItems) && (
        <div className="flex flex-wrap gap-2 pt-0.5">
          {hasPriceChanges && (
            <button
              type="button"
              disabled={isSyncing}
              onClick={() => void onAcceptPrices()}
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-200 px-3.5 py-1.5 text-xs font-semibold text-[#1E0B1A] hover:bg-amber-100 transition-colors disabled:opacity-50"
            >
              {isSyncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
              <span>Підтвердити нові ціни</span>
            </button>
          )}
          {hasUnavailableItems && (
            <button
              type="button"
              disabled={isSyncing}
              onClick={() => void onRemoveUnavailable()}
              className="inline-flex items-center gap-1.5 rounded-full bg-red-300 px-3.5 py-1.5 text-xs font-semibold text-[#1E0B1A] hover:bg-red-200 transition-colors disabled:opacity-50"
            >
              {isSyncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              <span>Видалити недоступні ({unavailableItems.length})</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
