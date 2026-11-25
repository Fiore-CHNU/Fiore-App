import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import type { FilterState, CatalogFacetItem } from '../../types/catalog';
import { DEFAULT_FACETS } from '../../services/api';

interface FilterSidebarProps {
  filters: FilterState;
  onChangeFilters: (newFilters: FilterState) => void;
  onReset: () => void;
  onApply: () => void;
  onClose?: () => void;
  facets?: CatalogFacetItem[];
  className?: string;
}

const COLOR_HEX_MAP: Record<string, { hex: string; border?: boolean }> = {
  white: { hex: '#FFFFFF', border: true },
  pastel: { hex: '#FAD2E1' },
  pink: { hex: '#FF69B4' },
  red: { hex: '#E63946' },
  orange: { hex: '#FF9500' },
  yellow: { hex: '#FFCC00' },
  green: { hex: '#34C759' },
  blue: { hex: '#007AFF' },
  purple: { hex: '#AF52DE' },
};

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onChangeFilters,
  onReset,
  onApply,
  onClose,
  facets = DEFAULT_FACETS,
  className = '',
}) => {
  const [openSections, setOpenSections] = useState({
    occasion: true,
    price: true,
    flowers: true,
    colour: true,
  });

  const occasions = facets.filter(f => f.kind.toLowerCase() === 'occasion');
  const flowers = facets.filter(f => f.kind.toLowerCase() === 'flowertype');
  const colors = facets.filter(f => f.kind.toLowerCase() === 'color');

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleOccasion = (slug: string) => {
    const next = filters.occasions.includes(slug)
      ? filters.occasions.filter(o => o !== slug)
      : [...filters.occasions, slug];
    onChangeFilters({ ...filters, occasions: next });
  };

  const toggleFlower = (slug: string) => {
    const next = filters.flowerTypes.includes(slug)
      ? filters.flowerTypes.filter(f => f !== slug)
      : [...filters.flowerTypes, slug];
    onChangeFilters({ ...filters, flowerTypes: next });
  };

  const toggleColor = (slug: string) => {
    const next = filters.colors.includes(slug)
      ? filters.colors.filter(c => c !== slug)
      : [...filters.colors, slug];
    onChangeFilters({ ...filters, colors: next });
  };

  return (
    <aside className={`w-full lg:w-[280px] shrink-0 bg-[#3A1633] rounded-2xl p-5 border border-[#522149] shadow-xl space-y-4 ${className}`}>
      {/* Title */}
      <div className="flex items-center justify-between pb-2 border-b border-[#522149]">
        <h2 className="font-serif text-2xl text-white font-medium tracking-wide">
          Фільтри
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
          type="button"
          onClick={() => toggleSection('occasion')}
          className="w-full flex items-center justify-between font-bold text-[14px] uppercase tracking-wider select-none"
        >
          <span>Подія</span>
          {openSections.occasion ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {openSections.occasion && (
          <div className="mt-3 grid grid-cols-2 gap-2 text-[13px] font-medium">
            {occasions.map(occ => (
              <label key={occ.id} className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                <input
                  type="checkbox"
                  checked={filters.occasions.includes(occ.slug)}
                  onChange={() => toggleOccasion(occ.slug)}
                  className="rounded border-[#1E0B1A] text-[#1E0B1A] focus:ring-0 accent-[#1E0B1A] w-3.5 h-3.5"
                />
                <span className="truncate" title={occ.name}>{occ.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 2. Price Section */}
      <div className="bg-[#F5B2E2] rounded-xl p-3.5 text-[#1E0B1A]">
        <button
          type="button"
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between font-bold text-[14px] uppercase tracking-wider select-none"
        >
          <span>Ціна</span>
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
                {filters.maxPrice ?? 3500} ₴
              </div>
            </div>
            <input
              type="range"
              min="500"
              max="3500"
              step="50"
              value={filters.maxPrice ?? 3500}
              onChange={e => onChangeFilters({ ...filters, maxPrice: Number(e.target.value) })}
              className="w-full accent-[#1E0B1A] cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* 3. Flowers Section */}
      <div className="bg-[#F5B2E2] rounded-xl p-3.5 text-[#1E0B1A]">
        <button
          type="button"
          onClick={() => toggleSection('flowers')}
          className="w-full flex items-center justify-between font-bold text-[14px] uppercase tracking-wider select-none"
        >
          <span>Квіти</span>
          {openSections.flowers ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {openSections.flowers && (
          <div className="mt-3 grid grid-cols-2 gap-2 text-[13px] font-medium">
            {flowers.map(fl => (
              <label key={fl.id} className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                <input
                  type="checkbox"
                  checked={filters.flowerTypes.includes(fl.slug)}
                  onChange={() => toggleFlower(fl.slug)}
                  className="rounded border-[#1E0B1A] text-[#1E0B1A] focus:ring-0 accent-[#1E0B1A] w-3.5 h-3.5"
                />
                <span className="truncate" title={fl.name}>{fl.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 4. Colour Section */}
      <div className="bg-[#F5B2E2] rounded-xl p-3.5 text-[#1E0B1A]">
        <button
          type="button"
          onClick={() => toggleSection('colour')}
          className="w-full flex items-center justify-between font-bold text-[14px] uppercase tracking-wider select-none"
        >
          <span>Колір</span>
          {openSections.colour ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {openSections.colour && (
          <div className="mt-3 flex flex-wrap gap-2.5 items-center">
            {colors.map(col => {
              const isSelected = filters.colors.includes(col.slug);
              const colorConfig = COLOR_HEX_MAP[col.slug] || { hex: '#D1D5DB' };
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => toggleColor(col.slug)}
                  style={{ backgroundColor: colorConfig.hex }}
                  className={`w-7 h-7 rounded-full transition-all flex items-center justify-center ${
                    colorConfig.border ? 'border border-[#1E0B1A]/30' : ''
                  } ${
                    isSelected
                      ? 'ring-2 ring-[#1E0B1A] ring-offset-2 ring-offset-[#F5B2E2] scale-110 shadow-sm'
                      : 'hover:scale-105 opacity-90 hover:opacity-100'
                  }`}
                  aria-label={col.name}
                  title={col.name}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Reset & Apply Buttons */}
      <div className="pt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={onReset}
          className="flex-1 py-2 px-3 rounded-full border border-[#F5B2E2] text-[#F5B2E2] hover:bg-[#F5B2E2]/10 text-[13px] font-semibold tracking-wider transition-colors"
        >
          Скинути
        </button>
        <button
          type="button"
          onClick={onApply}
          className="flex-1 py-2 px-3 rounded-full bg-[#F5B2E2] hover:bg-[#FDBDE9] text-[#1E0B1A] text-[13px] font-bold tracking-wider transition-colors shadow-md"
        >
          Застосувати
        </button>
      </div>
    </aside>
  );
};
