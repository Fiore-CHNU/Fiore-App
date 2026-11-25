import React, { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal, Check, ArrowDownUp } from 'lucide-react';
import type { CatalogSort } from '../../types/catalog';

interface SortSelectorProps {
  currentSort: CatalogSort;
  onSortChange: (sort: CatalogSort) => void;
}

const SORT_OPTIONS: { id: CatalogSort; label: string; description: string }[] = [
  {
    id: 'newest',
    label: 'За новизною',
    description: 'Спочатку найновіші надходження букетів',
  },
  {
    id: 'priceAscending',
    label: 'Ціна: від дешевих до дорогих',
    description: 'Від найнижчої ціни за зростанням (₴ → ₴₴₴)',
  },
  {
    id: 'priceDescending',
    label: 'Ціна: від дорогих до дешевих',
    description: 'Преміальні та пишні букети спочатку (₴₴₴ → ₴)',
  },
];

export const SortSelector: React.FC<SortSelectorProps> = ({
  currentSort,
  onSortChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const currentOption = SORT_OPTIONS.find(opt => opt.id === currentSort) || SORT_OPTIONS[0];

  return (
    <div ref={containerRef} className="relative z-30 select-none">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex items-center gap-2.5 px-4 py-2 rounded-full border transition-all text-[13px] sm:text-[14px] font-sans font-medium tracking-wide ${
          isOpen
            ? 'bg-[#5C234E] border-[#F5B2E2] text-white shadow-lg shadow-[#F5B2E2]/15'
            : 'bg-[#2E1229] border-[#522149] text-white/90 hover:text-white hover:border-[#F5B2E2]/60 hover:bg-[#3D1A37]'
        }`}
      >
        <SlidersHorizontal className="w-4 h-4 text-[#F5B2E2]" strokeWidth={2} />
        <span className="font-semibold">Сортування</span>
        <span className="text-[#F5B2E2] font-normal hidden sm:inline">
          : {currentOption.label}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-2.5 w-72 sm:w-80 bg-[#2D1227] border border-[#5A254D] rounded-2xl shadow-2xl overflow-hidden py-2 animate-scale-in"
        >
          <div className="px-4 py-2 border-b border-[#431A3B] text-[11px] uppercase tracking-wider font-bold text-[#FFD7F1]/70 flex items-center justify-between">
            <span>Сортування каталогу</span>
            <ArrowDownUp className="w-3.5 h-3.5" />
          </div>

          <div className="p-1 space-y-1">
            {SORT_OPTIONS.map(option => {
              const isSelected = option.id === currentSort;
              return (
                <button
                  key={option.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onSortChange(option.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#5C234E] text-white font-semibold'
                      : 'hover:bg-[#3D1A37] text-white/80 hover:text-white'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] sm:text-[14px] ${isSelected ? 'text-[#F5B2E2]' : ''}`}>
                      {option.label}
                    </p>
                    <p className="text-[11px] text-white/50 mt-0.5 leading-snug">
                      {option.description}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#F5B2E2] flex items-center justify-center text-[#1E0B1A] shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
