import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, CalendarDays, Loader2, Lock, ShoppingBag } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { ApiError, formatSlotTime, formatUah } from '../../services/http';
import { normalizePhoneInput, orderApi, orderSessionStore, PHONE_PATTERN } from '../../services/orderApi';
import type { CheckoutConflictItem, DeliverySlot } from '../../types/order';
import { FormField, Section } from '../../components/checkout/FormField';
import { inputClassName } from '../../components/checkout/formStyles';

/** Delivery is only within the city (US-4.2); must match the backend `Delivery:ServiceCities`. */
const SERVICE_CITY = 'Чернівці';
const CARD_LIMIT = 250;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormState {
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  recipientIsCustomer: boolean;
  recipientName: string;
  recipientPhone: string;
  street: string;
  building: string;
  apartment: string;
  deliveryNotes: string;
  callBeforeDelivery: boolean;
  withCard: boolean;
  cardMessage: string;
}

type FieldErrors = Partial<Record<keyof FormState | 'slot', string>>;

const initialForm: FormState = {
  contactName: '',
  contactPhone: '+380',
  contactEmail: '',
  recipientIsCustomer: false,
  recipientName: '',
  recipientPhone: '+380',
  street: '',
  building: '',
  apartment: '',
  deliveryNotes: '',
  callBeforeDelivery: false,
  withCard: false,
  cardMessage: '',
};

const PHONE_MESSAGE = 'Введіть телефон у форматі +380XXXXXXXXX';

const validate = (form: FormState, slot: DeliverySlot | null): FieldErrors => {
  const errors: FieldErrors = {};
  if (!form.contactName.trim()) errors.contactName = 'Вкажіть ім’я';
  if (!PHONE_PATTERN.test(form.contactPhone)) errors.contactPhone = PHONE_MESSAGE;
  if (!EMAIL_PATTERN.test(form.contactEmail.trim())) errors.contactEmail = 'Вкажіть коректний email';
  if (!form.recipientIsCustomer) {
    if (!form.recipientName.trim()) errors.recipientName = 'Вкажіть ім’я одержувача';
    if (!PHONE_PATTERN.test(form.recipientPhone)) errors.recipientPhone = PHONE_MESSAGE;
  }
  if (!form.street.trim()) errors.street = 'Вкажіть вулицю';
  if (!form.building.trim()) errors.building = 'Вкажіть будинок';
  if (!slot) errors.slot = 'Оберіть інтервал доставки';
  if (form.withCard && form.cardMessage.length > CARD_LIMIT) errors.cardMessage = `Не більше ${CARD_LIMIT} символів`;
  return errors;
};

/** Maps ASP.NET validation keys (e.g. "ContactPhone") to form fields. */
const mapServerErrors = (fieldErrors: Record<string, string[]>): FieldErrors => {
  const mapped: FieldErrors = {};
  const known: (keyof FormState)[] = ['contactName', 'contactPhone', 'contactEmail', 'recipientName', 'recipientPhone', 'street', 'building', 'apartment', 'deliveryNotes', 'cardMessage'];
  for (const [key, messages] of Object.entries(fieldErrors)) {
    const normalized = key.charAt(0).toLowerCase() + key.slice(1);
    const field = known.find(candidate => candidate === normalized);
    const message = messages[0] ?? 'Перевірте значення';
    if (field) mapped[field] = /phone/i.test(field) ? PHONE_MESSAGE : message;
    else if (normalized === 'city') mapped.street = 'Доставка можлива лише в межах міста';
    else if (normalized.startsWith('scheduled')) mapped.slot = 'Оберіть інший інтервал';
  }
  return mapped;
};

