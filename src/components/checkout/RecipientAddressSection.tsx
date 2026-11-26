import React from 'react';
import { Building, Gift, Info, MapPin, Navigation, User, UserCheck } from 'lucide-react';
import { FormField } from './FormField';
import { inputClassName } from './formStyles';
import { PhoneInput } from './PhoneInput';

export interface RecipientAddressSectionProps {
  recipientIsCustomer: boolean;
  onRecipientIsCustomerChange: (value: boolean) => void;
  recipientName: string;
  onRecipientNameChange: (value: string) => void;
  recipientPhone: string;
  onRecipientPhoneChange: (value: string) => void;
  city: string;
  street: string;
  onStreetChange: (value: string) => void;
  building: string;
  onBuildingChange: (value: string) => void;
  apartment: string;
  onApartmentChange: (value: string) => void;
  deliveryNotes: string;
  onDeliveryNotesChange: (value: string) => void;
  callBeforeDelivery: boolean;
  onCallBeforeDeliveryChange: (value: boolean) => void;
  contactName: string;
  contactPhone: string;
  errors: {
    recipientName?: string;
    recipientPhone?: string;
    street?: string;
    building?: string;
    apartment?: string;
    deliveryNotes?: string;
  };
}

const QUICK_NOTES = [
  'Зателефонувати за 15 хвилин',
  'Код домофону вказано вище',
  'Залишити консьєржу / на ресепшені',
  'Не казати що це квіти (сюрприз)',
];

