import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import type { FilterState, CatalogFacetItem } from '../../types/catalog';
import { DEFAULT_FACETS } from '../../services/api';
import { ColourPicker } from './ColourPicker';

interface FilterSidebarProps {
  filters: FilterState;
  onChangeFilters: (newFilters: FilterState) => void;
  onReset: () => void;
  onApply: () => void;
  onClose?: () => void;
  facets?: CatalogFacetItem[];
  className?: string;
}

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

        {openSections.price && (() => {
          const minVal = filters.minPrice ?? 500;
          const maxVal = filters.maxPrice ?? 3500;
          const minPercent = Math.round(((minVal - 500) / (3500 - 500)) * 100);
          const maxPercent = Math.round(((maxVal - 500) / (3500 - 500)) * 100);

          return (
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-2 text-[13px]">
                <div className="flex-1 flex items-center bg-white/90 rounded px-2 py-1 focus-within:ring-2 focus-within:ring-[#1E0B1A]">
                  <input
                    type="number"
                    min={500}
                    max={maxVal - 50}
                    step={50}
                    value={minVal}
                    onChange={e => {
                      const val = Math.max(500, Math.min(Number(e.target.value), maxVal - 50));
                      onChangeFilters({ ...filters, minPrice: val });
                    }}
                    className="w-full bg-transparent text-center font-bold text-[#1E0B1A] focus:outline-none text-[13px]"
                    aria-label="Мінімальна ціна"
                  />
                  <span className="text-[12px] font-bold text-[#1E0B1A] pr-1">₴</span>
                </div>
                <span className="font-bold">—</span>
                <div className="flex-1 flex items-center bg-white/90 rounded px-2 py-1 focus-within:ring-2 focus-within:ring-[#1E0B1A]">
                  <input
                    type="number"
                    min={minVal + 50}
                    max={3500}
                    step={50}
                    value={maxVal}
                    onChange={e => {
                      const val = Math.min(3500, Math.max(Number(e.target.value), minVal + 50));
                      onChangeFilters({ ...filters, maxPrice: val });
                    }}
                    className="w-full bg-transparent text-center font-bold text-[#1E0B1A] focus:outline-none text-[13px]"
                    aria-label="Максимальна ціна"
                  />
                  <span className="text-[12px] font-bold text-[#1E0B1A] pr-1">₴</span>
                </div>
              </div>

              {/* Dual Range Track */}
              <div className="relative pt-3 pb-2 flex items-center">
                <div className="w-full h-1.5 bg-[#1E0B1A]/20 rounded-full" />
                <div
                  className="absolute h-1.5 bg-[#1E0B1A] rounded-full pointer-events-none"
                  style={{
                    left: `${minPercent}%`,
                    width: `${Math.max(0, maxPercent - minPercent)}%`,
                  }}
                />
                <input
                  type="range"
                  min={500}
                  max={3500}
                  step={50}
                  value={minVal}
                  onChange={e => {
                    const value = Math.min(Number(e.target.value), maxVal - 50);
                    onChangeFilters({ ...filters, minPrice: value });
                  }}
                  aria-label="Мінімальна ціна слайдер"
                  className={`absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4.5 [&::-webkit-slider-thumb]:h-4.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1E0B1A] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#F5B2E2] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4.5 [&::-moz-range-thumb]:h-4.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#1E0B1A] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#F5B2E2] [&::-moz-range-thumb]:cursor-pointer ${
                    minVal > 3000 ? 'z-20' : 'z-10'
                  }`}
                />
                <input
                  type="range"
                  min={500}
                  max={3500}
                  step={50}
                  value={maxVal}
                  onChange={e => {
                    const value = Math.max(Number(e.target.value), minVal + 50);
                    onChangeFilters({ ...filters, maxPrice: value });
                  }}
                  aria-label="Максимальна ціна слайдер"
                  className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4.5 [&::-webkit-slider-thumb]:h-4.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1E0B1A] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#F5B2E2] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4.5 [&::-moz-range-thumb]:h-4.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#1E0B1A] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#F5B2E2] [&::-moz-range-thumb]:cursor-pointer z-10"
                />
              </div>
            </div>
          );
        })()}
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
          <span className="flex items-center gap-1.5">
            Колір
            {filters.colors.length > 0 && (
              <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1E0B1A] px-1 text-[10px] font-bold text-[#F5B2E2]">
                {filters.colors.length}
              </span>
            )}
          </span>
          {openSections.colour ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {openSections.colour && (
          <div className="mt-3">
            <ColourPicker
              colors={colors}
              selectedColors={filters.colors}
              onToggleColor={toggleColor}
              onClearColors={() => onChangeFilters({ ...filters, colors: [] })}
            />
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