const todayIso = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Kyiv' });

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const cart = useCart();
  const { refreshCart, serverCart, items } = cart;

  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [date, setDate] = useState<string>('');
  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<DeliverySlot | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [conflictItems, setConflictItems] = useState<CheckoutConflictItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);

  const loadSlots = useCallback(async (requestedDate?: string) => {
    setSlotsLoading(true);
    setSlotsError(null);
    try {
      const response = await orderApi.slots(requestedDate);
      setDate(response.date);
      setSlots(response.slots);
      setSelectedSlot(current => response.slots.find(slot => slot.isAvailable && slot.scheduledFrom === current?.scheduledFrom) ?? null);
    } catch {
      setSlotsError('Не вдалося завантажити інтервали доставки. Спробуйте ще раз.');
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCart().finally(() => setCartLoaded(true));
    void loadSlots();
  }, [refreshCart, loadSlots]);

  const update = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: undefined }));
  };

  const blockers = useMemo(() => {
    const list: string[] = [];
    if (cart.hasUnavailableItems) list.push('У кошику є букети, яких немає в наявності. Видаліть їх, щоб продовжити.');
    if (cart.hasPriceChanges) list.push('Ціни деяких букетів змінилися. Підтвердіть нові ціни, щоб продовжити.');
    if (!cart.meetsMinimumOrder) list.push(`Мінімальна сума замовлення — ${formatUah(cart.minimumOrderAmount)}.`);
    return list;
  }, [cart.hasUnavailableItems, cart.hasPriceChanges, cart.meetsMinimumOrder, cart.minimumOrderAmount]);

  const handleConflict = async (error: ApiError) => {
    const body = error.body as { items?: CheckoutConflictItem[] } | undefined;
    setConflictItems(body?.items ?? []);
    switch (error.code) {
      case 'PriceChanged':
        setBanner('Поки ви оформлювали замовлення, ціни змінилися. Перевірте нову суму й підтвердіть її.');
        await refreshCart();
        break;
      case 'ProductNotAvailable':
        setBanner('Деяких букетів уже немає в наявності. Видаліть їх із кошика, щоб продовжити.');
        await refreshCart();
        break;
      case 'QuantityExceedsAvailability':
        setBanner('Такої кількості деяких букетів уже немає. Зменште кількість у кошику.');
        await refreshCart();
        break;
      case 'DeliverySlotUnavailable':
        setBanner(null);
        setErrors(current => ({ ...current, slot: 'Цей інтервал уже недоступний. Оберіть інший.' }));
        setSelectedSlot(null);
        await loadSlots(date || undefined);
        break;
      case 'MinimumOrderNotMet':
        setBanner(`Мінімальна сума замовлення — ${formatUah(cart.minimumOrderAmount)}.`);
        await refreshCart();
        break;
      default:
        setBanner('Не вдалося оформити замовлення. Спробуйте ще раз.');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBanner(null);
    setConflictItems([]);
    const clientErrors = validate(form, selectedSlot);
    setErrors(clientErrors);
    if (Object.values(clientErrors).some(Boolean)) {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }
    if (!serverCart || blockers.length > 0 || !selectedSlot) return;

    setSubmitting(true);
    try {
      const order = await orderApi.checkout(serverCart.sessionToken, {
        cartId: serverCart.id,
        contactName: form.contactName.trim(),
        contactEmail: form.contactEmail.trim(),
        contactPhone: form.contactPhone,
        recipientName: (form.recipientIsCustomer ? form.contactName : form.recipientName).trim(),
        recipientPhone: form.recipientIsCustomer ? form.contactPhone : form.recipientPhone,
        city: SERVICE_CITY,
        street: form.street.trim(),
        building: form.building.trim(),
        apartment: form.apartment.trim() || undefined,
        deliveryNotes: form.deliveryNotes.trim() || undefined,
        scheduledFrom: selectedSlot.scheduledFrom,
        scheduledTo: selectedSlot.scheduledTo,
        cardMessage: form.withCard && form.cardMessage.trim() ? form.cardMessage.trim() : undefined,
        callBeforeDelivery: form.callBeforeDelivery,
      });
      orderSessionStore.write({
        orderId: order.orderId,
        orderNumber: order.orderNumber,
        trackingCode: order.trackingCode,
        sessionToken: serverCart.sessionToken,
        createdAt: order.createdAt,
      });
      cart.forgetCart();
      navigate(`/order/${order.orderId}/payment`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 400 && Object.keys(error.fieldErrors).length > 0) {
        setErrors(mapServerErrors(error.fieldErrors));
        setBanner('Перевірте виділені поля.');
      } else if (error instanceof ApiError && error.status === 409) {
        await handleConflict(error);
      } else if (error instanceof ApiError && (error.status === 403 || error.status === 404 || error.code === 'CartInactive')) {
        cart.forgetCart();
        setBanner('Кошик застарів. Додайте букети ще раз.');
      } else {
        setBanner('Не вдалося з’єднатися із сервером. Перевірте інтернет і спробуйте ще раз.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!cartLoaded && items.length === 0) {
    return (
      <main className="flex justify-center px-4 py-24 text-white/60">
        <Loader2 className="h-6 w-6 animate-spin" aria-label="Завантаження кошика" />
      </main>
    );
  }

  if (items.length === 0 && !submitting) {
    return (
      <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
        <ShoppingBag className="mb-4 h-10 w-10 text-[#F5B2E2]/70" />
        <h1 className="mb-2 font-serif text-2xl">Кошик порожній</h1>
        <p className="mb-6 text-sm text-white/60">Оберіть букет у каталозі, щоб оформити замовлення.</p>
        <Link to="/" className="rounded-full bg-[#F5B2E2] px-6 py-2.5 text-sm font-semibold text-[#1E0B1A] hover:bg-[#FDBDE9]">
          До каталогу
        </Link>
      </main>
    );
  }

  const cardLength = form.cardMessage.length;

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-8 lg:py-12">
      <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 hover:text-[#F5B2E2]">
        <ArrowLeft className="h-4 w-4" /> До каталогу
      </Link>
      <h1 className="mb-8 font-serif text-3xl sm:text-4xl">Оформлення замовлення</h1>

      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="flex flex-col gap-6">
          <Section step={1} title="Замовник">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField id="contactName" label="Ім’я" required error={errors.contactName}>
                <input className={inputClassName(Boolean(errors.contactName))} autoComplete="name" maxLength={120}
                  value={form.contactName} onChange={e => update('contactName', e.target.value)} />
              </FormField>
              <FormField id="contactPhone" label="Телефон" required error={errors.contactPhone} hint="+380XXXXXXXXX">
                <input className={inputClassName(Boolean(errors.contactPhone))} type="tel" inputMode="tel" autoComplete="tel"
                  value={form.contactPhone} onChange={e => update('contactPhone', normalizePhoneInput(e.target.value))} />
              </FormField>
              <div className="sm:col-span-2">
                <FormField id="contactEmail" label="Email" required error={errors.contactEmail} hint="Надішлемо підтвердження та посилання на статус">
                  <input className={inputClassName(Boolean(errors.contactEmail))} type="email" autoComplete="email" maxLength={254}
                    value={form.contactEmail} onChange={e => update('contactEmail', e.target.value)} />
                </FormField>
              </div>
            </div>
          </Section>

          <Section step={2} title="Одержувач і адреса">
            <label className="mb-4 flex cursor-pointer items-center gap-2.5 text-sm text-white/80">
              <input type="checkbox" className="h-4 w-4 accent-[#F5B2E2]" checked={form.recipientIsCustomer}
                onChange={e => update('recipientIsCustomer', e.target.checked)} />
              Я отримаю замовлення сам(а)
            </label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {!form.recipientIsCustomer && (
                <>
                  <FormField id="recipientName" label="Ім’я одержувача" required error={errors.recipientName}>
                    <input className={inputClassName(Boolean(errors.recipientName))} maxLength={120}
                      value={form.recipientName} onChange={e => update('recipientName', e.target.value)} />
                  </FormField>
                  <FormField id="recipientPhone" label="Телефон одержувача" required error={errors.recipientPhone} hint="+380XXXXXXXXX">
                    <input className={inputClassName(Boolean(errors.recipientPhone))} type="tel" inputMode="tel"
                      value={form.recipientPhone} onChange={e => update('recipientPhone', normalizePhoneInput(e.target.value))} />
                  </FormField>
                </>
              )}
              <div className="sm:col-span-2">
                <FormField id="city" label="Місто" hint="Доставка можлива лише в межах міста">
                  <input className={`${inputClassName(false)} opacity-70`} value={SERVICE_CITY} readOnly />
                </FormField>
              </div>
              <div className="sm:col-span-2">
                <FormField id="street" label="Вулиця" required error={errors.street}>
                  <input className={inputClassName(Boolean(errors.street))} autoComplete="address-line1" maxLength={160}
                    value={form.street} onChange={e => update('street', e.target.value)} />
                </FormField>
              </div>
              <FormField id="building" label="Будинок" required error={errors.building}>
                <input className={inputClassName(Boolean(errors.building))} maxLength={32}
                  value={form.building} onChange={e => update('building', e.target.value)} />
              </FormField>
              <FormField id="apartment" label="Квартира" error={errors.apartment}>
                <input className={inputClassName(Boolean(errors.apartment))} maxLength={32}
                  value={form.apartment} onChange={e => update('apartment', e.target.value)} />
              </FormField>
              <div className="sm:col-span-2">
                <FormField id="deliveryNotes" label="Коментар для кур’єра" error={errors.deliveryNotes}>
                  <textarea className={`${inputClassName(Boolean(errors.deliveryNotes))} min-h-20 resize-y`} maxLength={1000}
                    value={form.deliveryNotes} onChange={e => update('deliveryNotes', e.target.value)} />
                </FormField>
              </div>
            </div>
            <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm text-white/80">
              <input type="checkbox" className="h-4 w-4 accent-[#F5B2E2]" checked={form.callBeforeDelivery}
                onChange={e => update('callBeforeDelivery', e.target.checked)} />
              Зателефонувати перед доставкою
            </label>
          </Section>

          <Section step={3} title="Дата й час доставки">
            <div className="mb-4 max-w-xs">
              <FormField id="deliveryDate" label="Дата">
                <input type="date" className={inputClassName(false)} min={todayIso()} value={date}
                  onChange={e => { if (e.target.value) { setSelectedSlot(null); void loadSlots(e.target.value); } }} />
              </FormField>
            </div>
            {slotsLoading ? (
              <div className="flex items-center gap-2 text-sm text-white/60"><Loader2 className="h-4 w-4 animate-spin" /> Завантаження інтервалів…</div>
            ) : slotsError ? (
              <div className="text-sm text-red-300">
                {slotsError}{' '}
                <button type="button" className="underline" onClick={() => void loadSlots(date || undefined)}>Спробувати ще раз</button>
              </div>
            ) : (
              <div role="radiogroup" aria-label="Інтервал доставки" className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {slots.map(slot => {
                  const selected = selectedSlot?.scheduledFrom === slot.scheduledFrom;
                  return (
                    <button key={slot.scheduledFrom} type="button" role="radio" aria-checked={selected} disabled={!slot.isAvailable}
                      onClick={() => { setSelectedSlot(slot); setErrors(current => ({ ...current, slot: undefined })); }}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
                        selected ? 'border-[#F5B2E2] bg-[#F5B2E2] text-[#1E0B1A]' : 'border-[#522149] bg-[#1E0B1A] text-white hover:border-[#F5B2E2]/70'
                      }`}>
                      {formatSlotTime(slot.scheduledFrom)}–{formatSlotTime(slot.scheduledTo)}
                      {!slot.isAvailable && <span className="block text-[11px] font-normal">недоступно</span>}
                    </button>
                  );
                })}
              </div>
            )}
            {errors.slot && <p className="mt-2 text-xs text-red-300" role="alert">{errors.slot}</p>}
            <p className="mt-3 flex items-center gap-1.5 text-xs text-white/45">
              <CalendarDays className="h-3.5 w-3.5" /> Інтервал можна обрати не пізніше ніж за 90 хвилин до його початку (київський час).
            </p>
          </Section>

          <Section step={4} title="Листівка">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-white/80">
              <input type="checkbox" className="h-4 w-4 accent-[#F5B2E2]" checked={form.withCard}
                onChange={e => update('withCard', e.target.checked)} />
              Додати безкоштовну листівку з привітанням
            </label>
            {form.withCard && (
              <div className="mt-4">
                <FormField id="cardMessage" label="Текст листівки" error={errors.cardMessage}
                  hint={<span className={cardLength >= CARD_LIMIT ? 'text-[#F5B2E2]' : ''}>{cardLength}/{CARD_LIMIT}</span>}>
                  <textarea className={`${inputClassName(Boolean(errors.cardMessage))} min-h-28 resize-y`} maxLength={CARD_LIMIT}
                    value={form.cardMessage} onChange={e => update('cardMessage', e.target.value.slice(0, CARD_LIMIT))} />
                </FormField>
              </div>
            )}
          </Section>
        </div>

        <aside className="rounded-2xl border border-[#431A3B] bg-[#2B1127] p-5 sm:p-6 lg:sticky lg:top-28">
          <h2 className="mb-4 font-serif text-lg">Ваше замовлення</h2>
          <ul className="mb-4 divide-y divide-[#3A1734]">
            {items.map(item => (
              <li key={item.product.id} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="truncate text-white">{item.product.name}</p>
                  <p className="text-xs text-white/50">{item.quantity} × {formatUah(item.product.price)}</p>
                  {!item.product.isAvailable && <p className="text-xs text-red-300">Немає в наявності</p>}
                  {item.product.isAvailable && item.priceChanged && (
                    <p className="text-xs text-amber-200">Було {formatUah(item.acceptedUnitPrice)}</p>
                  )}
                </div>
                <span className="shrink-0 font-semibold text-[#FFD7F1]">{formatUah(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="space-y-1.5 border-t border-[#431A3B] pt-4 text-sm">
            <div className="flex justify-between text-white/70"><dt>Товари</dt><dd className="text-white">{formatUah(cart.totalAmount)}</dd></div>
            <div className="flex justify-between text-white/70">
              <dt>Доставка</dt>
              <dd className="text-white">{cart.deliveryFeeAmount === 0 && cart.totalAmount > 0 ? 'Безкоштовно' : formatUah(cart.deliveryFeeAmount)}</dd>
            </div>
            <div className="flex justify-between pt-2 text-base font-semibold"><dt>Разом</dt><dd className="text-lg text-[#F5B2E2]">{formatUah(cart.grandTotalAmount)}</dd></div>
          </dl>
          {cart.deliveryFeeAmount > 0 && (
            <p className="mt-2 text-xs text-white/45">Безкоштовна доставка від {formatUah(1500)}.</p>
          )}

          {(banner || blockers.length > 0) && (
            <div role="alert" className="mt-4 space-y-2 rounded-xl border border-amber-300/30 bg-amber-400/10 p-3 text-xs text-amber-100">
              {banner && <p className="flex gap-2"><AlertTriangle className="h-4 w-4 shrink-0" />{banner}</p>}
              {conflictItems.length > 0 && (
                <ul className="list-disc space-y-0.5 pl-5">
                  {conflictItems.map(item => (
                    <li key={item.productId}>
                      {item.name}
                      {item.reason === 'priceChanged' && item.acceptedUnitPrice != null && item.currentUnitPrice != null &&
                        `: ${formatUah(item.acceptedUnitPrice)} → ${formatUah(item.currentUnitPrice)}`}
                      {item.reason === 'insufficientQuantity' && item.quantityAvailable != null && `: доступно ${item.quantityAvailable} шт.`}
                      {item.reason === 'unavailable' && ': немає в наявності'}
                    </li>
                  ))}
                </ul>
              )}
              {blockers.filter(text => text !== banner).map(text => <p key={text}>{text}</p>)}
              <div className="flex flex-wrap gap-2 pt-1">
                {cart.hasPriceChanges && (
                  <button type="button" onClick={() => { setBanner(null); setConflictItems([]); void cart.acceptPrices(); }}
                    className="rounded-full bg-amber-200 px-3 py-1.5 font-semibold text-[#1E0B1A] hover:bg-amber-100">
                    Підтвердити нові ціни
                  </button>
                )}
                {cart.hasUnavailableItems && (
                  <button type="button"
                    onClick={async () => {
                      for (const item of items.filter(candidate => !candidate.product.isAvailable)) await cart.removeFromCart(item.product.id);
                      setBanner(null);
                      setConflictItems([]);
                    }}
                    className="rounded-full bg-amber-200 px-3 py-1.5 font-semibold text-[#1E0B1A] hover:bg-amber-100">
                    Видалити недоступні
                  </button>
                )}
              </div>
            </div>
          )}

          <button type="submit" disabled={submitting || cart.isSyncing || blockers.length > 0}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#F5B2E2] px-4 py-3 text-sm font-semibold text-[#1E0B1A] shadow-md transition-all hover:bg-[#FDBDE9] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            Перейти до оплати {formatUah(cart.grandTotalAmount)}
          </button>
          <p className="mt-3 text-center text-[11px] text-white/40">Неоплачене замовлення автоматично скасовується через 15 хвилин.</p>
        </aside>
      </form>
    </main>
  );
};
