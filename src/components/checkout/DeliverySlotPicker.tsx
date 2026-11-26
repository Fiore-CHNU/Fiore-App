import React, { useMemo, useState } from 'react';
import { AlertCircle, Calendar, CalendarDays, Check, Clock, Info, Loader2, RefreshCw } from 'lucide-react';
import { formatSlotTime } from '../../services/http';
import type { DeliverySlot } from '../../types/order';

export interface DeliverySlotPickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  slots: DeliverySlot[];
  selectedSlot: DeliverySlot | null;
  onSlotSelect: (slot: DeliverySlot) => void;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  validationError?: string;
}

interface QuickDateOption {
  iso: string;
  label: string;
  subLabel: string;
  isToday: boolean;
  isTomorrow: boolean;
}

const getKyivDateIso = (date: Date): string =>
  date.toLocaleDateString('sv-SE', { timeZone: 'Europe/Kyiv' });

const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const DeliverySlotPicker: React.FC<DeliverySlotPickerProps> = ({
  selectedDate,
  onDateChange,
  slots,
  selectedSlot,
  onSlotSelect,
  isLoading,
  error,
  onRetry,
  validationError,
}) => {
  const [initialTimestamp] = useState(() => Date.now());

  // Generate quick date options (Today + next 4 days)
  const quickDates = useMemo<QuickDateOption[]>(() => {
    const dates: QuickDateOption[] = [];
    const baseDate = new Date(initialTimestamp);
    const weekdayFormatter = new Intl.DateTimeFormat('uk-UA', {
      timeZone: 'Europe/Kyiv',
      weekday: 'short',
    });
    const dayMonthFormatter = new Intl.DateTimeFormat('uk-UA', {
      timeZone: 'Europe/Kyiv',
      day: 'numeric',
      month: 'short',
    });

    for (let i = 0; i < 5; i++) {
      const d = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000);
      const iso = getKyivDateIso(d);
      const isToday = i === 0;
      const isTomorrow = i === 1;

      let label = capitalize(weekdayFormatter.format(d));
      if (isToday) label = 'Сьогодні';
      else if (isTomorrow) label = 'Завтра';

      const subLabel = dayMonthFormatter.format(d);

      dates.push({
        iso,
        label,
        subLabel,
        isToday,
        isTomorrow,
      });
    }

    return dates;
  }, [initialTimestamp]);

  const todayIso = quickDates[0]?.iso ?? getKyivDateIso(new Date(initialTimestamp));
  const maxDate = useMemo(() => {
    const d = new Date(initialTimestamp);
    d.setDate(d.getDate() + 14);
    return getKyivDateIso(d);
  }, [initialTimestamp]);

  const allSlotsUnavailable = useMemo(
    () => slots.length > 0 && slots.every(slot => !slot.isAvailable),
    [slots]
  );

  const tomorrowOption = quickDates.find(d => d.isTomorrow);

  return (
    <div className="flex flex-col gap-5">
      {/* Date selector tabs */}
      <div>
        <label className="mb-2 block text-[13px] font-medium text-[#FFD7F1]/85">
          Дата доставки <span className="text-[#F5B2E2]">*</span>
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {quickDates.map(dateOpt => {
            const isSelected = selectedDate === dateOpt.iso;
            return (
              <button
                key={dateOpt.iso}
                type="button"
                onClick={() => onDateChange(dateOpt.iso)}
                className={`group relative flex flex-col items-center justify-center rounded-xl border px-3.5 py-2 transition-all ${
                  isSelected
                    ? 'border-[#F5B2E2] bg-[#F5B2E2]/15 text-[#F5B2E2] shadow-[0_0_15px_rgba(245,178,226,0.15)] ring-1 ring-[#F5B2E2]'
                    : 'border-[#522149] bg-[#1E0B1A]/80 text-white/80 hover:border-[#F5B2E2]/60 hover:text-white'
                }`}
              >
                <span className="text-xs font-semibold">{dateOpt.label}</span>
                <span className={`text-[11px] ${isSelected ? 'text-[#F5B2E2]/90' : 'text-white/50'}`}>
                  {dateOpt.subLabel}
                </span>
              </button>
            );
          })}

          {/* Custom Date Input */}
          <div className="relative flex items-center">
            <input
              type="date"
              id="deliveryDate"
              aria-label="Вибрати іншу дату"
              min={todayIso}
              max={maxDate}
              value={selectedDate}
              onChange={e => {
                if (e.target.value) {
                  onDateChange(e.target.value);
                }
              }}
              className="peer cursor-pointer rounded-xl border border-[#522149] bg-[#1E0B1A] py-2.5 pl-9 pr-3 text-xs font-medium text-white transition-colors hover:border-[#F5B2E2]/60 focus:border-[#F5B2E2] focus:outline-none"
            />
            <Calendar className="pointer-events-none absolute left-3 h-4 w-4 text-white/40 peer-focus:text-[#F5B2E2]" />
          </div>
        </div>
      </div>

      {/* Slots Section */}
      <div>
        <label className="mb-2 block text-[13px] font-medium text-[#FFD7F1]/85">
          Часовий інтервал <span className="text-[#F5B2E2]">*</span>
        </label>

        {isLoading ? (
          <div className="flex items-center gap-2.5 rounded-xl border border-[#431A3B] bg-[#1E0B1A]/40 px-4 py-8 text-sm text-white/60">
            <Loader2 className="h-5 w-5 animate-spin text-[#F5B2E2]" />
            <span>Завантаження доступних інтервалів…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-start gap-3 rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-500/30 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Спробувати ще раз
            </button>
          </div>
        ) : (
          <>
            {/* Banner when today has no remaining slots */}
            {allSlotsUnavailable && (
              <div className="mb-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#F5B2E2]/30 bg-[#F5B2E2]/10 p-3.5 text-xs text-[#FFD7F1]">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 shrink-0 text-[#F5B2E2]" />
                  <span>
                    На цю дату всі інтервали вже заповнені або час прийому минув. Оберіть наступний день.
                  </span>
                </div>
                {tomorrowOption && selectedDate !== tomorrowOption.iso && (
                  <button
                    type="button"
                    onClick={() => onDateChange(tomorrowOption.iso)}
                    className="shrink-0 rounded-lg bg-[#F5B2E2] px-3 py-1.5 text-xs font-semibold text-[#1E0B1A] transition-colors hover:bg-[#FDBDE9]"
                  >
                    Перейти на завтра ({tomorrowOption.subLabel})
                  </button>
                )}
              </div>
            )}

            {/* Slots Grid */}
            <div
              role="radiogroup"
              aria-label="Інтервал доставки"
              className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {slots.map(slot => {
                const isSelected = selectedSlot?.scheduledFrom === slot.scheduledFrom;
                const isAvailable = slot.isAvailable;
                const timeFrom = formatSlotTime(slot.scheduledFrom);
                const timeTo = formatSlotTime(slot.scheduledTo);

                // Capacity status text
                let statusBadge = null;
                if (!isAvailable) {
                  const reason = slot.remainingCapacity === 0 ? 'Заповнено' : 'Недоступно';
                  statusBadge = (
                    <span className="text-[11px] font-medium text-white/40">
                      {reason}
                    </span>
                  );
                } else if (slot.remainingCapacity <= 3) {
                  statusBadge = (
                    <span className="text-[11px] font-semibold text-amber-300/90">
                      Залишилось {slot.remainingCapacity}{' '}
                      {slot.remainingCapacity === 1 ? 'місце' : 'місця'}
                    </span>
                  );
                } else {
                  statusBadge = (
                    <span className="text-[11px] text-[#A6E3A1]/90">
                      Доступно
                    </span>
                  );
                }

                return (
                  <button
                    key={slot.scheduledFrom}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-disabled={!isAvailable}
                    disabled={!isAvailable}
                    onClick={() => onSlotSelect(slot)}
                    className={`relative flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all ${
                      isSelected
                        ? 'border-[#F5B2E2] bg-[#F5B2E2] text-[#1E0B1A] shadow-[0_0_18px_rgba(245,178,226,0.25)]'
                        : isAvailable
                        ? 'border-[#522149] bg-[#1E0B1A] text-white hover:border-[#F5B2E2]/70 hover:bg-[#2B1127]'
                        : 'cursor-not-allowed border-white/5 bg-white/[0.02] text-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Clock className={`h-4 w-4 ${isSelected ? 'text-[#1E0B1A]' : isAvailable ? 'text-[#F5B2E2]' : 'text-white/20'}`} />
                        <span className={`text-sm font-semibold tracking-wide ${isSelected ? 'text-[#1E0B1A]' : 'text-white'}`}>
                          {timeFrom} – {timeTo}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1E0B1A] text-[#F5B2E2]">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div className="mt-2.5 flex items-center justify-between">
                      {isSelected ? (
                        <span className="text-[11px] font-semibold text-[#1E0B1A]/80">
                          Обрано
                        </span>
                      ) : (
                        statusBadge
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {validationError && (
          <p className="mt-2.5 flex items-center gap-1.5 text-xs text-red-300" role="alert">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {validationError}
          </p>
        )}

        {/* Business Rule description note */}
        <p className="mt-3.5 flex items-center gap-1.5 text-xs text-white/45">
          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[#F5B2E2]/60" />
          <span>
            Бронювання слоту можливе не пізніше ніж за 90 хвилин до його початку. Доставка кур’єром у межах 2-годинного інтервалу (київський час).
          </span>
        </p>
      </div>
    </div>
  );
};
