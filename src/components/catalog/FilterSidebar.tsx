import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import type { FilterState } from '../../types/catalog';

interface FilterSidebarProps {
  filters: FilterState;
  onChangeFilters: (newFilters: FilterState) => void;
  onReset: () => void;
  onApply: () => void;
  onClose?: () => void;
  className?: string;
}

const OCCASIONS = ['Holiday', 'Birthday', 'Anniversary', 'Concert'];
const FLOWERS = ['roses', 'tulips', 'orchids', 'lilies', 'peonies'];
const COLORS = [
  { id: 'red', hex: '#FF3B30' },
  { id: 'orange', hex: '#FF9500' },
  { id: 'yellow', hex: '#FFCC00' },
  { id: 'green', hex: '#34C759' },
  { id: 'blue', hex: '#007AFF' },
  { id: 'purple', hex: '#AF52DE' },
  { id: 'pink', hex: '#FF2D55' },
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onChangeFilters,
  onReset,
  onApply,
  onClose,
  className = '',
}) => {
  const [openSections, setOpenSections] = useState({
    occasion: true,
    price: true,
    flowers: true,
    colour: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleOccasion = (item: string) => {
    const next = filters.occasions.includes(item)
      ? filters.occasions.filter(o => o !== item)
      : [...filters.occasions, item];
    onChangeFilters({ ...filters, occasions: next });
  };

  const toggleFlower = (item: string) => {
    const next = filters.flowerTypes.includes(item)
      ? filters.flowerTypes.filter(f => f !== item)
      : [...filters.flowerTypes, item];
    onChangeFilters({ ...filters, flowerTypes: next });
  };

  const toggleColor = (id: string) => {
    const next = filters.colors.includes(id)
      ? filters.colors.filter(c => c !== id)
      : [...filters.colors, id];
    onChangeFilters({ ...filters, colors: next });
  };

  return (
    <aside className={`w-full lg:w-[280px] shrink-0 bg-[#3A1633] rounded-2xl p-5 border border-[#522149] shadow-xl space-y-4 ${className}`}>
      {/* Title */}
      <div className="flex items-center justify-between pb-2 border-b border-[#522149]">
        <h2 className="font-serif text-2xl text-white font-medium tracking-wide">
          Filtration
        </h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрити фільтри"
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 1. Occasion Section */}
      <div className="bg-[#F5B2E2] rounded-xl p-3.5 text-[#1E0B1A]">
        <button
          onClick={() => toggleSection('occasion')}
          className="w-full flex items-center justify-between font-bold text-[14px] uppercase tracking-wider select-none"
        >
          <span>Occasion</span>
          {openSections.occasion ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {openSections.occasion && (
          <div className="mt-3 grid grid-cols-2 gap-2 text-[13px] font-medium">
            {OCCASIONS.map(occ => (
              <label key={occ} className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                <input
                  type="checkbox"
                  checked={filters.occasions.includes(occ)}
                  onChange={() => toggleOccasion(occ)}
                  className="rounded border-[#1E0B1A] text-[#1E0B1A] focus:ring-0 accent-[#1E0B1A] w-3.5 h-3.5"
                />
                <span className="capitalize">{occ}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 2. Price Section */}
      <div className="bg-[#F5B2E2] rounded-xl p-3.5 text-[#1E0B1A]">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between font-bold text-[14px] uppercase tracking-wider select-none"
        >
          <span>Price</span>
          {openSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {openSections.price && (
          <div className="mt-3 space-y-3">
            <div className="flex items-center gap-2 text-[13px]">
              <div className="flex-1 bg-white/90 rounded px-2 py-1 text-center font-bold">
                {filters.minPrice ?? 500} ₴
              </div>
              <span>—</span>
              <div className="flex-1 bg-white/90 rounded px-2 py-1 text-center font-bold">
                {filters.maxPrice ?? 3000} ₴
              </div>
            </div>
            <input
              type="range"
              min="500"
              max="3500"
              step="100"
              value={filters.maxPrice ?? 3000}
              onChange={e => onChangeFilters({ ...filters, maxPrice: Number(e.target.value) })}
              className="w-full accent-[#1E0B1A] cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* 3. Flowers Section */}
      <div className="bg-[#F5B2E2] rounded-xl p-3.5 text-[#1E0B1A]">
        <button
          onClick={() => toggleSection('flowers')}
          className="w-full flex items-center justify-between font-bold text-[14px] uppercase tracking-wider select-none"
        >
          <span>Flowers</span>
          {openSections.flowers ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {openSections.flowers && (
          <div className="mt-3 grid grid-cols-2 gap-2 text-[13px] font-medium">
            {FLOWERS.map(fl => (
              <label key={fl} className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                <input
                  type="checkbox"
                  checked={filters.flowerTypes.includes(fl)}
                  onChange={() => toggleFlower(fl)}
                  className="rounded border-[#1E0B1A] text-[#1E0B1A] focus:ring-0 accent-[#1E0B1A] w-3.5 h-3.5"
                />
                <span className="capitalize">{fl}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 4. Colour Section */}
      <div className="bg-[#F5B2E2] rounded-xl p-3.5 text-[#1E0B1A]">
        <button
          onClick={() => toggleSection('colour')}
          className="w-full flex items-center justify-between font-bold text-[14px] uppercase tracking-wider select-none"
        >
          <span>Colour</span>
          {openSections.colour ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {openSections.colour && (
          <div className="mt-3 flex flex-wrap gap-2 items-center">
            {COLORS.map(col => {
              const isSelected = filters.colors.includes(col.id);
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => toggleColor(col.id)}
                  style={{ backgroundColor: col.hex }}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    isSelected ? 'ring-2 ring-[#1E0B1A] scale-110' : 'hover:scale-105'
                  }`}
                  aria-label={col.id}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Reset & Apply Buttons matching Figma */}
      <div className="pt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={onReset}
          className="flex-1 py-2 px-3 rounded-full border border-[#F5B2E2] text-[#F5B2E2] hover:bg-[#F5B2E2]/10 text-[13px] font-semibold tracking-wider transition-colors"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={onApply}
          className="flex-1 py-2 px-3 rounded-full bg-[#F5B2E2] hover:bg-[#FDBDE9] text-[#1E0B1A] text-[13px] font-bold tracking-wider transition-colors shadow-md"
        >
          Apply
        </button>
      </div>
    </aside>
  );
};
