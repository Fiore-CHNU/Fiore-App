import React from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: React.ReactNode;
  required?: boolean;
  children: React.ReactElement<{ id?: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }>;
}

/** Label, control, and an inline error under the field (NFR-05). */
export const FormField: React.FC<FormFieldProps> = ({ id, label, error, hint, required, children }) => {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-[#FFD7F1]/85">
        {label}
        {required && <span className="text-[#F5B2E2]"> *</span>}
      </label>
      {React.cloneElement(children, { id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-red-300">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-white/45">
          {hint}
        </p>
      ) : null}
    </div>
  );
};

export const Section: React.FC<{ title: string; step: number; children: React.ReactNode }> = ({ title, step, children }) => (
  <section className="rounded-2xl border border-[#431A3B] bg-[#260E21] p-5 sm:p-6">
    <h2 className="mb-5 flex items-center gap-3 font-serif text-lg text-white">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F5B2E2] text-sm font-bold text-[#1E0B1A] font-sans">
        {step}
      </span>
      {title}
    </h2>
    {children}
  </section>
);
