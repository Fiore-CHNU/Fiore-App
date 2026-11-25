/** Shared input styling for checkout forms. */
export const inputClassName = (hasError: boolean) =>
  `w-full rounded-xl bg-[#1E0B1A] border px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-[#F5B2E2] ${
    hasError ? 'border-red-400/70' : 'border-[#522149]'
  }`;
