import React from 'react';
import { Check, Phone } from 'lucide-react';
import { inputClassName } from './formStyles';
import { PHONE_PATTERN } from '../../services/orderApi';

export interface PhoneInputProps {
  id?: string;
  value: string; // Raw format: +380XXXXXXXXX
  onChange: (rawE164: string) => void;
  hasError?: boolean;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  required?: boolean;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

/** Formats Ukrainian phone digits into readable: +380 (XX) XXX-XX-XX */
const formatPhoneDisplay = (raw: string): string => {
  if (!raw) return '+380 ';
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `38${digits}`;
  if (!digits.startsWith('380')) digits = `380${digits.replace(/^3?8?0?/, '')}`;
  digits = digits.slice(0, 12);

  const country = '+380';
  const rest = digits.slice(3); // 0 to 9 digits

  if (rest.length === 0) return `${country} `;
  if (rest.length <= 2) return `${country} (${rest}`;
  if (rest.length <= 5) return `${country} (${rest.slice(0, 2)}) ${rest.slice(2)}`;
  if (rest.length <= 7) return `${country} (${rest.slice(0, 2)}) ${rest.slice(2, 5)}-${rest.slice(5)}`;
  return `${country} (${rest.slice(0, 2)}) ${rest.slice(2, 5)}-${rest.slice(5, 7)}-${rest.slice(7, 9)}`;
};

/** Normalizes user input into +380XXXXXXXXX */
const parseRawPhone = (input: string): string => {
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `38${digits}`;
  if (!digits.startsWith('380')) digits = `380${digits.replace(/^3?8?0?/, '')}`;
  digits = digits.slice(0, 12);
  return `+${digits}`;
};

export const PhoneInput: React.FC<PhoneInputProps> = ({
  id,
  value,
  onChange,
  hasError = false,
  autoComplete = 'tel',
  disabled = false,
  required = false,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
}) => {
  const isComplete = PHONE_PATTERN.test(value);
  const displayValue = formatPhoneDisplay(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseRawPhone(e.target.value);
    onChange(raw);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If user presses backspace when value is just "+380" or "+380 ", prevent deleting country code
    if (e.key === 'Backspace' && (value === '+380' || value === '+38' || value === '+3')) {
      e.preventDefault();
      onChange('+380');
    }
  };

  return (
    <div className="relative flex items-center">
      {/* Country code prefix & Flag */}
      <div className="pointer-events-none absolute left-3 flex items-center gap-1.5 text-white/50">
        <span className="text-sm select-none" role="img" aria-label="Україна">
          🇺🇦
        </span>
        <Phone className="h-3.5 w-3.5 text-white/40" />
      </div>

      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete={autoComplete}
        disabled={disabled}
        required={required}
        aria-invalid={ariaInvalid ?? hasError}
        aria-describedby={ariaDescribedBy}
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="+380 (XX) XXX-XX-XX"
        className={`${inputClassName(hasError)} pl-16 pr-9 font-mono tracking-wider text-sm transition-all`}
      />

      {/* Validation status badge */}
      {isComplete && (
        <div
          title="Номер коректний"
          className="pointer-events-none absolute right-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#A6E3A1]/20 text-[#A6E3A1]"
        >
          <Check className="h-3 w-3 stroke-[3]" />
        </div>
      )}
    </div>
  );
};
