import React, { useEffect, useState } from 'react';
import { Mail, Sparkles, User, X } from 'lucide-react';
import { FormField } from './FormField';
import { inputClassName } from './formStyles';
import { PhoneInput } from './PhoneInput';

const SAVED_CUSTOMER_KEY = 'fiore_saved_customer_v1';

export interface CustomerFormSectionProps {
  contactName: string;
  onContactNameChange: (value: string) => void;
  contactPhone: string;
  onContactPhoneChange: (value: string) => void;
  contactEmail: string;
  onContactEmailChange: (value: string) => void;
  errors: {
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
  };
}

interface SavedCustomer {
  name: string;
  phone: string;
  email: string;
}

export const CustomerFormSection: React.FC<CustomerFormSectionProps> = ({
  contactName,
  onContactNameChange,
  contactPhone,
  onContactPhoneChange,
  contactEmail,
  onContactEmailChange,
  errors,
}) => {
  const [savedData, setSavedData] = useState<SavedCustomer | null>(() => {
    try {
      const raw = localStorage.getItem(SAVED_CUSTOMER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedCustomer;
        if (parsed.name && parsed.phone) return parsed;
      }
    } catch {
      // ignore
    }
    return null;
  });
  const [saveProfile, setSaveProfile] = useState<boolean>(true);

  // Save profile when valid and toggle is enabled
  useEffect(() => {
    if (!saveProfile) return;
    if (contactName.trim() && contactPhone.length >= 13 && contactEmail.includes('@')) {
      try {
        localStorage.setItem(
          SAVED_CUSTOMER_KEY,
          JSON.stringify({
            name: contactName.trim(),
            phone: contactPhone,
            email: contactEmail.trim(),
          })
        );
      } catch {
        // ignore
      }
    }
  }, [contactName, contactPhone, contactEmail, saveProfile]);

  const handleApplySaved = () => {
    if (!savedData) return;
    onContactNameChange(savedData.name);
    onContactPhoneChange(savedData.phone);
    if (savedData.email) onContactEmailChange(savedData.email);
    setSavedData(null);
  };

  const handleDismissSaved = () => {
    setSavedData(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Banner if returning customer data is found */}
      {savedData && !contactName && (
        <div className="flex items-center justify-between rounded-xl border border-[#F5B2E2]/30 bg-[#F5B2E2]/10 p-3 text-xs text-[#FFD7F1]">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-[#F5B2E2]" />
            <span>
              З поверненням! Заповнити контактні дані ({savedData.name})?
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleApplySaved}
              className="rounded-lg bg-[#F5B2E2] px-3 py-1 font-semibold text-[#1E0B1A] transition-colors hover:bg-[#FDBDE9]"
            >
              Підставити
            </button>
            <button
              type="button"
              onClick={handleDismissSaved}
              aria-label="Сховати"
              className="p-1 text-white/50 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Contact Name */}
        <FormField id="contactName" label="Ім’я замовника" required error={errors.contactName}>
          <div className="relative">
            <input
              className={`${inputClassName(Boolean(errors.contactName))} pl-9`}
              autoComplete="name"
              maxLength={120}
              placeholder="Ваше ім’я та прізвище"
              value={contactName}
              onChange={e => onContactNameChange(e.target.value)}
            />
            <User className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-white/30" />
          </div>
        </FormField>

        {/* Contact Phone with Mask */}
        <FormField
          id="contactPhone"
          label="Номер телефону"
          required
          error={errors.contactPhone}
          hint="Формат: +380 (XX) XXX-XX-XX"
        >
          <PhoneInput
            id="contactPhone"
            value={contactPhone}
            onChange={onContactPhoneChange}
            hasError={Boolean(errors.contactPhone)}
            autoComplete="tel"
          />
        </FormField>

        {/* Contact Email */}
        <div className="sm:col-span-2">
          <FormField
            id="contactEmail"
            label="Електронна пошта (Email)"
            required
            error={errors.contactEmail}
            hint="Надішлемо підтвердження замовлення та посилання для відстеження статусу доставки"
          >
            <div className="relative">
              <input
                className={`${inputClassName(Boolean(errors.contactEmail))} pl-9`}
                type="email"
                autoComplete="email"
                maxLength={254}
                placeholder="email@example.com"
                value={contactEmail}
                onChange={e => onContactEmailChange(e.target.value)}
              />
              <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-white/30" />
            </div>
          </FormField>
        </div>
      </div>

      {/* Save profile for next orders */}
      <label className="flex cursor-pointer items-center gap-2 pt-1 text-xs text-white/70 hover:text-white transition-colors">
        <input
          type="checkbox"
          checked={saveProfile}
          onChange={e => setSaveProfile(e.target.checked)}
          className="h-3.5 w-3.5 cursor-pointer accent-[#F5B2E2]"
        />
        <span>Зберегти контактні дані для наступних замовлень у цьому браузері</span>
      </label>
    </div>
  );
};