export const RecipientAddressSection: React.FC<RecipientAddressSectionProps> = ({
  recipientIsCustomer,
  onRecipientIsCustomerChange,
  recipientName,
  onRecipientNameChange,
  recipientPhone,
  onRecipientPhoneChange,
  city,
  street,
  onStreetChange,
  building,
  onBuildingChange,
  apartment,
  onApartmentChange,
  deliveryNotes,
  onDeliveryNotesChange,
  callBeforeDelivery,
  onCallBeforeDeliveryChange,
  contactName,
  contactPhone,
  errors,
}) => {
  const handleAddQuickNote = (note: string) => {
    if (!deliveryNotes.trim()) {
      onDeliveryNotesChange(note);
    } else if (!deliveryNotes.includes(note)) {
      onDeliveryNotesChange(`${deliveryNotes.trim()}, ${note}`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Recipient Mode Tabs: Gift vs Self-delivery */}
      <div>
        <label className="mb-2 block text-[13px] font-medium text-[#FFD7F1]/85">
          Хто отримує замовлення?
        </label>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {/* Option: Another person (Gift) */}
          <button
            type="button"
            onClick={() => onRecipientIsCustomerChange(false)}
            className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
              !recipientIsCustomer
                ? 'border-[#F5B2E2] bg-[#F5B2E2]/15 text-[#F5B2E2] ring-1 ring-[#F5B2E2]'
                : 'border-[#522149] bg-[#1E0B1A]/80 text-white/70 hover:border-[#F5B2E2]/60 hover:text-white'
            }`}
          >
            <Gift className={`mt-0.5 h-4 w-4 shrink-0 ${!recipientIsCustomer ? 'text-[#F5B2E2]' : 'text-white/40'}`} />
            <div>
              <span className="block text-sm font-semibold text-white">
                Інша людина (подарунок)
              </span>
              <span className="text-xs text-white/50">
                Кур’єр доставить квіти одержувачу
              </span>
            </div>
          </button>

          {/* Option: Self */}
          <button
            type="button"
            onClick={() => onRecipientIsCustomerChange(true)}
            className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
              recipientIsCustomer
                ? 'border-[#F5B2E2] bg-[#F5B2E2]/15 text-[#F5B2E2] ring-1 ring-[#F5B2E2]'
                : 'border-[#522149] bg-[#1E0B1A]/80 text-white/70 hover:border-[#F5B2E2]/60 hover:text-white'
            }`}
          >
            <UserCheck className={`mt-0.5 h-4 w-4 shrink-0 ${recipientIsCustomer ? 'text-[#F5B2E2]' : 'text-white/40'}`} />
            <div>
              <span className="block text-sm font-semibold text-white">
                Я отримаю сам(а)
              </span>
              <span className="text-xs text-white/50">
                Замовлення буде вручено вам особисто
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Recipient Details (when recipient is another person) */}
      {!recipientIsCustomer ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="recipientName" label="Ім’я одержувача" required error={errors.recipientName}>
            <div className="relative">
              <input
                className={`${inputClassName(Boolean(errors.recipientName))} pl-9`}
                maxLength={120}
                placeholder="Наприклад: Олена"
                value={recipientName}
                onChange={e => onRecipientNameChange(e.target.value)}
              />
              <User className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-white/30" />
            </div>
          </FormField>

          <FormField
            id="recipientPhone"
            label="Телефон одержувача"
            required
            error={errors.recipientPhone}
            hint="Формат: +380 (XX) XXX-XX-XX"
          >
            <PhoneInput
              id="recipientPhone"
              value={recipientPhone}
              onChange={onRecipientPhoneChange}
              hasError={Boolean(errors.recipientPhone)}
            />
          </FormField>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl border border-[#431A3B] bg-[#1E0B1A]/40 p-3 text-xs text-white/70">
          <Info className="h-4 w-4 shrink-0 text-[#F5B2E2]" />
          <span>
            Отримувач:{' '}
            <strong className="text-white">
              {contactName.trim() || 'Замовник'}
            </strong>{' '}
            ({contactPhone || 'номер буде взято з контактних даних'})
          </span>
        </div>
      )}

      {/* Address Block */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormField id="city" label="Місто доставки" hint="Доставка здійснюється кур’єром у межах міста">
            <div className="relative">
              <input
                className={`${inputClassName(false)} opacity-75 cursor-default pl-9 font-medium`}
                value={city}
                readOnly
              />
              <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#F5B2E2]" />
            </div>
          </FormField>
        </div>

        <div className="sm:col-span-2">
          <FormField id="street" label="Вулиця" required error={errors.street}>
            <div className="relative">
              <input
                className={`${inputClassName(Boolean(errors.street))} pl-9`}
                autoComplete="address-line1"
                maxLength={160}
                placeholder="Наприклад: вул. Головна або просп. Незалежності"
                value={street}
                onChange={e => onStreetChange(e.target.value)}
              />
              <Navigation className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-white/30" />
            </div>
          </FormField>
        </div>

        <FormField id="building" label="Будинок" required error={errors.building}>
          <div className="relative">
            <input
              className={`${inputClassName(Boolean(errors.building))} pl-9`}
              maxLength={32}
              placeholder="№ будинку / корпус"
              value={building}
              onChange={e => onBuildingChange(e.target.value)}
            />
            <Building className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-white/30" />
          </div>
        </FormField>

        <FormField id="apartment" label="Квартира / Офіс" error={errors.apartment} hint="Необов’язково">
          <input
            className={inputClassName(Boolean(errors.apartment))}
            maxLength={32}
            placeholder="№ квартири або офісу"
            value={apartment}
            onChange={e => onApartmentChange(e.target.value)}
          />
        </FormField>

        {/* Delivery notes with quick template chips */}
        <div className="sm:col-span-2 flex flex-col gap-2">
          <FormField
            id="deliveryNotes"
            label="Коментар для кур’єра"
            error={errors.deliveryNotes}
            hint="Під’їзд, поверх, код домофону або особливі побажання"
          >
            <textarea
              className={`${inputClassName(Boolean(errors.deliveryNotes))} min-h-[76px] resize-y`}
              maxLength={1000}
              placeholder="Вкажіть під’їзд, поверх, домофон або іншу корисну інформацію для швидкої доставки…"
              value={deliveryNotes}
              onChange={e => onDeliveryNotesChange(e.target.value)}
            />
          </FormField>

          {/* Quick chips for courier notes */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[11px] text-white/40">Швидкі підказки:</span>
            {QUICK_NOTES.map(note => (
              <button
                key={note}
                type="button"
                onClick={() => handleAddQuickNote(note)}
                className="rounded-md border border-[#522149] bg-[#1E0B1A] px-2 py-0.5 text-[11px] text-white/60 transition-colors hover:border-[#F5B2E2]/60 hover:text-white"
              >
                + {note}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Call before delivery toggle */}
      <div
        onClick={() => onCallBeforeDeliveryChange(!callBeforeDelivery)}
        role="checkbox"
        aria-checked={callBeforeDelivery}
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            onCallBeforeDeliveryChange(!callBeforeDelivery);
          }
        }}
        className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-[#431A3B]/60 bg-[#1E0B1A]/40 p-3 transition-colors hover:border-[#F5B2E2]/40"
      >
        <input
          type="checkbox"
          id="callBeforeDeliveryToggle"
          checked={callBeforeDelivery}
          onChange={e => onCallBeforeDeliveryChange(e.target.checked)}
          onClick={e => e.stopPropagation()}
          className="mt-0.5 h-4 w-4 cursor-pointer accent-[#F5B2E2]"
        />
        <div className="flex flex-col">
          <span className="text-xs font-medium text-white/90">
            Зателефонувати перед доставкою
          </span>
          <span className="text-[11px] text-white/50">
            Кур’єр здійснить дзвінок за 15–20 хвилин до приїзду для уточнення деталей
          </span>
        </div>
      </div>
    </div>
  );
};
